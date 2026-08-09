# Test servo with kitronik robotics board

import PicoRobotics
import time

# Create robotics object
robot = PicoRobotics.KitronikPicoRobotics()

# Move servo 1 through different angles
robot.servoWrite(1, 20)
time.sleep(2)        
robot.servoWrite(1, 160)
time.sleep(2)        
robot.servoWrite(1, 90)