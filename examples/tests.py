# Copyright (c) 2014 Adafruit Industries
# Author: Tony DiCola
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.
import time

import os
dir_path = os.path.join(os.path.dirname(os.path.realpath(__file__)),'../library')
print(dir_path)
import sys
sys.path.insert(0,dir_path)

# sys.path.insert(0, "..")

from drivers import ST7735S

st7735s = ST7735S(
    port=0,
    cs=1,
    dc=9,
    backlight=25,
    rst=24,
    invert=False,
    spi_speed_hz=4000000,
    offset_left=24,
    offset_top=0,
)

print("Draw background ...")
st7735s.drawbackground(255, 0, 0)
time.sleep(3)

print("Draw Ellipse ...")
st7735s.drawEllipse(30, 30, st7735s.width - 30, st7735s.height - 30)
time.sleep(3)

st7735s.drawbackground(0, 0, 0)
time.sleep(1)

print("Draw Line ...")
st7735s.drawLine(
    [15, 15, st7735s.width - 15, st7735s.height - 15], {"r": 255, "g": 0, "b": 0}, 2
)
st7735s.drawLine(
    [15, st7735s.height - 15, st7735s.width - 15, 15], {"r": 0, "g": 255, "b": 0}, 2
)
time.sleep(3)

print("Draw Point ...")
st7735s.drawPoint(
    [
        (10, 10),
        (st7735s.width - 10, 10),
        (10, st7735s.height - 10),
        (st7735s.width - 10, st7735s.height - 10),
    ],
    {"r": 0, "g": 255, "b": 0},
)
time.sleep(3)

st7735s.drawbackground(0, 0, 0)
time.sleep(1)

print("Draw polygon ...")
st7735s.drawPolygon(
    [
        (st7735s.width / 2, 10),
        (st7735s.width - 10, st7735s.height - 10),
        (10, st7735s.height - 10),
    ]
)
time.sleep(3)

st7735s.drawbackground(0, 0, 0)
time.sleep(1)

print("Draw rectangle ...")
st7735s.drawRectangle(
    10,
    10,
    st7735s.width - 10,
    st7735s.height - 10,
    fill={"r": 255, "g": 0, "b": 0},
    outline={"r": 0, "g": 0, "b": 255},
    weight=5,
)
time.sleep(3)

st7735s.drawbackground(0, 0, 0)
time.sleep(1)

print("Draw text ...")
font = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
st7735s.drawText("Hello World!", 5, 3, 90, font, 8)
st7735s.drawText("This is a line of text.", 18, st7735s.height - 10, 0)
time.sleep(3)

print("Draw Image ...")
st7735s.drawImage(os.path.join(os.path.dirname(os.path.realpath(__file__)),"../assets/cat.jpg"))
time.sleep(3)

st7735s.drawbackground(0, 255, 0)
time.sleep(1)

print("Draw Gif ...")
st7735s.drawGifStart(os.path.join(os.path.dirname(os.path.realpath(__file__)),"../assets/deployrainbows.gif"))
time.sleep(5)
st7735s.drawGifStop()
time.sleep(1)

st7735s.drawbackground(0, 0, 0)
time.sleep(1)

print("Draw text scroll ...")
font = "/usr/share/fonts/truetype/piboto/Piboto-Italic.ttf"
st7735s.drawTextScrollStart(
    "End of TFT display demonstration ...", font, 25, {"r": 0, "g": 255, "b": 0}
)
time.sleep(10)
st7735s.drawTextScrollStop()
time.sleep(1)

st7735s.drawbackground(0, 0, 0)
print("End ...")
