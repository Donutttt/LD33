//WIDTH, HEIGHT, Renderer, element id, state
var game = new Phaser.Game(800,600, Phaser.AUTO, 'phaser-game', {preload: preload, create: create, update: update, render: render});

//used for input
var cursors;

//for map rendering
var map;

//...the player
var player;

//an emitter
var emitter;

//a controller for enemies
var enemyController;

//a controller for game information
var gameController;

//holds cash emitters
var cashEmitters = [];

//assets loaded for game
function preload(){

	//load the player image
	game.load.spritesheet('player', 'sprites/face.png');

	game.load.image('fatman', 'sprites/fatman.png')

	game.load.image('background', 'sprites/bg.png');

	game.load.image('smoke', 'sprites/smoke.png');

	game.load.image('money', 'sprites/money.png');

	console.log("Preload finished"); //test

}

//when the game is created
function create(){

	game.stage.backgroundColor = '#F2FAFF';

	game.world.resize(1600, 1600);

	//add the background image
	var background = game.add.tileSprite(0,0,800,600, 'background');

	//set the attributes
	background.height = game.world.height;
	background.width = game.world.width;

	//initialise the physics system
	game.physics.startSystem(Phaser.Physics.P2JS);

	game.physics.p2.setImpactEvents(true);

	//add the player to the game
	player = game.add.sprite(10, 10, 'player');

	//setup the player
	initPlayer(player);

	//enable physics for the player
	game.physics.p2.enable(player);

	//accepts cursor key input
	cursors = game.input.keyboard.createCursorKeys();

	//add the emitter for the jetpack
	emitter = game.add.emitter(0,0,100);

	initEmitter(emitter);

	//initialises the enemy controller
	initEnemyController();

	//initialises the game controller
	initGameController();

	enemyController.addFatMan();

	//follow the player
	game.camera.follow(player); 

	console.log("Create finished"); //test



}

//run updates to the game
function update(){

	//handle the input from the arrow keys
	handleInputForPlayer(cursors, player);

	//move the player
	movePlayer(player);

	//moves the emitter
	moveEmitter(emitter, player);

	//checks the level of enemies
	checkFatboyLevels();

	//checks emitter levels
	cycleCashEmitters();

	//see if player should be destroyed
	checkPlayerHealth()

}


//render the game
function render(){

	game.debug.text("Health: " + gameController.playerCurrentHealth, 32, 532);
	game.debug.text("Score: " + gameController.currentScore, 32, 564);


}

//initialises player variables
function initPlayer(playerTo){

	playerTo.maxBoost = 500;
	playerTo.forwardAcc = 5;

	playerTo.turnMaxSpeed = 100;
	playerTo.turnAcc = 5;

	playerTo.currentBoost = 0;
	playerTo.currentRotation = 0;

}


//handles input from the specified input object and player
function handleInputForPlayer(inputTo, playerTo){

	if (!gameController.ended){

		//when the up key is pressed, accelerate the player
		if (inputTo.up.isDown){

			//if the player can still accelerate
			if (playerTo.currentBoost < playerTo.maxBoost){
				playerTo.currentBoost += playerTo.forwardAcc;
			}

		} else {
			playerTo.currentBoost = 0;
		}

		//rotate the player if left or right is pressed
		if (inputTo.left.isDown){
			if (Math.abs(playerTo.currentRotation) < playerTo.turnMaxSpeed){
				playerTo.currentRotation -= playerTo.turnAcc;
			}
		}

		if (inputTo.right.isDown){
			if (Math.abs(playerTo.currentRotation) < playerTo.turnMaxSpeed){
				playerTo.currentRotation += playerTo.turnAcc;
			}
		}

		//stop rotating if no input
		if (inputTo.left.isUp && inputTo.right.isUp){

			playerTo.currentRotation = closerToZero(playerTo.currentRotation, playerTo.turnAcc);

		}

	}

}


//moves the palyer according to variables
function movePlayer(playerTo){

	if (!gameController.gameEnded){
		//move the player according to boost
		if (playerTo.currentBoost > 0){
			playerTo.body.moveForward(playerTo.currentBoost);
		}

		//rotate the player according to rotation
		playerTo.body.rotateRight(playerTo.currentRotation);
	}

}



//moves a number closer to zero by the amount specified
function closerToZero(startingNumber, changeNumber){

	//ensure cahgne is positive
	var changeValue = Math.abs(changeNumber);
	var returnValue = 0;

	//adjust number so that it is closer to 0
	if (startingNumber > 0) {
		returnValue = startingNumber - changeValue;
	} else if (startingNumber < 0){
		returnValue = startingNumber + changeValue;
	} else {
		returnValue = 0;
	}

	//if value is lower than amount to change, return 0
	if (Math.abs(returnValue) < changeNumber){
		return 0;
	} else {
		return returnValue;
	}

}

//initiailises an emitter
function initEmitter(emitterTo){

	emitterTo.makeParticles('smoke');
    emitterTo.minParticleSpeed.setTo(-100, 30);
    emitterTo.maxParticleSpeed.setTo(100, 100);
    emitterTo.minParticleScale = 0.5;
    emitterTo.maxParticleScale = 2;
    emitterTo.gravity = 0;
    emitterTo.flow(1000, 100, 1, -1);

}

