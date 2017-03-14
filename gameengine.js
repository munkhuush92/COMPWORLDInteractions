// This game shell was happily copied from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

var socket = io.connect("http://76.28.150.193:8888");
var globalGameEngine = null;
	
	
socket.on('load', function (data) {
  if(data.studentname) {
    globalGameEngine.entities[1].x = data.mystate.batman_x,
    globalGameEngine.entities[1].y = data.mystate.batman_y,
	 globalGameEngine.entities[1].facingRight = data.mystate.batman_facingRight,
	globalGameEngine.entities[2].x = data.mystate.otherguy_x,
    globalGameEngine.entities[2].y = data.mystate.otherguy_y,
	globalGameEngine.entities[2].facingRight = data.mystate.otherguy_facingRight
  }
  document.getElementById("gameWorld").focus();
});

GameEngine.prototype.save = function (that) {
  var data = {
    batman_x: that.entities[1].x,
	batman_y: that.entities[1].y,
	batman_facingRight: that.entities[1].facingRight,
	otherguy_x: that.entities[2].x,
	otherguy_y: that.entities[2].y,
	otherguy_facingRight: that.entities[2].facingRight
  }
  socket.emit('save', { studentname: "Munkhbayar Ganbold", statename: "saved state", mystate: data});
	document.getElementById("gameWorld").focus();
}


window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();


function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
}

function GameEngine() {
    this.entities = [];
    this.showOutlines = false;
    this.ctx = null;
    this.click = null;
    this.mouse = null;
    this.wheel = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
	globalGameEngine = this;
}

GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.startInput();
	var that = this;
    this.timer = new Timer();
	this.saveRect = {
		x:600,
		y:40,
		width:150,
		height:50
	};
	this.loadRec = {
		x:600,
		y:100,
		width:150,
		height:50
	};
    console.log('game initialized');
}


GameEngine.prototype.start = function () {
    console.log("starting game");
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

function getMousePos(ctx, event) {
		 rect = ctx.canvas.getBoundingClientRect();
		return {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};
}

function isInside(pos, rect){
		return pos.x > rect.x && pos.x < rect.x+rect.width && pos.y < rect.y+rect.height && pos.y > rect.y
}

GameEngine.prototype.startInput = function () {
    console.log('Starting input');
    var that = this;
	
		this.ctx.canvas.addEventListener('click', function(evt) {
		var mousePos = getMousePos(that.ctx, evt);

		if (isInside(mousePos,that.saveRect)) {
			console.log("clicked save");
			globalGameEngine.save(globalGameEngine)
		}else if (isInside(mousePos,that.loadRec)){
			console.log("clicked load");
			socket.emit('load', 
				{ studentname: "Munkhbayar Ganbold",
				 statename: "saved state"});
			
		}
	}, false);
	
    this.ctx.canvas.addEventListener("keydown", function (e) {
        if (String.fromCharCode(e.which) === 'D'){
           that.boom = true;
           console.log('boom!');
         }else if(String.fromCharCode(e.which) === 'S'){
			 that.kick = true;
			 console.log('kick!');
		 }else if (String.fromCharCode(e.which) === ' ') {that.space = true;
			 
		 }else{
			   Key.onKeydown(e);
		 }
        e.preventDefault();
    }, false);
	
	 this.ctx.canvas.addEventListener("keyup", function (e) {
        Key.onKeyup(e);
        e.preventDefault();
    }, false);


    console.log('Input started');
}

GameEngine.prototype.addEntity = function (entity) {
    console.log('added entity');
    this.entities.push(entity);
}

GameEngine.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].draw(this.ctx);
    }
    this.ctx.restore();
}

GameEngine.prototype.update = function () {
    var entitiesCount = this.entities.length;

    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];

        if (!entity.removeFromWorld) {
            entity.update();
        }
    }

    for (var i = this.entities.length - 1; i >= 0; --i) {
        if (this.entities[i].removeFromWorld) {
            this.entities.splice(i, 1);
        }
    }
}

GameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
	this.space = null;
	this.kick = null;
    this.boom= null;
	
}

function Entity(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.removeFromWorld = false;
}

Entity.prototype.update = function () {
}

Entity.prototype.draw = function (ctx) {
	
	//drawing button
	this.game.ctx.strokeStyle = "#FF0000";
	this.game.ctx.font = '900 50px Eagle Lake';
    this.game.ctx.fillStyle = "#FFFF00";
    this.game.ctx.strokeText("Save", this.game.saveRect.x, this.game.saveRect.y+50);
    this.game.ctx.fillText("Save", this.game.saveRect.x, this.game.saveRect.y+50);
	this.game.ctx.strokeText("Load", this.game.loadRec.x, this.game.loadRec.y+50);
    this.game.ctx.fillText("Load", this.game.loadRec.x, this.game.loadRec.y+50);
	//end of drawing button
	
    if (this.game.showOutlines && this.radius) {
        this.game.ctx.beginPath();
        this.game.ctx.strokeStyle = "green";
        this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.game.ctx.stroke();
        this.game.ctx.closePath();
    }
}

Entity.prototype.rotateAndCache = function (image, angle) {
    var offscreenCanvas = document.createElement('canvas');
    var size = Math.max(image.width, image.height);
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    offscreenCtx.translate(size / 2, size / 2);
    offscreenCtx.rotate(angle);
    offscreenCtx.translate(0, 0);
    offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
    offscreenCtx.restore();
    //offscreenCtx.strokeStyle = "red";
    //offscreenCtx.strokeRect(0,0,size,size);
    return offscreenCanvas;
}
