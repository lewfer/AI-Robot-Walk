// Library of code to simplify the simulator

//let bestStates = [[0, 0], [0, 1], [0, 2], [1, 2], [1, 0]]; // Each state corresponds to a pair of angles for arm1 and arm2


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

// Create the R matrix from the rewards array
function createRMatrix(rewards) {
    let R = new Matrix(num_states = rewards.length, action_names = ['M'])
    R.setMatrix(rewards)
    return R
}

// Create a Q-learning agent
function createQAgent(R) {
    let agent = new QAgent(R, -1)
    return agent
}

// Add a reward to the R matrix for the given movement, averaging with any previous rewards for that movement
function addReward(reward) {
    print(lastState2Index, lastState1Index)

    currentReward = agent.R.getValue(lastState2Index, 0, lastState1Index);
    rewardCounts[lastState2Index][0][lastState1Index] += 1;
    let numItems = rewardCounts[lastState2Index][0][lastState1Index];
    newReward = (currentReward * (numItems - 1) + reward) / numItems;

    //print(currentReward, numItems, newReward, newReward)
    agent.R.setValue(lastState2Index, 0, lastState1Index, newReward);
}


// Based on the agent's training (Q matrix), generate a sequence of states for the robot to run through 
function generateRunStates() {
    let runStates = [];

    // Start from a random state
    agent.runStart(Math.floor(Math.random() * agent.num_states));

    // Run for 10 steps and record the states
    for (let i = 0; i < 10; i++) {
        runStates.push(possibleStates[agent.current_state]);
        agent.runStep();
    }

    // Return the sequence of states for running the trained robot
    print("Run states: ", runStates);
    return runStates
}

function reset() {
    // Reset the robot to start position
    resetRobotPosition()
}

// Load the R matrix from movements.csv file with from, to and reward values
// From is a state index, to is a state index and reward is a number
// Read each row and update the R matrix to the new average distance change
function loadRFromFile() {
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
}

function saveQToFile() {
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
}