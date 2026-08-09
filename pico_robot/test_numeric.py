# Test 7 segment led display
import board
import busio as io
import time
import adafruit_ht16k33.segments

# Create display object
i2c = io.I2C(board.GP19, board.GP18) # SCL, SDA
display = adafruit_ht16k33.segments.Seg7x4(i2c, address=0x70)

## Clear
display.fill(0)

display.print(5.6, 1)
display.show()
time.sleep(2)

display.fill(0)
display.print(-2.1, 1)
display.show()
time.sleep(2)

