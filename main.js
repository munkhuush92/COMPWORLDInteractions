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
	
	this.jumping = false;
	
	this.width = 40;
	this.height = 60;
    Entity.call(this, game, 170, 300);
}

Batman.prototype = new Entity();
Batman.prototype.constructor = Batman;

Batman.prototype.update = function () {
	
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
		if(this.x<570){
      this.x += this.game.clockTick * this.speed;
		}
	  this.facingRight = true;
    }else if (Key.isDown(Key.LEFT)){
		if(this.x>100){
			this.x -= this.game.clockTick * this.speed;
		}
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

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/batmanright.png");
ASSET_MANAGER.queueDownload("./img/batmanbackward.png");
ASSET_MANAGER.queueDownload("./img/background.jpg");
ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var batman = new Batman(gameEngine);
	
	
    gameEngine.init(ctx);
    gameEngine.start();
	var bg = new Background(gameEngine, ASSET_MANAGER.getAsset("./img/background.jpg"));
	gameEngine.addEntity(bg);
    gameEngine.addEntity(batman);
	
});
