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

}

//initialises player variables
function initPlayer(playerTo){

	playerTo.maxBoost = 300;
	playerTo.forwardAcc = 10;

	playerTo.turnSpeed = 30;

	playerTo.currentBoost = 0;

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
		playerTo.body.rotateLeft(playerTo.turnSpeed);
	}

	if (inputTo.right.isDown){
		playerTo.body.rotateRight(playerTo.turnSpeed);
	}



}


//moves the palyer according to variables
function movePlayer(playerTo){

	//move the player according to boost
	if (playerTo.currentBoost > 0){
		playerTo.body.moveForward(playerTo.currentBoost);
	}

}


