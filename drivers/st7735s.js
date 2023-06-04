'use strict';
const { python } = require('pythonia');
const path = require('path');

const ST7735_TFTWIDTH = 80
const ST7735_TFTHEIGHT = 160

function ST7735S(config) {
    this._port = config.port
    this._cs = config.cs
    this._dc = config.dc
    this._backlight = config.backlight
    this._rst = config.rst
    this.width = config.width
    this.height = config.height

    if (typeof (this.width) === 'undefined' || this.width === null) {
        this.width = ST7735_TFTWIDTH
    }
    if (typeof (this.height) === 'undefined' || this.height === null) {
        this.height = ST7735_TFTHEIGHT
    }

    this._rotation = config.rotation
    this._offset_left = config.offset_left
    this._offset_top = config.offset_top
    this._invert = config.invert
    this._spi_speed_hz = config.spi_speed_hz
    this._ready = false;
}

ST7735S.prototype.begin = async function () {
    try {
        const sys = await python('sys');
        await sys.path.insert(0,path.join(__dirname, '../library'));
        const driver = await python('drivers')

        var config = {}

        if (typeof (this.width) !== 'undefined' && this.width != null) {
            config['width'] = this.width;
        }
        if (typeof (this.height) != 'undefined' && this.height !== null) {
            config['height'] = this.height;
        }
        if (typeof (this._rotation) !== 'undefined' && this._rotation !== null) {
            config['rotation'] = this._rotation;
        }
        if (typeof (this._offset_left) !== 'undefined' && this._offset_left !== null) {
            config['offset_left'] = this._offset_left;
        }
        if (typeof (this._offset_top) !== 'undefined' && this._offset_top !== null) {
            config['offset_top'] = this._offset_top;
        }
        try{
            if (Object.keys(config).length === 0) {
                this._st7735s = await driver.ST7735S(
                    this._port,
                    this._cs,
                    this._dc,
                    this._backlight,
                    this._rst,
                    this._invert,
                    this._spi_speed_hz
                );
            } else {
                this._st7735s = await driver.ST7735S$(
                    this._port,
                    this._cs,
                    this._dc,
                    this._backlight,
                    this._rst,
                    this._invert,
                    this._spi_speed_hz,
                    config
                );
            }
            // console.log('st7735s.js : this._st7735s => ',this._st7735s);
            
            this.width = await this._st7735s.width
            this.height = await this._st7735s.height

            this._ready = true;
        }catch(e){
            console.error(e)
        }
    } catch (e) {
        throw e
    }


};

ST7735S.prototype.setBacklight = async function (value) {
    if(!this._ready) return;
    await this._st7735s.setBacklight(value)
}

ST7735S.prototype.drawBackground = async function (r, g, b) {
    if(!this._ready) return;
    await this._st7735s.drawbackground(r, g, b);
}

ST7735S.prototype.drawEllipse = async function (
    x0,
    y0,
    x1,
    y1,
    options = {
        outline: { r: 255, g: 255, b: 255 },
        fill: { r: 255, g: 255, b: 255 },
        width: 1
    }
) {
    if(!this._ready) return;
    await this._st7735s.drawEllipse$(
        x0, y0, x1, y1,
        {
            outline: typeof (options.outline) !== 'undefined' ? options.outline : { r: 255, g: 255, b: 255 },
            fill: typeof (options.fill) !== 'undefined' ? options.fill : { r: 255, g: 255, b: 255 },
            width: typeof (options.width) !== 'undefined' ? options.width : 1
        }
    );
}

ST7735S.prototype.drawLine = async function (xy, options = { fill: { r: 255, g: 255, b: 255 }, width: 1 }) {
    if(!this._ready) return;
    await this._st7735s.drawLine$(xy, {
        fill: typeof (options.fill) !== 'undefined' ? options.fill : { r: 255, g: 255, b: 255 },
        width: typeof (options.width) !== 'undefined' ? options.width : 1
    })
}

