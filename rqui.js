/*
 Code to handle the drawing of the UI
 */

 // Dimensions for drawing
let gridWidth = 400
let gridHeight = gridWidth
let headerHeight = 40
let footerHeight = 40

// Episode number for training
let episode
let numEpisodes = 1
let totalTrainedEpisodes = 0

let message = ""


function setupLearningUI() {
    createButtons()
}

// Draw loop
function drawLearningUI() {
    // Draw header messages
    textSize(20)
    y = 400
    text("R matrix", gridWidth / 2, y )
    text("Q matrix", gridWidth + gridWidth / 2, y )

    // Draw the matrices
    drawMatrix(agent.R, 0, y, episode != null)
    drawMatrix(agent.Q, gridWidth, y, true)    

}

// Draw a matrix (r or q)
// Note this code assumes there is only one action
function drawMatrix(m, x, y, doPlayPath) {
    // Compute parameters for drawing
    let header = 50
    let matrix = m.matrix
    let cols = matrix.length
    let rows = matrix[0][0].length
    let cellWidth = (gridWidth - header) / cols
    let cellHeight = (gridHeight - header) / rows

    // Save the drawing state and relocate the origin
    push()
    translate(x + header, y + header)

    // Draw states for the header columns and rows
    for (let r = 0; r < rows; r++) {
        text(r, -header / 2, cellHeight * r + cellHeight / 2)
    }
    for (let c = 0; c < cols; c++) {
        text(c, cellWidth * c + cellWidth / 2, -header / 2)
    }

    // Draw values in the matrix
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < rows; c++) {
            // Get value
            let value = Math.round(matrix[r][0][c]*10)/10

            // Draw cell with colour intensity proportional to value
            fill(map(value, 0, 100, 0, 255), 0, 0)
            rect(c * cellWidth, r * cellHeight, cellWidth, cellHeight)

            // Draw the value
            fill(255)
            text(value, cellWidth * c + cellWidth / 2, cellHeight * r + cellHeight / 2)
        }
    }

    // Highight the cell in the matrix if playing a path
    if (currentState != null) {
        noFill()
        strokeWeight(5)
        stroke(255)
        // if (previousState != null) {
        //     let c = currentState.state
        //     let r = previousState.state
        //     rect(c * cellWidth, r * cellHeight, cellWidth, cellHeight)
        // }
    }

    // Restore drawing state
    pop()
}

// Create the buttons
function createButtons() {
    let x = 0
    buttonTrain = createButton("Train")
    buttonTrain.position(x, height);
    buttonTrain.mousePressed(train);
    x += buttonTrain.width

    buttonLearn = createButton('Learn');
    buttonLearn.position(x, height);
    buttonLearn.mousePressed(learn);
    x += buttonLearn.width  
    
    buttonRun = createButton('Run');
    buttonRun.position(x, height);
    buttonRun.mousePressed(run);
    x += buttonRun.width    
}

// Show or hide buttons based on program status
function showHideButtons() {

}

// Train button handler
function train() {
    // episode = 0
    // mode = "Training"
}

// Learn button handler
function learn() {
}

// Run button handler
function run() {
}