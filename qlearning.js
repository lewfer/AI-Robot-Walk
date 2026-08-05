/*
 Code for q learning (reinforcement learning)
 */

/*
 * Helper functions
 * ------------------------------------------------------------------------------------------------
 */

// Max value from multi-dimensional array
function getMaxValue(a){
  return Math.max(...a.map(e => Array.isArray(e) ? getMaxValue(e) : e));
}

// Generate a 3d array
function matrix(a, b, c) {
    var result = []
    
    
    for(var i = 0; i < c; i++) {
      var result1 = []
      for(var j = 0; j < b; j++) {
          result1.push(new Array(a).fill(0))
      }
      result.push(result1.slice())
    }
    return result
}

// Intersection between two lists
function intersection(a,b) {
  let result = []
  for (let i=0; i<a.length; i++) {
    for (let j=0; j<b.length; j++) {
       if (a[i].action == b[j].action && a[i].next_state == b[j].next_state)
         result.push(a[i])
    }
  }
  return result
}


/*
 * Matrix class
 * ------------------------------------------------------------------------------------------------
 */


class Matrix {
  // Representation of a 3D matrix of state, action and next_state. 
  // Can be used to represent both R and Q

  constructor(num_states, action_names) {
    this.num_states = num_states
    this.num_actions = action_names.length
    this.action_names = action_names
  }
  
  createMatrix(value=-1) {
    // Create a matrix of the right shape containing the given value in each cell
    this.matrix = matrix(this.num_states, this.num_actions, this.num_states)
  }
  
  setMatrix(array) {
    this.matrix = array
  }
  
  setValue(state, action, next_state, value) {
    // Set the value of the cell referenced by the state, action and next_state
    this.matrix[state][action][next_state] = value  
  }
  
  getValue(state, action, next_state) {
    // Get the value in the cell referenced by the state, action and next_state
    let value = this.matrix[state][action][next_state]
    return value  
  }
  
  maxValue(state) {
    // Get the max value across all actions possible from the state
    let max_value = getMaxValue(this.matrix[state])
    return max_value  
   }
  
  possibleActions(state) {
    // Finds the possible actions from the given state

    // Get the row corresponding to the given state, which gives the possible next states
    let row = this.matrix[state]

    // Find the states that have a reward >=0.  These are the only valid states.  We use [0] because np.where returns a tuple
    let results = []
    for (let action=0; action<row.length; action++) {
      let next_states = row[action] // list of next states for this action
      for (let next_state=0; next_state<next_states.length; next_state++) {
        if (next_states[next_state]>=0) {
          results.push({action:action, next_state:next_state})
        }
      }
    }
    return results
  }
  
  bestActions(state) {
    // Finds the best actions from the given state"""

    //# Get the row corresponding to the given state, which gives the possible next states
    let row = this.matrix[state]

    //# Find the best (i.e. max) value in the row
    let best_value = getMaxValue(row)

    //# Find the actions corresponding to the best value
    let results = []
    for (let action=0; action<row.length; action++) {
      let next_states = row[action] // list of next states for this action
      for (let next_state=0; next_state<next_states.length; next_state++) {
        if (next_states[next_state]==best_value) {
          results.push({action:action, next_state:next_state})
        }
      }
    }

    return results   
  }
  
  copyFill(value) {
    // Make a copy of the matrix and fill cells with the value
    let new_matrix = new Matrix(this.num_states, this.action_names)
    new_matrix.createMatrix(value)
    return new_matrix  
   }
}


/*
 * QAgent class
 * ------------------------------------------------------------------------------------------------
 */


class QAgent {
  constructor(R, goal_state, gamma=0.8, alpha=1) {
    // Pass in your reward matrix and the goal state.  
    // Gamma is the discount rate.  This is applied to the "future q", so we only take part of the reward from the future.
    // Alpha is the learning rate.  Reduce alpha to make learning slower, but possibly more likely to find a solution in some cases.
    // If you have no specific goal state (e.g. a walking robot) use -1."""    
    this.Q = null
    this.R = R
    this.goal_state = goal_state
    this.num_states = R.num_states
    this.Q = R.copyFill(0)
    this.gamma = gamma              // discount rate
    this.alpha = alpha              // learning rate
    this.current_state = 0      
  }
  
  chooseRandomAction() {
    // Choose a random action from the possible actions from the current state"""

    // Get the possible actions from the current state
    let actions = this.R.possibleActions(this.current_state)

    // Choose one at random and return it
    let action = actions[Math.floor(Math.random() * actions.length)]
    return action   
  }
  
  chooseBestAction() {
    // Choose the best action from the possible actions from the current state"""

    // Get the possible actions from the current state
    let possible_actions = this.R.possibleActions(this.current_state)

    // Get the best actions from the current state, i.e. the ones that give the highest q-value
    // We may get one or more with the same q-value
    let best_actions = this.Q.bestActions(this.current_state)

    // Intersect the best_actions with the possible actions so we only return valid actions
    let actions = intersection(possible_actions, best_actions)

    // Choose one of the actions at random and return it
    let action = actions[Math.floor(Math.random() * actions.length)]    
    return action  
  }

  
  updateQ(action, next_state) {
    // Update the Q table based on the action.  This is the key of the learning part

    // Find the max value in the Q row (this is the best next Q following the action)
    let max_future_q = this.Q.maxValue(next_state)  
    
    let current_r = this.R.getValue(this.current_state, action, next_state)
    let current_q = this.Q.getValue(this.current_state, action, next_state)

    // Q learning formula - update the Q table current state with a little of the reward from the future

    // Simple version
    // new_q = int(current_r + self.gamma * max_future_q)

    // Complex version
    let new_q =  ((1-this.alpha) * current_q + this.alpha * (current_r + this.gamma * max_future_q))

    // Update q table with the new value
    this.Q.setValue(this.current_state, action, next_state, new_q)   
  }
  
  
  train(episode) {
    //Train for the given number of episodes

    // Run the search for a solution starting at the given state.  Assumes you have already trained the agent.
    action = this.trainStart (start_state)
    while (action != null) 
      action = trainStep () 
  }
  
  trainStart() {
    // Start the training

    // Choose a start state at random
    this.current_state = Math.floor(Math.random() * this.num_states)

    // Return the initial state
    return {action:null, state:this.current_state}
  }

  trainStep() {
    // Run the next training step

    // If we have reached the goal we can stop (return null)
    if (this.current_state == this.goal_state)
      return null
    else {
      // We haven't reached the goal

      // Choose one of the possible actions from the current state at random
      let action = this.chooseRandomAction() 
      
      // Update the Q table based on that action
      this.updateQ(action.action, action.next_state)

      // Move to the next state
      this.current_state = action.next_state

      // Return the chosen action
      return {action:this.R.action_names[action.action], state:action.next_state}
    }   
  }

  run (start_state) {
    // Run the search for a solution starting at the given state.  Assumes you have already trained the agent.
    action = this.runStart (start_state)
    while (action != null) 
      action = runStep () 
  }

  runStart (start_state) {
    // Start the search for a solution starting at the given state.  Assumes you have already trained the agent.

    // Set the current state
    this.current_state = start_state

    // Keep a track of the path found
    return {action:null, state:this.current_state}
  }
    
  runStep () {
    // Run the next step in the search for a solution
    if (this.current_state == this.goal_state) 
      return null
    else {
        // Choose the best action based on the Q table
        let action = this.chooseBestAction()

        // Move to the next state
        this.current_state = action.next_state

        // Return the chosen action
        return {action:this.R.action_names[action.action], state:action.next_state}
    } 
  }  
}