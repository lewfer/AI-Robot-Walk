import storage
import board
import digitalio

# Select a GPIO pin to act as a safety switch (e.g., GP14)
# Connect this pin to GND with a jumper wire to write code from your PC
switch = digitalio.DigitalInOut(board.GP14)
switch.direction = digitalio.Direction.INPUT
switch.pull = digitalio.Pull.UP

# If GP14 is NOT connected to GND, Python can write to the drive
# If GP14 IS connected to GND, your computer can write to the drive
storage.remount("/", readonly=not switch.value)