ST7735S.prototype.drawPoint = async function (xy, options = { fill: { r: 255, g: 255, b: 255 } }) {
    if(!this._ready) return;
    await this._st7735s.drawPoint$(xy, {
        fill: typeof (options.fill) !== 'undefined' ? options.fill : { r: 255, g: 255, b: 255 },
    })
}

ST7735S.prototype.drawPolygon = async function (xy, options = { outline: { r: 255, g: 255, b: 255 }, fill: { r: 255, g: 255, b: 255 } }) {
    if(!this._ready) return;
    await this._st7735s.drawPolygon$(xy, {
        fill: typeof (options.fill) !== 'undefined' ? options.fill : { r: 255, g: 255, b: 255 },
        outline: typeof (options.outline) !== 'undefined' ? options.fioutlinell : { r: 255, g: 255, b: 255 },
    })
}

ST7735S.prototype.drawRectangle = async function (
    x0, y0,
    width, height,
    options = {
        fill: { r: 255, g: 255, b: 255 },
        outline: { r: 255, g: 255, b: 255 },
        weight: 1
    }
){
    if(!this._ready) return;
    await this._st7735s.drawRectangle$(x0, y0, width, height, {
        fill: typeof (options.fill) !== 'undefined' ? options.fill : { r: 255, g: 255, b: 255 },
        outline: typeof (options.outline) !== 'undefined' ? options.outline : { r: 255, g: 255, b: 255 },
        weight: typeof (options.weight) !== 'undefined' ? options.weight : 1
    })
}

ST7735S.prototype.drawText = async function (
    text,
    x,
    y,
    options = {
        angle: 0,
        fontFullPath: null,
        fontSize: 1,
        color: { r: 255, g: 255, b: 255 }
    }
) {
    if(!this._ready) return;
    var config = {};
    if (typeof (options.angle) !== 'undefined') {
        config['angle'] = options.angle;
    } else {
        config['angle'] = 0;
    }

    if (typeof (options.fontFullPath) !== 'undefined') {
        config['fontFullPath'] = options.fontFullPath;
    }
    if (typeof (options.fontSize) !== 'undefined') {
        config['fontSize'] = options.fontSize;
    }
    else {
        config['fontSize'] = 1;
    }
    if (typeof (options.color) !== 'undefined') {
        config['color'] = {
            r: typeof (options.color.r) !== 'undefined' ? options.color.r : 255,
            g: typeof (options.color.g) !== 'undefined' ? options.color.g : 255,
            b: typeof (options.color.b) !== 'undefined' ? options.color.b : 255,
        }
    }

    await this._st7735s.drawText$(text, x, y, config);
}

ST7735S.prototype.drawImage = async function (image_filename_path) {
    if(!this._ready) return;
    await this._st7735s.drawImage(image_filename_path)
}

ST7735S.prototype.drawGifStart = async function (image_filename_path) {
    if(!this._ready) return;
    await this._st7735s.drawGifStart(image_filename_path)
}

ST7735S.prototype.drawGifStop = async function () {
    if(!this._ready) return;
    await this._st7735s.drawGifStop()
}

ST7735S.prototype.drawTextScrollStart = async function (text, options = {
    fontFullPath: null,
    fontSize: 1,
    color: {
        r: 255,
        g: 255,
        b: 255
    }
}) {
    if(!this._ready) return;
    var config = {}
    if (typeof (options.fontFullPath) !== 'undefined') {
        config['fontFullPath'] = options.fontFullPath
    }
    if (typeof (options.fontSize) !== 'undefined') {
        config['fontSize'] = options.fontSize
    }
    if (typeof (options.color) !== 'undefined') {
        config['color'] = {
            r: typeof (options.color.r) !== 'undefined' ? options.color.r : 255,
            g: typeof (options.color.g) !== 'undefined' ? options.color.g : 255,
            b: typeof (options.color.b) !== 'undefined' ? options.color.b : 255,
        }
    }
    await this._st7735s.drawTextScrollStart$(text, config);
}

ST7735S.prototype.drawTextScrollStop = async function () {
    if(!this._ready) return;
    await this._st7735s.drawTextScrollStop();
}

ST7735S.prototype.exit = function () {
    python.exit();
}

module.exports = ST7735S;