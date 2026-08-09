# AI-Robot-Walk

Workshop where we teach a one-legged robot to walk using reinforcement learning.

There are two project folders:

## p5_simulator
Robot simulation using matter.js and P5 with reinforcement learning to teach the robot to walk.
This can also load a movements.csv file from the robot into the R matrix and save a q matrix to a file.  In this way we can use the data from the robot, train it in the P5 code, and then use the R matrix to get the physical robot to walk.

## pico_robot
Physical robot code.  The robot makes random movements and saves them to the csv file.  This csv file can be used in the P5 code, which generates a new file qvalues.csv.  This file can be loaded by the robot so it walks correctly.

## Process
The end-to-end process for training the robot is:

### On the robot
1. Connect **pin 21** on the robot to start a training cycle.  Each training cycle makes 20 random movements.  The movements are recorded in a **movements.csv** file, e.g.:

    <pre>
    from,to,distance
    5,0,0.5
    0,4,-0.6
    4,5,0.2
    5,5,0.0
    5,1,0.0
    1,1,0.4
    1,2,0.0
    2,0,3.2
    0,5,-3.2
    5,5,-0.1
    5,5,0.0
    5,2,0.0
    2,1,1.4
    1,1,-1.8
    1,1,0.3
    1,4,-0.1
    4,2,0.2
    2,1,2.0
    1,4,-1.3
    </pre>

The from and to values are the states that the robot moves from and to.  The distance is the distance in cm that the robot moved when it performed that action.  

2. Run more training cycles by disconnecting and reconnecting **pin 21**.

3. Connect the Pico to a computer and download **movements.csv**

### In the P5 simulator
4. Load movements.csv into the P5 code (hit the **Load R** button)

5. Run the reinforcement learning in the P5 code (hit the **Learn** button)

6. Download the Q values (hit the **Save Q** button).  A file called **qvalues.csv** will be downloaded.  E.g.

    <pre>
    from,to,qvalue
    0,0,0.00
    0,1,0.00
    0,2,10.42
    0,3,0.00
    0,4,6.97
    0,5,0.00
    1,0,0.00
    1,1,0.00
    1,2,0.00
    1,3,5.63
    1,4,6.93
    1,5,0.00
    2,0,0.00
    2,1,8.42
    2,2,6.74
    2,3,5.78
    2,4,7.28
    2,5,0.00
    3,0,8.71
    3,1,0.39
    3,2,6.54
    3,3,0.00
    3,4,0.25
    3,5,6.79
    4,0,8.34
    4,1,5.77
    4,2,6.94
    4,3,0.00
    4,4,6.97
    4,5,3.42
    5,0,8.49
    5,1,4.21
    5,2,6.50
    5,3,0.00
    5,4,0.00
    5,5,7.24
    </pre>

This shows the q value for every possible state transition.

### Back on the robot
7. Connect **pin 14** and then reconnect the Pico to a computer (pin 14 allows writes to the file system on the Pico)

8. Copy the downloaded **qvalues.csv** to the **root folder** on the Pico

9. Connect **pin 22** on the robot to start running the robot based on the learnings.

10. Disconnect **pin 22** and reconnect it to run again.

11. If the robot isn't running well, do some more training (repeat the process)