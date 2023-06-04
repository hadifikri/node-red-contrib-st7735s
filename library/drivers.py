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
from PIL import Image
from PIL import ImageDraw
from PIL import ImageFont
from threading import Thread, Event

import time
from ST7735 import ST7735
import sys

ST7735_TFTWIDTH = 80
ST7735_TFTHEIGHT = 160


class ST7735S:
    def __init__(
        self,
        port,
        cs,
        dc,
        backlight,
        rst,
        invert,
        spi_speed_hz,
        width=None,
        height=None,
        rotation=None,
        offset_left=None,
        offset_top=None,
    ):
        # print('')
        # print('')
        # print("----------------------------drivers.py start---------------------------------------")
        # print("drivers.py: port = ",port)
        # print("drivers.py: cs = ",cs)
        # print("drivers.py: dc = ",dc)
        # print("drivers.py: backlight = ", backlight)
        # print("drivers.py: rst = ", rst)
        # print("drivers.py: invert = ", invert)
        # print("drivers.py: spi_speed_hz = ", spi_speed_hz)
        # print("drivers.py: width = ", width)
        # print("drivers.py: height = ", height)
        # print("drivers.py: rotation = ", rotation)
        # print("drivers.py: offset_left = ", offset_left)
        # print("drivers.py: offset_top = ", offset_top)
        # print("----------------------------drivers.py end---------------------------------------")
        # print('')
        # print('')

        if width == None:
            width = ST7735_TFTWIDTH

        if height == None:
            height = ST7735_TFTHEIGHT

        if rotation == None:
            rotation = 90

        self.disp = ST7735(
            port,
            cs,
            dc,
            backlight=backlight,
            rst=rst,
            width=width,
            height=height,
            rotation=rotation,
            invert=invert,
            offset_left=offset_left,
            offset_top=offset_top,
            spi_speed_hz=spi_speed_hz,
        )

        self._stopGif_event = Event()
        self._gifThread = None

        self._stopScroll_event = Event()
        self._scrollThread = None

        # Initialize display.
        self.disp.begin()
        self.invert = invert
        self.WIDTH = self.disp.width

        self.HEIGHT = self.disp.height
        if self.invert:
            self.img = Image.new(
                "RGB", (self.WIDTH, self.HEIGHT), color=(255, 255, 255)
            )
        else:
            self.img = Image.new("RGB", (self.WIDTH, self.HEIGHT), color=(0, 0, 0))
        self.draw = ImageDraw.Draw(self.img)

        # print("drivers.py : Success on ST7735S.__init__()")

    @property
    def width(self):
        return self.disp.width

    @property
    def height(self):
        return self.disp.height

    def drawbackground(self, r=0, g=0, b=0):
        self.img = Image.new("RGB", (self.WIDTH, self.HEIGHT), color=(r, g, b))
        self.draw = ImageDraw.Draw(self.img)
        self.disp.display(self.img)

    def drawEllipse(
        self,
        x0,
        y0,
        x1,
        y1,
        outline={"r": 255, "g": 255, "b": 255},
        fill={"r": 255, "g": 255, "b": 255},
        width=1,
    ):
        self.draw.ellipse(
            [x0, y0, x1, y1],
            outline=(outline["r"], outline["g"], outline["b"]),
            fill=(fill["r"], fill["g"], fill["b"]),
            width=width,
        )

        self.disp.display(self.img)

    def drawLine(self, xy, fill={"r": 255, "g": 255, "b": 255}, width=1):
        self.draw.line(xy, (fill["r"], fill["g"], fill["b"]), width)
        self.disp.display(self.img)

    def drawPoint(self, points, fill={"r": 255, "g": 255, "b": 255}):
        self.draw.point(points, (fill["r"], fill["g"], fill["b"]))
        self.disp.display(self.img)

    def drawPolygon(
        self,
        points,
        outline={"r": 255, "g": 255, "b": 255},
        fill={"r": 255, "g": 255, "b": 255},
    ):
        self.draw.polygon(
            points,
            outline=(outline["r"], outline["g"], outline["b"]),
            fill=(fill["r"], fill["g"], fill["b"]),
        )
        self.disp.display(self.img)

    def drawRectangle(
        self,
        x,
        y,
        width,
        height,
        fill={"r": 255, "g": 255, "b": 255},
        outline={"r": 255, "g": 255, "b": 255},
        weight=1,
    ):
        self.draw.rectangle(
            (x, y, width, height),
            (fill["r"], fill["g"], fill["b"]),
            (outline["r"], outline["g"], outline["b"]),
            weight,
        )
        self.disp.display(self.img)

    def drawText(
        self,
        text,
        x,
        y,
        angle=0,
        fontFullPath=None,
        fontSize=1,
        color={"r": 255, "g": 255, "b": 255},
    ):
        position = (x, y)
        font = ImageFont.load_default()
        if fontFullPath != None:
            font = ImageFont.truetype(fontFullPath, fontSize)

        width, height = self.draw.textsize(text, font=font)
        # Create a new image with transparent background to store the text.
        textimage = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        # Render the text.
        textdraw = ImageDraw.Draw(textimage)
        textdraw.text(
            (0, 0), text, font=font, fill=(color["r"], color["g"], color["b"])
        )
        # Rotate the text image.
        rotated = textimage.rotate(angle, expand=1)
        # Paste the text into the image, using it as a mask for transparency.
        self.img.paste(rotated, position, rotated)

        self.disp.display(self.img)

    def drawImage(self, image_file=None):
        if image_file != None:
            image = Image.open(image_file)
            # Resize the image
            image = image.resize((self.width, self.height))
            # Draw the image on the display hardware.
            self.disp.display(image)

    def drawGifStart(self, image_file=None):
        if image_file != None:
            self._gifThread = Thread(
                target=self._playGif, args=(image_file, self._stopGif_event)
            )
            self._gifThread.daemon = True
            self._gifThread.start()

    def drawGifStop(self):
        self._stopGif_event.set()
        time.sleep(1)
        self._stopGif_event = Event()

    def drawTextScrollStart(
        self, text, fontFullPath=None, fontSize=1, color={"r": 255, "g": 255, "b": 255}
    ):
        font = ImageFont.load_default()
        if fontFullPath != None:
            font = ImageFont.truetype(fontFullPath, fontSize)

        size_x, size_y = self.draw.textsize(text, font)
        text_x = self.width
        text_y = (self.height - size_y) // 2

        self._scrollThread = Thread(
            target=self._scrollText,
            args=(
                text,
                text_x,
                text_y,
                size_x,
                font,
                (color["r"], color["g"], color["b"]),
                self._stopScroll_event,
            ),
        )
        self._scrollThread.daemon = True
        self._scrollThread.start()

    def drawTextScrollStop(self):
        self._stopScroll_event.set()
        time.sleep(1)
        self._stopScroll_event = Event()

    def setBacklight(self, value):
        self.disp.set_backlight(value)

    def _playGif(self, image_file, stopGif_event):
        image = Image.open(image_file)
        frame = 0
        while not stopGif_event.is_set():
            try:
                image.seek(frame)
                self.disp.display(image.resize((self.width, self.height)))
                frame += 1
                time.sleep(0.05)

            except EOFError:
                frame = 0

    def _scrollText(self, text, text_x, text_y, size_x, font, color, ev):
        t_start = time.time()
        while not ev.is_set():
            x = (time.time() - t_start) * 100
            x %= size_x + 160
            self.draw.rectangle((0, 0, self.width, self.height), (0, 0, 0))
            self.draw.text((int(text_x - x), text_y), text, font=font, fill=color)
            self.disp.display(self.img)
