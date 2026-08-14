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

// All possible combinations of angles for arm1 and arm2
let possibleStates = [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]]; 

// State sequence when running the trained robot
let runStates

// Agent which will do the learning
let agent

// Remember the previous mode
let previousMode = ""


// Function that runs when the program starts
function setup() {
    // Create a canvas for drawing
    createCanvas(850, 850);

    // Setup the physics simulation
    setupPhysics()

    // Create the R matrix
    let R = createRMatrix(rewards)

    // Create a q-learning agent
    agent = createQAgent(R)

    // Setup the learning UI
    setupLearningUI()
}

// Function that runs over and over once setup() completes
function draw() {
    // Grey background
    background(240);

    // In training mode the simulated robot is moved to random positions and the distance moved is used to update the R matrix
    if (mode == "Training") {
        if (previousMode != "Training") {
            // If we have just entered the training mode we need to reset the last state indices to 0
            resetTraining()
        }

        // Use the physics engine to draw the robot using random movements
        let reward = drawPhysics(possibleStates, true)

        // If we get a reward update the R matrix cell for this movement to be the new average distance change for that movement
        if (reward != undefined) {
            addReward(reward); 
        }

        previousMode = "Training"
    }

    // In learning mode the agent is trained using the R matrix to update the Q matrix
    else if (mode == "Learning") {
        if (previousMode != "Learning") {
            // If we have just entered the learning mode, we need to reset the agent and start training it
            // The parameter is the number of training steps to run.
            // The Q matrix will be updated based on the rewards in the R matrix
            agent.train(100)
        }

        previousMode = "Learning"
    }

    // In running mode the agent is used to move the robot through a sequence of states based on the learning
    else if (mode == "Running") {
        if (previousMode != "Running") {
            // If we have just entered the running mode, we need to generate a sequence of states for the robot to run through
            runStates = generateRunStates();
        }

        // Use the physics engine to draw the robot using defined movements
        reward = drawPhysics(runStates, false)

        previousMode = "Running"
    }

    // If running in reset mode, reset the position of the robot to the start and continue the previous mode
    else if (mode == "Reset") {
        resetRobotPosition()

        mode = previousMode // return to previous mode
        showHideButtons()
        previousMode = "Reset"
    }

    // If running in LoadR mode, load the movements from file and update R, then turn off LoadR mode
    else if (mode == "LoadR") {
        loadRFromFile()

        mode = "" // turn off this mode
        previousMode = "LoadR"
    }

    // If running in SaveQ mode, save the Q matrix to a file and then turn off SaveQ mode
    else if (mode == "SaveQ") {
        saveQToFile()

        mode = "" // turn off this mode
        previousMode = "SaveQ"  
    }

    // Draw the learning UI with the R and Q matrix
    drawLearningUI()
}
