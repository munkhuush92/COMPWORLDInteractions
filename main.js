//Keyboard
var Key = {
  _pressed : {},
LEFT: 37,
RIGHT: 39,
UP: 38,
DOWN: 40,
D: 68,
  isDown: function(keyCode) {
     return this._pressed[keyCode];
   },

   onKeydown: function(event) {
     this._pressed[event.keyCode] = true;
   },

   onKeyup: function(event) {
     delete this._pressed[event.keyCode];
   }
 };

function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight +this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}
// no inheritance
function Background(game, spritesheet) {
    this.x = 0;
    this.y = 0;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
};

Background.prototype.draw = function () {
    this.ctx.drawImage(this.spritesheet,
                   this.x, this.y);
};

Background.prototype.update = function () {
};


function Batman(game) {
	this.facingRight = true;
    this.idleRightAnimation = new Animation(ASSET_MANAGER.getAsset("./img/batmanright.png"), 0, 0, 69, 68, 0.2, 6, true, false);
	this.idleLeftAnimation = new Animation(ASSET_MANAGER.getAsset("./img/batmanbackward.png"), 0, 0, 69, 68, 0.2, 6, true, true);
	this.leftWalkAnimation = new Animation(ASSET_MANAGER.getAsset("./img/batmanbackward.png"), 0, 204, 68, 68, 0.2, 5, true, false);
	this.rightWalkAnimation = new Animation(ASSET_MANAGER.getAsset("./img/batmanright.png"), 0, 204, 70, 68, 0.2, 5, true, false);
    this.punchrightAnimation = new Animation(ASSET_MANAGER.getAsset("./img/batmanright.png"), 0, 415, 70, 68, 0.2, 4, false, false);
	this.punchleftAnimation = new Animation(ASSET_MANAGER.getAsset("./img/batmanbackward.png"), 138, 415, 70, 68, 0.2, 3, false, true);
	this.jumpRightAnimation = new Animation(ASSET_MANAGER.getAsset("./img/batmanright.png"), 0, 277, 70, 68, 0.2, 5, false, true);
	this.jumpLeftAnimation = new Animation(ASSET_MANAGER.getAsset("./img/batmanbackward.png"), 0, 277, 70, 68, 0.2, 5, false, true);
   this.booming = false;
	//this.kicking = false;
    //endoftesting
    this.radius = 100;
	this.speed  = 100;
    this.ground = 300;
	
	//boxes 
	this.boxRange = {startX: 0, endX:0 };
	this.onBox = false;
	//rectangles of objects
	this.rectangles= [];
	this.rectangles.push({x: 85, y:300, width:73, height:60 });
	this.rectangles.push({x: 300, y:320, width:60, height:60 });
	this.rectangles.push({x: 0, y:280, width:85, height:80 });
	this.jumping = false;
	this.isCollidedRight = false;
	this.isCollidedLeft = false;
	this.isCollidedTop = false;
	this.isCollidedBottom = false;
	
	this.width = 40;
	this.height = 60;
    Entity.call(this, game, 170, 300);
}

Batman.prototype = new Entity();
Batman.prototype.constructor = Batman;


Batman.prototype.collide = function (other) {
    return ((this.x+15<=other.x && other.x<=(this.x+15+this.width)) || (this.x+15<=(other.x+other.width)&& (other.x+other.width)<=(this.x+15+this.width)))
			&& ((this.y<=other.y && other.y<=this.y+this.height) || (this.y<=other.y+other.height && other.y+other.height <=this.y+this.height));
};

Batman.prototype.collideLeft = function (otherone) {
    return (otherone.x+otherone.width)>=this.x && otherone.x+otherone.width< this.x+this.width;
};

Batman.prototype.collideRight = function (other) {
    return  (this.x+this.width <= other.x) && ( (this.y+this.height)<=(other.y+other.height)) ;
};


Batman.prototype.collideBottom = function (other) {
   return (this.y+this.height>other.y )
		&& (this.x+this.width>=other.x && this.x<=other.x+other.width )
};

