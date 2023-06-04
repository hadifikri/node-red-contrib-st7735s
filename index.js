const Drivers = require('./drivers');



async function main() {
    const ST7735S = new Drivers.ST7735S({
        port: 0,
        cs: 1,
        dc: 9,
        backlight: 25,
        rst: 24,
        invert: false,
        spi_speed_hz: 4000000,

        // width: 80,
        // height: 160, 
        // rotation: 90,
        offset_left: 24,
        offset_top: 0,
        path:'.'
    });

    await ST7735S.begin();
    await ST7735S.drawBackground(0, 0, 0);

    await ST7735S.drawPoint([
        0,0,
        ST7735S.width-1, 0,
        ST7735S.width-1, ST7735S.height - 1, 
        0, ST7735S.height - 1
    ],{
        fill:{r:0,g:255,b:0}
    });
    await sleep(3000);

    await ST7735S.drawEllipse(
        30, 
        30, 
        ST7735S.width - 30, 
        ST7735S.height - 30,
        {
            outline:{
                r:0,
                g:255,
                b:0
            },
            fill:{
                r:0,
                g:0,
                b:255
            },
            width:4
        }
    );
    await sleep(3000);

    await ST7735S.drawBackground(0, 0, 0);
    await ST7735S.drawLine([
        15,15,
        ST7735S.width-15, 15,
        ST7735S.width-15, ST7735S.height - 15, 
        15, ST7735S.height - 15,
        15,15,
    ],{
        fill:{r:255,g:0,b:0},
        width: 2
    });
    await sleep(3000);

    await ST7735S.drawBackground(0, 0, 0);
    await ST7735S.drawPolygon([
        ST7735S.width / 2, 10, 
        ST7735S.width - 10, ST7735S.height - 10, 
        10, ST7735S.height - 10
    ],{
        fill:{r:0,g:255,b:0},
        outline:{r:0,g:0,b:255},
    });
    await sleep(3000);

    await ST7735S.drawBackground(0, 0, 0);
    await ST7735S.drawRectangle(
        10, 10, 
        ST7735S.width - 10, ST7735S.height - 10,
        {
            fill:{r:255,g:0,b:0},
            outline:{r:0,g:0,b:255},
            weight:5
        }
    );
    await sleep(3000);

    await ST7735S.drawBackground(0, 0, 0);
    font = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    await ST7735S.drawText("Hello World!",5,3,{
        angle:90,
        fontFullPath :font,
        fontSize:8,
        color:{r:255,g:255,b:255}
    });
    await ST7735S.drawText("This is a line of text.",18,ST7735S.height - 10)
    await sleep(3000);

    await ST7735S.drawImage("./assets/cat.jpg");
    await sleep(3000);

    await ST7735S.drawGifStart("./assets/deployrainbows.gif");
    await sleep(5000);
    await ST7735S.drawGifStop();

    font = "/usr/share/fonts/truetype/piboto/Piboto-Italic.ttf"
    await ST7735S.drawTextScrollStart("End of functionalities test for ST7735S...",{
        fontFullPath:font,
        fontSize:30,
        color:{
            r:0,
            g:0,
            b:255
        }
    });
    await sleep(10000);
    await ST7735S.drawTextScrollStop();

    await ST7735S.drawImage("./assets/cat.jpg");
    await sleep(10000);
    await ST7735S.setBacklight(0)
    
    ST7735S.exit()
}

const sleep = (delay) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, delay)
    })
}



main();