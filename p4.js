// CPSC 314 Final project: 
// Game name: 

var scene = new THREE.Scene();

// setting up renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0xBBBBBBB);
document.body.appendChild(renderer.domElement);

renderer.shadowMapEnabled = true;
renderer.shadowMapSoft = true;


  // setting up window resize and adaptation
function resize() {
	windowWidth = window.innerWidth;
	windowHeight = window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// add ball/player
var playerSize = 10;
var geometry = new THREE.SphereGeometry(playerSize, 32, 32);
var material = new THREE.MeshBasicMaterial( {wireframe: true, opacity: 0.0, transparent: true})
var player = new THREE.PlayerMesh(geometry, material);
player.position.set(0,100,0);
scene.add(player);

// add ball/player
var ballSize = 10;
var geometry = new THREE.SphereGeometry(ballSize, 32, 32);
var material = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('images/ballTexture.jpg') } );
var ball = new THREE.Mesh(geometry, material);
ball.position.set(0,0,0);
ball.castShadow = true;
player.add(ball);


//directional light
var directionalLight = new THREE.DirectionalLight(0xffffff);
directionalLight.position.set(500, 1000, 500);
directionalLight.target.position.set(0, 0, 0);

directionalLight.castShadow = true;
directionalLight.shadowDarkness = 0.75;
// directionalLight.shadowCameraVisible = true;

directionalLight.shadowCameraNear = 0;
directionalLight.shadowCameraFar = 1500;

directionalLight.shadowCameraLeft = -500;
directionalLight.shadowCameraRight = 500;
directionalLight.shadowCameraTop = 500;
directionalLight.shadowCameraBottom = -500;
  
player.add(directionalLight);


// EVENT LISTENER RESIZE
window.addEventListener('resize',resize);
resize();

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
var floorMaterial = new THREE.MeshPhongMaterial( { map: floorTexture, side: THREE.DoubleSide } );
var floorGeometry = new THREE.PlaneGeometry(400, 400, 10, 10);
var floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.y = -1 + playerSize;
floor.rotation.x = Math.PI / 2;
floor.receiveShadow = true
;scene.add(floor);
floor.receiveShadow = true;
allObstacles.push(floor);

//test obstacle
var geometry = new THREE.BoxGeometry( 100, 40, 100 );
var material = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('images/crate.jpg') } );
var cube = new THREE.PlatformMesh( geometry, material );
cube.position.set(100,30,0);
scene.add(cube);
cube.castShadow = true;
cube.receiveShadow = true;
allObstacles.push(cube);

//test obstacle
var geometry = new THREE.BoxGeometry( 100, 40, 100 );
var material = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('images/crate.jpg') } );
var cube = new THREE.PlatformMesh( geometry, material );
cube.position.set(-100,30,0);
scene.add(cube);
cube.castShadow = true;
cube.receiveShadow = true;
allObstacles.push(cube);

//test obstacle
var geometry = new THREE.BoxGeometry( 100, 40, 100 );
var material = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('images/crate.jpg') } );
var cube = new THREE.PlatformMesh( geometry, material );
cube.position.set(0,150,0);
scene.add(cube);
cube.castShadow = true;
cube.receiveShadow = true;
allObstacles.push(cube);
	
// adding an object
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock(true);


function keyboardCallBack() {
	 var delta = clock.getDelta();
	 var distanceMoved = 100 * delta;
   var angleRotated = distanceMoved/player.size;


	 if(keyboard.pressed("W")  && player.collisions.z != -1){
    player.translateZ(-distanceMoved);
    ball.rotateX(-angleRotated);
	 }
	 if(keyboard.pressed("A") && player.collisions.x != -1){
	 	player.translateX(-distanceMoved);
    ball.rotateZ(angleRotated);
   }
   if(keyboard.pressed("S")  && player.collisions.z != 1){
      player.translateZ (distanceMoved);
      ball.rotateX(angleRotated);
	 }
   if(keyboard.pressed("D") && player.collisions.x != 1){
   	player.translateX(distanceMoved);
    ball.rotateZ(-angleRotated);	 
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
  
  var platPos = allObstacles[allObstacles.length-1].position
  var platSize = allObstacles[allObstacles.length-1].geometry.boundingSphere.radius;
  //only add new platform if player is above highest playform
  if ( (player.position.y >= platPos.y) &&
    (Math.abs(player.position.x - platPos.x) <= platSize) && 
    (Math.abs(player.position.z - platPos.z) <= platSize) ) {

    var geometry = new THREE.BoxGeometry( 100, 40, 100 );
    var material = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('images/crate.jpg') } );
    var cube = new THREE.PlatformMesh( geometry, material );
    cube.castShadow = true;
    cube.receiveShadow = true;

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
  var platPos = allObstacles[allObstacles.length-1].position;

  var radius = Math.random()*75 + 75;
  var angle1 = Math.random()*360;https://www.facebook.com/#

  var x = radius * Math.cos(angle1);
  var z = radius * Math.sin(angle1);

  var y;
  if (radius > 125) {
    y = Math.random()* 25 + 75 + platPos.y;
  } else if (radius > 100){
    y = Math.random()* 40 + 75 + platPos.y;
  } else {
    y = Math.random()* 60 + 75 + platPos.y;
  }
  return new THREE.Vector3(x,y,z);
}

var filterStrength = 20;
var frameTime = 0, lastLoop = new Date, thisLoop;
var highestScore = 0;

var render = function() {
 player.updatePosition();
 keyboardCallBack();
 moveAllPlatforms()
 addNewPlatform();
 cube.movePlatform();
 requestAnimationFrame(render);
 renderer.render(scene, camera);

 var thisFrameTime = (thisLoop=new Date) - lastLoop;
 frameTime+= (thisFrameTime - frameTime) / filterStrength;
 lastLoop = thisLoop;
};

(function(window, document, undefined){
window.onload = init;

  function init(){
    var fpsOut = document.getElementById('fps');
setInterval(function(){
  fpsOut.innerHTML = (1000/frameTime).toFixed(1) + " fps";
  document.getElementById('fps').innerHTML = "frame rate: " + (1000/frameTime).toFixed(1) + " fps";

	highestScore = Math.max(highestScore, ball.position.y); 
  document.getElementById('highest').innerHTML = "highest height: " + highestScore.toFixed(1);

  document.getElementById('current').innerHTML = "current height: " + ball.position.y.toFixed(1);
},100);
  }
     
})(window, document, undefined);

render();