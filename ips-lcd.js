const drivers = require('./drivers');
const fs = require('fs');
const path = require('path');

module.exports = function(RED){
    var displays = {};

    function IpsLcdConfig(config){
        RED.nodes.createNode(this,config);
        var self = this;
        self.config = {
            port:parseInt(config.port),
            cs:parseInt(config.cs),
            dc:parseInt(config.dc),
            backlight: parseInt(config.backlight),
            rst: parseInt(config.rst),
            spi_speed_hz: parseInt(config.speed),

            width: parseInt(config.width),
            height: parseInt(config.height), 
            rotation: parseInt(config.rotation),
            offset_left:parseInt(config.offset_left),
            offset_top: parseInt(config.offset_top),
            invert: config.invert === 'False'? false:true,
        }
        // console.log('ips-lcd.js : config => ',self.config);

        try{
            switch(config.driver){
                case "ST7735S":
                    displays[self.id] = new drivers.ST7735S(self.config);
                    displays[self.id].begin();
                    break;
                default:
                    self.error('Unsupported driver');
            }
        }catch(e){  
            console.log('#################### IPS LCD Error #####################')
            self.error(e);
        }
    }
    RED.nodes.registerType('ips-lcd-config', IpsLcdConfig);


    function TurnOn(node){
        var self = this
		RED.nodes.createNode(self, node)
		self.display = displays[node.display]
        self.on('input', async function(_) {
            try{
                await self.display.setBacklight(1)
            }
            catch(e){
                self.error(e);
            }
        })
    }
    RED.nodes.registerType('Turn-On', TurnOn);

    function TurnOff(node){
        var self = this
		RED.nodes.createNode(self, node)
		self.display = displays[node.display]
        self.on('input', async function(_) {
            try{
                self.display.setBacklight(0)
            }
            catch(e){
                self.error(e);
            }
        })
    }
    RED.nodes.registerType('Turn-Off', TurnOff);

    function Background(node){
        var self = this
		RED.nodes.createNode(self, node)
		self.display = displays[node.display]
        self.on('input', async function(msg) {
            const color = validateColor(self,msg.payload);
            if(color !== null){
                self.display.drawBackground(color.r,color.g,color.b)
            }
        })
    }
    RED.nodes.registerType('Background', Background);

    function Ellipse(node){
        var self = this
		RED.nodes.createNode(self, node)
		self.display = displays[node.display]
        self.on('input', async function(msg) {
            var outline = validateColor(self,msg.payload.outline);
            if(outline === null){
                outline = {
                    r:255,
                    g:255,
                    b:255
                }
            }

            var fill = validateColor(self,msg.payload.fill);
            if(fill === null){
                fill = {
                    r:255,
                    g:255,
                    b:255
                }
            }

            var width ,x0, y0, x1, y1;
            try{
                if(typeof(msg.payload['x0']) === 'undefined'){
                    self.error('Missing "x0" parameter')
                    return;
                } 
                if(typeof(msg.payload['x1']) === 'undefined'){
                    self.error('Missing "x1" parameter')
                    return;
                }
                if(typeof(msg.payload['y0']) === 'undefined'){
                    self.error('Missing "y0" parameter')
                    return;
                }
                if(typeof(msg.payload['y1']) === 'undefined'){
                    self.error('Missing "y1" parameter')
                    return;
                }
                x0 = parseInt(msg.payload.x0);
                x1 = parseInt(msg.payload.x1);
                y0 = parseInt(msg.payload.y0);
                y1 = parseInt(msg.payload.y1);

                width = typeof(msg.payload.width) !== 'undefined' ? parseInt(msg.payload.width) : 1;

                self.display.drawEllipse(x0,y0,x1,y1,{
                    outline,
                    fill,
                    width
                })
            }catch(e){
                // width is not an integer
                self.error(e);
                return;
            }
        })
    }
    RED.nodes.registerType('Ellipse', Ellipse);

    function Lines(node){
        var self = this
		RED.nodes.createNode(self, node)
		self.display = displays[node.display]
        self.on('input', async function(msg) {
            var points = msg.payload.points
            if(typeof(points) === 'undefined'){
                self.error('An array of "points" is required.');
                return;
            }
            if(points < 4){
                self.error('Needs to have at least 2 points to draw a line');
                return;
            }
            var fill = validateColor(self,msg.payload.fill);
            if(fill === null){
                fill = {
                    r:255,
                    g:255,
                    b:255
                }
            }
            var width ;
            try{
                width = typeof(msg.payload.width) !== 'undefined' ? parseInt(msg.payload.width) : 1;
                self.display.drawLine(points,{
                    fill,
                    width
                })
            }catch(e){
                self.error(e);
                return;
            }
        })
    }
    RED.nodes.registerType('Lines', Lines);

    function Pixels(node){
        var self = this
		RED.nodes.createNode(self, node)
		self.display = displays[node.display]
        self.on('input', async function(msg) {
            var points = msg.payload.points
            if(typeof(points) === 'undefined'){
                self.error('An array of "points" is required.')
                return;
            }
            if(points < 2){
                self.error('Needs to have at least 1 point to draw a line');
                return;
            }
            var fill = validateColor(self,msg.payload.fill);
            if(fill === null){
                fill = {
                    r:255,
                    g:255,
                    b:255
                }
            }
            try{
                self.display.drawPoint(points,{
                    fill
                })
            }catch(e){
                self.error(e);
                return;
            }
        })
    }
    RED.nodes.registerType('Pixels', Pixels);

    function Polygon(node){
        var self = this
		RED.nodes.createNode(self, node)
		self.display = displays[node.display]
        self.on('input', async function(msg) {
            var points = msg.payload.points
            if(typeof(points) === 'undefined'){
                self.error('An array of "points" is required.');
                return;
            }
            if(points < 4){
                self.error('Needs to have at least 2 point to draw a polygon');
                return;
            }

            var outline = validateColor(self,msg.payload.outline);
            if(outline === null){
                outline = {
                    r:255,
                    g:255,
                    b:255
                }
            }

            var fill = validateColor(self,msg.payload.fill);
            if(fill === null){
                fill = {
                    r:255,
                    g:255,
                    b:255
                }
            }
            try{
                self.display.drawPolygon(points,{
                    fill,
                    outline
                })
            }catch(e){
                self.error(e);
                return;
            }
        })
    }
    RED.nodes.registerType('Polygon', Polygon);

    function FillBox(node){
        var self = this
		RED.nodes.createNode(self, node)
		self.display = displays[node.display]
        self.on('input', async function(msg) {
            if(typeof(msg.payload['x0']) === 'undefined'){
                self.error('Bounding box "x0" coordinate is required');
                return;
            }
            if(typeof(msg.payload.y0) === 'undefined'){
                self.error('Bounding box "y0" coordinate is required');
                return;
            }
            if(typeof(msg.payload.width) === 'undefined'){
                self.error('Bounding box "width" coordinate is required');
                return;
            }
            if(typeof(msg.payload.height) === 'undefined'){
                self.error('Bounding box "height" coordinate is required');
                return;
            }

            var outline = validateColor(self,msg.payload.outline);
            if(outline === null){
                outline = {
                    r:255,
                    g:255,
                    b:255
                }
            }

            var fill = validateColor(self,msg.payload.fill);
            if(fill === null){
                fill = {
                    r:255,
                    g:255,
                    b:255
                }
            }

            try{
                const x0 = parseInt(msg.payload['x0']);
                const y0 = parseInt(msg.payload.y0);
                const x1 = parseInt(msg.payload.width);
                const y1 = parseInt(msg.payload.height);

                var weight = 1;
                if(typeof(msg.payload.weight) === 'undefined'){
                    weight = 1;
                }else{
                    weight = parseInt(msg.payload.weight);
                }

                self.display.drawRectangle(x0,y0,x1,y1,{
                    fill,
                    outline,
                    weight
                })
            }catch(e){
                self.error(e);
                return;
            }
        })
    }
    RED.nodes.registerType('FillBox', FillBox);

    function TextString(node){
        var self = this
		RED.nodes.createNode(self, node)
		self.display = displays[node.display]
        self.on('input', async function(msg) {
            if(typeof(msg.payload.text) === 'undefined'){
                self.error('Text is required')
                return;
            }
            if(typeof(msg.payload.x) === 'undefined'){
                self.error('Top left coordinate "x" is required')
                return;
            }
            if(typeof(msg.payload.y) === 'undefined'){
                self.error('Top left coordinate "y" is required')
                return;
            }
        
            var color = validateColor(self,msg.payload.color);
            if(color === null){
                color = {
                    r:255,
                    g:255,
                    b:255
                }
            }
            
            try{
                const x = parseInt(msg.payload.x);
                const y = parseInt(msg.payload.y);
                
                var config = {
                    color
                };
                var fontFullPath = null;
                if(typeof(msg.payload.font) !== 'undefined'){
                    if(!fs.existsSync(msg.payload.font)){
                        fontFullPath = "/usr/share/fonts/truetype/"+msg.payload.font;
                    }
                    if(!fs.existsSync(fontFullPath)){
                        self.warn(`Font ${fontFullPath} is not found!. Using default font.`);
                    }
                }
                if(fontFullPath!==null){
                    config['fontFullPath']=fontFullPath;
                }
                if(typeof(msg.payload.angle) !== 'undefined'){
                    var angle = parseFloat(msg.payload.angle);
                    config['angle'] = angle;
                }
                var fontSize = 1;
                if(typeof(msg.payload.fontSize) !== 'undefined'){
                    fontSize = parseInt(msg.payload.fontSize);
                }
                config['fontSize']=fontSize;

                self.display.drawText(msg.payload.text,x,y,config);
            }catch(e){
                self.error(e);
                return;
            }
        })
    }
    RED.nodes.registerType('TextString', TextString);

    function ImageShow(node){
        var self = this
		RED.nodes.createNode(self, node)
		self.display = displays[node.display]
        self.on('input', async function(msg) {
            if(typeof(msg.payload) === 'undefined'){
                self.error('Image filepath is required')
                return;
            }
            msg.payload = msg.payload.trim();
            if(typeof(msg.payload) !== "string"){
                self.error('Image filepath must be a string')
                return;
            }
            
            try{
                var imPath;
                if(msg.payload.includes('/')){
                    if(!fs.existsSync(msg.payload)){
                        self.error(`Image not found at ${msg.payload}`);
                        return;
                    }
                    imPath = msg.payload;
                    
                }else{
                    imPath = path.join(__dirname,'/assets/'+msg.payload)
                    if(!fs.existsSync(imPath)){
                        self.error(`Image not found at ${imPath}`);
                        return;
                    }
                }
                self.display.drawImage(imPath);
            }catch(e){
                self.error(e);
                return;
            }
        })
    }
    RED.nodes.registerType('ImageShow', ImageShow);

    function PlayGif(node){
        var self = this
		RED.nodes.createNode(self, node)
		self.display = displays[node.display]
        self.on('input', async function(msg) {
            if(typeof(msg.payload) === 'undefined'){
                self.error('Gif filepath is required')
                return;
            }
            msg.payload = msg.payload.trim();
            if(typeof(msg.payload) !== "string"){
                self.error('Gif filepath must be a string')
                return;
            }
            
            try{
                var imPath;
                if(msg.payload.includes('/')){
                    if(!fs.existsSync(msg.payload)){
                        self.error(`Gif not found at ${msg.payload}`);
                        return;
                    }
                    imPath = msg.payload;
                    
                }else{
                    imPath = path.join(__dirname,'/assets/'+msg.payload)
                    if(!fs.existsSync(imPath)){
                        self.error(`Gif not found at ${imPath}`);
                        return;
                    }
                }
                
                self.display.drawGifStart(imPath)
            }catch(e){
                self.error(e);
                return;
            }
        })
    }
    RED.nodes.registerType('PlayGif', PlayGif);

    function StopGif(node){
        var self = this
		RED.nodes.createNode(self, node)
		self.display = displays[node.display]
        self.on('input', async function(_) {
            try{
                self.display.drawGifStop()
            }catch(e){
                self.error(e);
                return;
            }
        })
    }
    RED.nodes.registerType('StopGif', StopGif);

    function TextScroll(node){
        var self = this
		RED.nodes.createNode(self, node)
		self.display = displays[node.display]
        self.on('input', async function(msg) {
            if(typeof(msg.payload.text) === 'undefined'){
                self.error('Text is required')
                return;
            }
        
            var color = validateColor(self,msg.payload.color);
            if(color === null){
                color = {
                    r:255,
                    g:255,
                    b:255
                }
            }
            
            try{
                const x = parseInt(msg.payload.x);
                const y = parseInt(msg.payload.y);
                
                var config = {
                    color
                };
                var fontFullPath = null;
                if(typeof(msg.payload.font) !== 'undefined'){
                    if(!fs.existsSync(msg.payload.font)){
                        fontFullPath = "/usr/share/fonts/truetype/"+msg.payload.font;
                    }
                    if(!fs.existsSync(fontFullPath)){
                        self.warn(`Font ${fontFullPath} is not found!. Using default font.`);
                    }
                }
                if(fontFullPath!==null){
                    config['fontFullPath']=fontFullPath;
                }
                if(typeof(msg.payload.angle) !== 'undefined'){
                    var angle = parseFloat(msg.payload.angle);
                    config['angle'] = angle;
                }
                var fontSize = 1;
                if(typeof(msg.payload.fontSize) !== 'undefined'){
                    fontSize = parseInt(msg.payload.fontSize);
                }
                config['fontSize']=fontSize;

                self.display.drawTextScrollStart(msg.payload.text,config);
            }catch(e){
                self.error(e);
                return;
            }
        })
    }
    RED.nodes.registerType('TextScroll', TextScroll);

    function TextStop(node){
        var self = this
		RED.nodes.createNode(self, node)
		self.display = displays[node.display]
        self.on('input', async function(_) {
            try{
                self.display.drawTextScrollStop()
            }catch(e){
                self.error(e);
                return;
            }
        })
    }
    RED.nodes.registerType('TextStop', TextStop);
}


function validateColor(self, msg){
    if(typeof(msg)==='undefined')
        return null
    try{
        const r = msg.r;
        const g = msg.g;
        const b = msg.b;
        if(
            (typeof(r) !== 'undefined') && 
            (typeof(g) !== 'undefined') &&
            (typeof(b) !== 'undefined')
        ){ 
            try{
                const r = parseInt(msg.r);
                const g = parseInt(msg.g);
                const b = parseInt(msg.b);
                if(r <0 || r >255){
                    node.warn('Invalid range or "r" value (0 ~ 255)');
                   return null;
                }
                if(g <0 || g >255){
                    node.warn('Invalid range or "g" value (0 ~ 255)');
                    return null;
                }
                if(b <0 || b >255){
                    node.error('Invalid range or "b" value (0 ~ 255)')
                    return null;
                }
                return {r,g,b};
            }
            catch(e){
                self.error(e)
                return null;
            }
        }else{
            self.error('Unknown payload format')
        }
    }
    catch(e){
        self.error(e);
    }
    return null;
}   