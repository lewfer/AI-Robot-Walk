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

    drawLearningUI()

}

