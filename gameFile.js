//WIDTH, HEIGHT, Renderer, element id, state
var game = new Phaser.Game(800,600, Phaser.AUTO, 'phaser-game', {preload: preload, create: create, update: update, render: render});

//used for input
var cursors;

//for map rendering
var map;
var bgLayer;
var worldLayer;

//...the player
var player;


//assets loaded for game
function preload(){

	//load in the tile map
	game.load.tilemap('testMap', 'levels/testLevel.json', null, Phaser.Tilemap.TILED_JSON);

	//load the image for the tile map
	game.load.image('tileImage', 'tiles/tileset.png');

	//load the player image
	game.load.spritesheet('player', 'sprites/face.png')

	console.log("Preload finished"); //test

}

//when the game is created
function create(){

	map = game.add.tilemap("testMap");

	map.addTilesetImage("Test", "tileImage");

	//load in the display layers
	bgLayer = map.createLayer("BackgroundLayer");
	worldLayer = map.createLayer("TestTileLayer");

	//resize the world according to the size of world layer
	worldLayer.resizeWorld();

	//initialise the physics system
	game.physics.startSystem(Phaser.Physics.P2JS);

	//setup the gravity
	game.physics.p2.gravity.y = 100;

	//add the player to the game
	player = game.add.sprite(10, 10, 'player');

	//setup the player
	initPlayer(player);

	//enable physics for the player
	game.physics.p2.enable(player);

	//accepts cursor key input
	cursors = game.input.keyboard.createCursorKeys();

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

}


//render the game
function render(){

	game.debug.cameraInfo(game.camera, 32, 32);
	game.debug.text(player.currentBoost, 32, 500);
	game.debug.text(player.currentRotation, 32, 564);


}

//initialises player variables
function initPlayer(playerTo){

	playerTo.maxBoost = 500;
	playerTo.forwardAcc = 5;

	playerTo.turnMaxSpeed = 100;
	playerTo.turnAcc = 10;

	playerTo.currentBoost = 0;
	playerTo.currentRotation = 0;

}


//handles input from the specified input object and player
function handleInputForPlayer(inputTo, playerTo){

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


//moves the palyer according to variables
function movePlayer(playerTo){

	//move the player according to boost
	if (playerTo.currentBoost > 0){
		playerTo.body.moveForward(playerTo.currentBoost);
	}

	//rotate the player according to rotation
	playerTo.body.rotateRight(playerTo.currentRotation);


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
