import PicoRobotics
from time import sleep
import board
import busio as io
import digitalio
import adafruit_hcsr04
import os
import random
import adafruit_ht16k33.segments

# Create robotics object
robot = PicoRobotics.KitronikPicoRobotics()

# Create the sonar object connected to the given pins
sonar = adafruit_hcsr04.HCSR04(trigger_pin=board.GP3, echo_pin=board.GP2)

# Create display object
i2c = io.I2C(board.GP19, board.GP18) # SCL, SDA
display = adafruit_ht16k33.segments.Seg7x4(i2c, address=0x70)

# Train button (runs train mode when pressed)
trainButton = digitalio.DigitalInOut(board.GP21)
trainButton.direction = digitalio.Direction.INPUT
trainButton.pull = digitalio.Pull.UP

# Best move button (makes best move based on Q when pressed)
bestMoveButton = digitalio.DigitalInOut(board.GP22)
bestMoveButton.direction = digitalio.Direction.INPUT
bestMoveButton.pull = digitalio.Pull.UP


bestStates = [[0, 0], [0, 1], [0, 2], [1, 2], [1, 0]]; # Each state corresponds to a pair of angles for arm1 and arm2
possibleStates = [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]]; # All possible combinations of angles for arm1 and arm2
angles = [[120,180], [70,90,130]]

# robot.servoWrite(1, 90)
# robot.servoWrite(2, 0)
# sleep(3)

q = [ 
    [0,  0,  0,  0,  0, 0],
    [0,  0,  0,  0,  0, 0],
    [0,  0,  0,  0,  0, 0],
    [0,  0,  0,  0,  0, 0],
    [0,  0,  0,  0,  0, 0],
    [0,  0,  0,  0,  0, 0]
]


def loadQFromFile():
    global q
    
    firstRow = True
    with open("/qvalues.csv", "r") as file:
        for line in file:
            # Strip trailing newlines and whitespace
            cleaned_line = line.strip()
            
            # Skip empty lines
            if not cleaned_line:
                continue
                
            # Split the row into a list of items using the comma separator
            row = cleaned_line.split(",")
            
            # Print the resulting list
            #print(row)
            
            if not firstRow:
                fromState = int(row[0])
                toState = int(row[1])
                qValue = float(row[2])
                print(fromState, toState, qValue)
                q[fromState][toState] = qValue
                
            
            firstRow = False
            
    print(q)
    
def startBestMove():
    loadQFromFile()


def getBestMove(currentStateIndex):
    options = q[currentStateIndex]
    print(options)
    return options.index(max(options))

def run():
    currentStateIndex = random.randint(0, len(possibleStates)-1)
    for i in range(20):
        print("Current State: ", currentStateIndex)
        moveServos(possibleStates[currentStateIndex])
        sleep(2)
        currentStateIndex = getBestMove(currentStateIndex)

def file_exists(filename):
    try:
        os.stat(filename)
        return True
    except OSError:
        return False

def moveServos(currentState):
    # Get next state angles
    angle1 = angles[0][currentState[0]]
    angle2 = angles[1][currentState[1]]
    
    # Move to those angles
    robot.servoWrite(1, angle1)
    robot.servoWrite(2, angle2)
        

# Train the robot.  Do random movements and measure the distance moved for each movement.
# Append the movements (from,to,distance) to the csv file
def train():
    # Create the CSV file if it doesn't exist
    if not file_exists("movements.csv"):
        with open("movements.csv", "a") as fp:
            fp.write('from,to,distance\n')  # headings
        
    # Intialise states
    #stateStr = ""
    #prevStateStr = ""
    currentStateIndex = -1
    prevStateIndex = -1
    prevDistance = 0

    # Make 20 movements, recording the movements to a file
    with open("movements.csv", "a") as fp:
        for i in range(20):
            # Get next state from best states
    #         currentStateIndex = i % len(bestStates)
    #         currentState = bestStates[currentStateIndex]
    #         stateStr = str(currentState[0]) + str(currentState[1])
            
            # Choose a random state
            currentStateIndex = random.randint(0, len(possibleStates)-1)
            currentState = possibleStates[currentStateIndex]
            #stateStr = str(currentState[0]) + str(currentState[1])
            
            # Move to current state
            moveServos(currentState)
            
            ## Wait for movements to take effect
            sleep(0.5)
            
            # Read the distance from the ultrasonic
            distance = sonar.distance
            movement = round(distance-prevDistance,1)
            
            display.fill(0)
            display.print(movement, 1)
            display.show()
            sleep(2)

            # Write the movement to the csv file
            # fp.write(prevStateStr + "," + stateStr + "," + str(round(distance,1)) + "\n")
            if prevStateIndex!=-1:
                
                print("movement:", prevStateIndex,",", currentStateIndex, ",", movement)
                fp.write(str(prevStateIndex) + "," + str(currentStateIndex) + "," + str(movement) + "\n")
         
            #prevStateStr = stateStr
            prevStateIndex = currentStateIndex
            prevDistance = distance


# Wait for and act on a command
# Commands are given by pressing a button
while True:
    if not trainButton.value:
        print("Train")
        train()
        while not trainButton.value: pass # wait for button release
    elif not bestMoveButton.value:
        print("Best Move")
        startBestMove()
        run()
        while not bestMoveButton.value: pass # wait for button release
        
        
    sleep(2)