//moves the emitter to the player
function moveEmitter(emitterTo, playerTo){

	switch (simplifyPlayerRotation(playerTo)){

		case 0: 
			emitterTo.x = playerTo.x - 20;
			emitterTo.y = playerTo.y + 10;
		break;


		case 1: 
			emitterTo.x = playerTo.x + 16;
			emitterTo.y = playerTo.y -10;
		break;

		case 2: 
			emitterTo.x = playerTo.x + 20;
			emitterTo.y = playerTo.y -10;
		break;

		case 3: 
			emitterTo.x = playerTo.x + 16;
			emitterTo.y = playerTo.y + 20;
		break;

		default:
			emitterTo.x = playerTo.x;
			emitterTo.y = playerTo.y;
		break;

	}


}

//simplifies player's rotation to a simple number
function simplifyPlayerRotation(playerTo){

	if (!gameController.gameEnded){

		var rotation = playerTo.body.rotation;

		//make the rotation a consistent rounded number
		rotation = Math.round((player.body.rotation / 1.5))%4;	

		//to inverse where necessary
		if (rotation == -1){
			rotation = -3;
		} else if (rotation == -3){
			rotation = -1;
		}

		return Math.floor(rotation);
	}

}


//initialises the enemy controller
function initEnemyController(){

	enemyController = {};

	//an array to hold data on fatmen enemiesw	
	enemyController.fatmen = [];

	enemyController.currentFatmen = 0;

	enemyController.maxFatmen = 10;

	//adds an enemy
	enemyController.addFatMan = function(){

		console.log("adding fatman");

		var newFatman = game.add.sprite(10, 10, 'fatman');;

		newFatman.x = getRandIntBetween(1,game.world.width); //change to a random
		newFatman.y = getRandIntBetween(1,game.world.height); //change to a random

		game.physics.p2.enable(newFatman);

		newFatman.body.gravity = 0;

		newFatman.body.createBodyCallback(player,fatmanPlayerCollision, this);

		this.fatmen.push(newFatman);

		enemyController.currentFatmen++;

	}


}

//returns a random int between the two values specified
function getRandIntBetween(min, max){

	var randValue = Math.random();

	return randValue*((max-min+1)+min);

}

//for collisions between player and fatmen
function fatmanPlayerCollision(body1, body2){

	var collisionSpeed = calculateVelocity(body2);
	
	//if hit hard enough, destroy the object
	if (collisionSpeed > 150){

		createMoneyEmitter(body1.x, body1.y);

		body1.sprite.kill();
		body1.destroy();

		enemyController.currentFatmen--;

		gameController.currentScore += 100;

		console.log("destroyed");

	} else {

		gameController.playerCurrentHealth -= 10;

		console.log("not-destroyed");
	}

}


//gives a single figure for velocity to account for x and y
function calculateVelocity(bodyTo){

	return (Math.abs(bodyTo.velocity.x) + Math.abs(bodyTo.velocity.y))/2;

}


//creates a money emitter
function createMoneyEmitter(xTo, yTo){

	emitterTo = game.add.emitter(xTo, yTo,5);

	emitterTo.makeParticles('money');
    emitterTo.minParticleSpeed.setTo(-100, 30);
    emitterTo.maxParticleSpeed.setTo(100, 100);
    emitterTo.minParticleScale = 0.5;
    emitterTo.maxParticleScale = 2;
    emitterTo.gravity = 0;
    emitterTo.flow(1000, 100, 1, -1);

    cashEmitters.push(emitterTo);

}

//ensures there are enough fatmen
function checkFatboyLevels(){

	if (enemyController.currentFatmen < enemyController.maxFatmen){
		enemyController.addFatMan();
	}

}

//initialise the game controller
function initGameController(){

	gameController = {};

	//setup to destroy cash emitters
	gameController.cashEmitterDestroyTime = 100;
	gameController.currentEmitterDestroyTime = gameController.cashEmitterDestroyTime;


	//player data
	gameController.playerStartingHealth = 100;
	gameController.playerCurrentHealth = 100;

	gameController.gameEnded = false;

	gameController.currentScore = 0;

}

//destroys cash emitters as needed
function cycleCashEmitters(){

	gameController.currentEmitterDestroyTime--;

	//if time to destroy an emitter
	if (gameController.currentEmitterDestroyTime <=0){


		if (cashEmitters.length > 0){
			var emitterTo = cashEmitters[cashEmitters.length-1];

			emitterTo.destroy();

			cashEmitters.pop();
		}

		gameController.currentEmitterDestroyTime = gameController.cashEmitterDestroyTime;

	}

}


//checks the palyers health
function checkPlayerHealth(){

	//check if player should be destroyed
	if (gameController.playerCurrentHealth <= 0){

		game.add.text(game.Camera.x, game.Camera.y, "GAME OVER");

		emitter.destroy();

		player.kill();
		player.destroy();

		gameController.gameEnded = true;

	}

}