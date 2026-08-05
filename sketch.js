// Teach a robot to walk
// The robot is a simple two-segment arm attached to a car chassis. 
// The arm is controlled by two joints, which are animated to create a walking motion. 
// The goal is to have the robot push itself forward using the arm segments.


let rewards = [ 
  //#  ----------- Move ----------
  //#  to   to   to   to   to   to
  //#   0    1    2    3    4    5
      [[ 0,   0,   0,   0,   0,   0]],  //# from 0
      [[ 0,   0,   0,   0,   0,   0]],  //# from 1
      [[ 0,   0,   0,   0,   0,   0]],  //# from 2
      [[ 0,   0,   0,   0,   0,   0]],  //# from 3
      [[ 0,   0,   0,   0,   0,   0]],  //# from 4
      [[ 0,   0,   0,   0,   0,   0]]   //# from 5
]   

// So we can compute average
let rewardCounts = [ 
  //#  ----------- Move ----------
  //#  to   to   to   to   to   to
  //#   0    1    2    3    4    5
      [[ 0,   0,   0,   0,   0,   0]],  //# from 0
      [[ 0,   0,   0,   0,   0,   0]],  //# from 1
      [[ 0,   0,   0,   0,   0,   0]],  //# from 2
      [[ 0,   0,   0,   0,   0,   0]],  //# from 3
      [[ 0,   0,   0,   0,   0,   0]],  //# from 4
      [[ 0,   0,   0,   0,   0,   0]]   //# from 5
]    

// Agent which will do the learning
let agent

function setup() {
  createCanvas(850, 850);

  setupPhysics()

    // Create the R matrix
  let R = new Matrix(num_states=rewards.length, action_names=['M'])
  R.setMatrix(rewards)

  // Create a q-learning agent
  agent = new QAgent(R, goal_state=0)

  setupLearningUI()
}



function draw() {
    let reward = drawPhysics()

    if (reward != undefined) {

      // Update the R matrix based on the distance change
      currentReward = agent.R.getValue(lastState2Index, 0, lastState1Index)
      rewardCounts[lastState2Index][0][lastState1Index] += 1
      let numItems =rewardCounts[lastState2Index][0][lastState1Index]
      newReward = (currentReward * (numItems-1) + reward) / numItems; // Compute the new average reward
      
      print(currentReward, numItems, newReward, newReward)
      agent.R.setValue(lastState2Index, 0, lastState1Index, newReward); 

  }
    drawLearningUI()

}

