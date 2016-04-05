// CPSC 314 Final project: 
// Game name: 

var scene = new THREE.Scene();

// setting up renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0xBBBBBBB);
document.body.appendChild(renderer.domElement);


  // setting up window resize and adaptation
function resize() {
	windowWidth = window.innerWidth;
	windowHeight = window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
}


// lights
light = new THREE.DirectionalLight( 0xffffff );
light.position.set( 0, 1, 1 );
scene.add( light );

light = new THREE.AmbientLight( 0x222222 );
scene.add( light );


// EVENT LISTENER RESIZE
window.addEventListener('resize',resize);
resize();
  
// add player/player
var playerSize = 10;
var geometry = new THREE.SphereGeometry(playerSize, 32, 32);
var material = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('images/ballTexture.jpg') } );
var player = new THREE.PlayerMesh(geometry, material);
player.position.set(0,100,0);
scene.add(player);

// setting up the camera:
var aspect = window.innerWidth/window.innerHeight;
var camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 20000);
camera.position.set(100,250,350);
camera.lookAt(scene.position); 
player.add(camera);

// setting controls
var controls = new THREE.OrbitControls(camera);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = false;

// array to track allObstacles
var allObstacles = [];

// floor from p3 used
var floorTexture = new THREE.ImageUtils.loadTexture( 'images/checkerboard.jpg' );
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
floorTexture.repeat.set(10, 10);
var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
var floorGeometry = new THREE.PlaneGeometry(400, 400, 10, 10);
var floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.y = -1 + playerSize;
floor.rotation.x = Math.PI / 2;
scene.add(floor);

allObstacles.push(floor);

//test obstacle
var geometry = new THREE.BoxGeometry( 100, 40, 100 );
var material = new THREE.MeshNormalMaterial();
var cube = new THREE.PlatformMesh( geometry, material );
cube.position.set(100,30,0);
scene.add(cube);
allObstacles.push(cube);

//test obstacle
var geometry = new THREE.BoxGeometry( 100, 40, 100 );
var material = new THREE.MeshNormalMaterial();
var cube = new THREE.PlatformMesh( geometry, material );
cube.position.set(-100,30,0);
scene.add(cube);
allObstacles.push(cube);

//test obstacle
var geometry = new THREE.BoxGeometry( 100, 40, 100 );
var material = new THREE.MeshNormalMaterial();
var cube = new THREE.PlatformMesh( geometry, material );
cube.position.set(0,150,0);
scene.add(cube);
allObstacles.push(cube);
	
// first person camera. 
THREE.FirstPersonControls = function (){
	controls.movementSpeed = 100;
	controls.lookSpeed = 0.2;
	controls.lookVertical = false;
	controls.noFly = true;
}

// adding an object
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock(true);

function keyboardCallBack() {
	 var delta = clock.getDelta();
	 var distanceMoved = 100 * delta;
   // var angleRotated = distanceMoved/player.size;

	 if(keyboard.pressed("W")  && player.collisions.z != -1){
	 	 player.translateZ (-distanceMoved);
	 }
	 if(keyboard.pressed("A") && player.collisions.x != -1){
	 	player.translateX(-distanceMoved);
   }
   if(keyboard.pressed("S")  && player.collisions.z != 1){
      player.translateZ (distanceMoved);
	 }
   if(keyboard.pressed("D") && player.collisions.x != 1){
   	player.translateX(distanceMoved);	 
  }
}

function onKeyDown(event) {
  if(keyboard.eventMatches(event,"space")){
    player.jump();
  }
}
keyboard.domElement.addEventListener('keydown', onKeyDown );

function moveAllPlatforms() {
  // the 0th obstacle is the floor, so start from 1
  for (i = 1; i < allObstacles.length -1; i++) {
    allObstacles[i].movePlatform();
  }
}

//add new platform when player reaches the highest platform
function addNewPlatform() {
  if (player.position.y >= allObstacles[allObstacles.length-1].position.y)  {
    var geometry = new THREE.BoxGeometry( 100, 40, 100 );
    var material = new THREE.MeshNormalMaterial();
    var cube = new THREE.PlatformMesh( geometry, material );

    newPos = newPlatformPosition();
    cube.position.set(newPos.x,newPos.y,newPos.z);
    scene.add(cube);
    allObstacles.push(cube);
    newPlatformPosition();
  }
}

// generates position of the new platform using the current highest platform
function newPlatformPosition() {
  //position of the highest platform
  var oldPos = allObstacles[allObstacles.length-1].position;

  var radius = Math.random()*75 + 75;
  var angle1 = Math.random()*360;

  var x = radius * Math.cos(angle1);
  var z = radius * Math.sin(angle1);
  var y = Math.random()* 50 + 75 + oldPos.y;
  console.log(x,y,z);
  return new THREE.Vector3(x,y,z);
}

var render = function() {
 player.updatePosition();
 keyboardCallBack();
 moveAllPlatforms()
 addNewPlatform();
 cube.movePlatform();
 requestAnimationFrame(render);
 renderer.render(scene, camera);
};

render();
