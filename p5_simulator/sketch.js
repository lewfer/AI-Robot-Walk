// Teach a robot to walk
// The robot is a simple two-segment arm attached to a car chassis. 
// The arm is controlled by two joints, which are animated to create a walking motion. 
// The goal is to have the robot push itself forward using the arm segments.

let mode = ""

let rewards = [
    //#  ----------- Move ----------
    //#  to   to   to   to   to   to
    //#   0    1    2    3    4    5
    [[0, 0, 0, 0, 0, 0]],  //# from 0
    [[0, 0, 0, 0, 0, 0]],  //# from 1
    [[0, 0, 0, 0, 0, 0]],  //# from 2
    [[0, 0, 0, 0, 0, 0]],  //# from 3
    [[0, 0, 0, 0, 0, 0]],  //# from 4
    [[0, 0, 0, 0, 0, 0]]   //# from 5
]

// So we can compute average
let rewardCounts = [
    //#  ----------- Move ----------
    //#  to   to   to   to   to   to
    //#   0    1    2    3    4    5
    [[0, 0, 0, 0, 0, 0]],  //# from 0
    [[0, 0, 0, 0, 0, 0]],  //# from 1
    [[0, 0, 0, 0, 0, 0]],  //# from 2
    [[0, 0, 0, 0, 0, 0]],  //# from 3
    [[0, 0, 0, 0, 0, 0]],  //# from 4
    [[0, 0, 0, 0, 0, 0]]   //# from 5
]

let bestStates = [[0, 0], [0, 1], [0, 2], [1, 2], [1, 0]]; // Each state corresponds to a pair of angles for arm1 and arm2
let possibleStates = [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]]; // All possible combinations of angles for arm1 and arm2
let runStates = []

// Agent which will do the learning
let agent

function setup() {
    createCanvas(850, 850);

    setupPhysics()

    // Create the R matrix
    let R = new Matrix(num_states = rewards.length, action_names = ['M'])
    R.setMatrix(rewards)

    // Create a q-learning agent
    agent = new QAgent(R, goal_state = -1)

    setupLearningUI()
}

let previousMode = ""

function draw() {

    background(240);

    if (mode == "Training") {
        let reward;

        reward = drawPhysics(possibleStates, true)

        if (reward != undefined) {


            print(lastState2Index, lastState1Index)
            // Update the R matrix to the new average distance change
            currentReward = agent.R.getValue(lastState2Index, 0, lastState1Index)
            rewardCounts[lastState2Index][0][lastState1Index] += 1
            let numItems = rewardCounts[lastState2Index][0][lastState1Index]
            newReward = (currentReward * (numItems - 1) + reward) / numItems; // Compute the new average reward

            //print(currentReward, numItems, newReward, newReward)
            agent.R.setValue(lastState2Index, 0, lastState1Index, newReward);

        }
        previousMode = "Training"
    }
    else if (mode == "Learning") {
        if (previousMode != "Learning") {
            // Reset the agent to start from the first state
            agent.train(100)
        }

        //drawPhysics(possibleStates, false)
        previousMode = "Learning"
    }
    else if (mode == "Running") {
        if (previousMode != "Running") {
            // Start from random state
            runStates = []
            agent.runStart(Math.floor(Math.random() * agent.num_states))
            for (let i = 0; i < 10; i++) {
                runStates.push(possibleStates[agent.current_state])
                agent.runStep()
            }
            print("Run states: ", runStates)
        }

        reward = drawPhysics(runStates, false)
        lastState2Index = lastState1Index = 0

        previousMode = "Running"
    }
    else if (mode == "LoadR") {
        // Load the R matrix from movements.csv file with from, to and reward values
        // From is a state index, to is a state index and reward is a number
        // Read each row and update the R matrix to the new average distance change

        print("Loading R matrix from movements.csv")
        // Clear the R matrix and rewardCounts
        for (let from = 0; from < rewards.length; from++) {
            for (let to = 0; to < rewards[from][0].length; to++) {
                agent.R.setValue(from, 0, to, 0)
                rewardCounts[from][0][to] = 0
            }
        }

        // Open csv file and read each row
        table = loadTable('movements.csv', ',', 'header', function () {
            print(table)
            for (let r = 0; r < table.rows.length; r++) {
                print("Row: ", r, table.getString(r, 'from'))
                let from = table.getNum(r, 'from')
                let to = table.getNum(r, 'to')
                let reward = table.getNum(r, 'distance')
                print(from, to, reward)

                // Update the R matrix to the new average distance change
                currentReward = agent.R.getValue(from, 0, to)
                rewardCounts[from][0][to] += 1
                let numItems = rewardCounts[from][0][to]
                newReward = (currentReward * (numItems - 1) + reward) / numItems; // Compute the new average reward
                agent.R.setValue(from, 0, to, newReward);
            }
        })
        mode = ""
        previousMode = "LoadR"
    }
    else if (mode == "SaveQ") {
        // Save the Q matrix to a csv file with from, to and q-value
        print("Saving Q matrix to qvalues.csv")
        let csv = ["from,to,qvalue"]
        print(agent.Q.matrix[0])
        print(agent.Q.matrix.length, agent.Q.matrix[0][0].length)
        for (let from = 0; from < agent.Q.matrix.length; from++) {
            for (let to = 0; to < agent.Q.matrix[0][0].length; to++) {
                csv.push(`${from},${to},${agent.Q.getValue(from, 0, to).toFixed(2)}`)
                print(".")
            }
        }
        print(csv)
        saveStrings(csv, 'qvalues.csv')
        mode = ""
        previousMode = "SaveQ"  
    }

    drawLearningUI()

}