Batman.prototype.update = function () {
	
	
		//detect collision
	for(var i =0; i<this.rectangles.length; i++){
		var cur = this.rectangles[i];
		if(this.collide(cur) ){
			
			if(this.collideRight(cur)){
				console.log("right");
				this.isCollidedRight = true;
				this.isCollidedLeft = false;
				this.isCollidedBottom = false;
				this.onBox = false;
				break;
			}
			if(this.collideLeft(cur)){
				console.log("left");
				this.isCollidedLeft = true;
				this.isCollidedRight = false;
				this.isCollidedBottom = false;
				this.onBox = false;
				break;
			}
			if(this.collideBottom(cur)){
				console.log("thisX " + this.x+"  otherX "+cur.x + " this x+width " + (this.x+this.width)+ " otherXwidth " + (cur.x+cur.width));
				this.isCollidedBottom = true;
				this.isCollidedLeft = false;
				this.isCollidedRight = false;
				this.y = cur.y-cur.height;
				this.onBox = true;
				this.boxRange.startX = cur.x;
				this.boxRange.endX = cur.x+cur.width;
				console.log(this.boxRange.startX + " " + this.boxRange.endX);
				break;
			}
			
			
		}else{
			if(!this.onBox){
				this.y = 300;
			}
		}
		//console.log(cur.y);

	}
	
		if (this.game.space) this.jumping = true;
	  if(this.game.boom){
      this.booming = true;
    }
	 if (this.jumping) {
        
		if(this.facingRight){
			if (this.jumpRightAnimation.isDone()) {
				this.jumpRightAnimation.elapsedTime = 0;
				this.jumping = false;
			}
			var jumpDistance = this.jumpRightAnimation.elapsedTime / this.jumpRightAnimation.totalTime;
		}else{
			if (this.jumpLeftAnimation.isDone()) {
				this.jumpLeftAnimation.elapsedTime = 0;
				this.jumping = false;
			}
			var jumpDistance = this.jumpLeftAnimation.elapsedTime / this.jumpLeftAnimation.totalTime;
		}
        
        var totalHeight = 200;

        if (jumpDistance > 0.5)
            jumpDistance = 1 - jumpDistance;

        var height = jumpDistance  * totalHeight;
        //var height = totalHeight*(-4 * (jumpDistance * jumpDistance - jumpDistance));
        this.y = this.ground - height;
    }
	
	
    if(this.booming){
		if(this.facingRight){
			 if(this.punchrightAnimation.isDone()){
				this.punchrightAnimation.elapsedTime = 0;
				this.booming = false;
			 }
			 
		}else{
			if(this.punchleftAnimation.isDone()){
				this.punchleftAnimation.elapsedTime = 0;
				this.booming = false;
			 }
			
		}
     

    }
	

    if(Key.isDown(Key.RIGHT)){
		if(this.x<600 && (!this.isCollidedRight || this.onBox)  ){
			this.x += this.game.clockTick * this.speed;
		}else if(this.jumping){
			this.x += this.game.clockTick * this.speed;
		}
		this.isCollidedLeft = false;
		this.facingRight = true;
    }else if (Key.isDown(Key.LEFT)){
		if(this.x>63 && (!this.isCollidedLeft || this.onBox) ){
			this.x -= this.game.clockTick * this.speed;
		}else if(this.jumping){
			this.x -= this.game.clockTick * this.speed;
		}
		 this.isCollidedRight =false;
		 this.facingRight = false;
    }
    Entity.prototype.update.call(this);
}

Batman.prototype.draw = function (ctx) {

	if(this.booming){
		if(this.facingRight){
			this.punchrightAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		}else{
			this.punchleftAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		}
      
	}else if(this.jumping){
		  if(this.facingRight){
			  this.jumpRightAnimation.drawFrame(this.game.clockTick, ctx, this.x + 17, this.y - 34);
		  }else{
			  this.jumpLeftAnimation.drawFrame(this.game.clockTick, ctx, this.x + 17, this.y - 34);
		  }
        
	}else{
	
		 if(Key.isDown(Key.RIGHT)){
			this.rightWalkAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		}else if (Key.isDown(Key.LEFT)){
			this.leftWalkAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);

		}else{
			if(this.facingRight){
				this.idleRightAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
			}else{
				this.idleLeftAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
			}
		}
		
    }

    Entity.prototype.draw.call(this);
}
///////////////////////////////////////////////////////////////////////////////////
function SuperAI(game) {
	this.facingRight = true;
    this.idleRightAnimation = new Animation(ASSET_MANAGER.getAsset("./img/guyright.png"), 17, 320, 140,106 , 0.2, 5, true, false);
	this.idleLeftAnimation = new Animation(ASSET_MANAGER.getAsset("./img/guy.png"), 17, 320, 140, 106, 0.2, 5, true, true);


	this.facingRight = true;

    this.booming = false;
    this.radius = 100;
	this.speed  = 100;
    this.ground = 300;
	this.x = 470;
	this.y = 300;
	
	this.width = 40;
	this.height = 60;
    Entity.call(this, game, 470, 300);
}

SuperAI.prototype = new Entity();
SuperAI.prototype.constructor = SuperAI;


SuperAI.prototype.update = function () {
	
	if(this.facingRight){
		
		this.x += this.game.clockTick * this.speed;
		if(this.x>=550){
			this.facingRight = false;
		}
	}else{
		this.x -= this.game.clockTick * this.speed;
		if(this.x<=340){
			this.facingRight = true;
		}
	}

    Entity.prototype.update.call(this);
}

SuperAI.prototype.draw = function (ctx) {
	if(this.facingRight){
		this.idleRightAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	}else{
		this.idleLeftAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	}
	
    Entity.prototype.draw.call(this);
}
///////////////////////////////////////////////////////////////////////////////

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/batmanright.png");
ASSET_MANAGER.queueDownload("./img/batmanbackward.png");
ASSET_MANAGER.queueDownload("./img/guy.png");
ASSET_MANAGER.queueDownload("./img/guyright.png");
ASSET_MANAGER.queueDownload("./img/background.jpg");
ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var batman = new Batman(gameEngine);
	var superman =  new SuperAI(gameEngine);
	
    gameEngine.init(ctx);
    gameEngine.start();
	var bg = new Background(gameEngine, ASSET_MANAGER.getAsset("./img/background.jpg"));
	gameEngine.addEntity(bg);
    gameEngine.addEntity(batman);
	gameEngine.addEntity(superman);
	
	
	
});
