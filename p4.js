// CPSC 314 Final project: 
// Game name: BallJumper

var scene = new THREE.Scene();

// setting up renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0xBBBBBBB);
document.body.appendChild(renderer.domElement);

renderer.shadowMapEnabled = true;
renderer.shadowMapSoft = true;

var container = document.getElementById('maincontent');
container.appendChild(renderer.domElement);


  // setting up window resize and adaptation
function resize() {
	windowWidth = window.innerWidth;
	windowHeight = window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// arrays to track allObstacles and allParticles
var allObstacles = [];
var allParticles = [];


// add player
var playerSize = 10;
var geometry = new THREE.SphereGeometry(playerSize, 32, 32);
var material = new THREE.MeshBasicMaterial( {wireframe: true, opacity: 0.0, transparent: true})
var player = new THREE.PlayerMesh(geometry, material);
player.position.set(0,100,0);
scene.add(player);

// add ball
var ballSize = 10;
var geometry = new THREE.SphereGeometry(ballSize, 32, 32);
var material = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('images/ballTexture.jpg') } );
var ball = new THREE.Mesh(geometry, material);
ball.position.set(0,0,0);
ball.castShadow = true;
player.add(ball);

makeManyParticles(20,5);

//directional light
var directionalLight = new THREE.DirectionalLight(0xffffff);
directionalLight.position.set(50000, 100000, 50000);
directionalLight.lookAt(player.position); 

directionalLight.castShadow = true;
directionalLight.shadowDarkness = 0.75;
directionalLight.shadowCameraVisible = true;

directionalLight.shadowCameraNear = 10000;
directionalLight.shadowCameraFar = 150000;

directionalLight.shadowCameraLeft = -1000;
directionalLight.shadowCameraRight = 1000;
directionalLight.shadowCameraTop = 1000;
directionalLight.shadowCameraBottom = -1000;
  
player.add(directionalLight);


var ambLight = new THREE.AmbientLight(0xBBBBBB); // soft white light
ambLight.visible = false;
scene.add( ambLight );


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


// floor from p3 used
var floorTexture = new THREE.ImageUtils.loadTexture( 'images/grass2.jpg' );
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
floorTexture.repeat.set(8,8);
var floorMaterial = new THREE.MeshPhongMaterial( { map: floorTexture, side: THREE.DoubleSide } );
var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
var floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.y = -1 + playerSize;
floor.rotation.x = Math.PI / 2;
floor.receiveShadow = true
;scene.add(floor);
floor.receiveShadow = true;
allObstacles.push(floor);

//starting obstacle
var cube = makePlatform();
cube.position.set(100,30,0);
scene.add(cube);
allObstacles.push(cube);

var cube = makePlatform();
cube.position.set(-100,30,0);
scene.add(cube);
allObstacles.push(cube);

var cube = makePlatform();
cube.position.set(0,150,0);
scene.add(cube);
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
    player.velocity.setZ(-100);
    ball.rotateX(-angleRotated);
	 }
	 if(keyboard.pressed("A") && player.collisions.x != -1){
	 	player.translateX(-distanceMoved);
    player.velocity.setX(-100);
    ball.rotateZ(angleRotated);
   }
   if(keyboard.pressed("S")  && player.collisions.z != 1){
      player.translateZ (distanceMoved);
      player.velocity.setZ(100);
      ball.rotateX(angleRotated);
	 }
   if(keyboard.pressed("D") && player.collisions.x != 1){
   	player.translateX(distanceMoved);
    player.velocity.setX(100);
    ball.rotateZ(-angleRotated);	 
  }

  if(!keyboard.pressed("W") && !keyboard.pressed("A") && !keyboard.pressed("S") && !keyboard.pressed("D")) {
    player.velocity.setX(0);
    player.velocity.setZ(0);
  }
}

function onKeyDown(event) {
  if(keyboard.eventMatches(event,"space")){
    player.jump();
  }
  if(keyboard.eventMatches(event,"L")){
    directionalLight.visible = !directionalLight.visible;
    ambLight.visible = !ambLight.visible;
  }
  if(keyboard.eventMatches(event,"P")){
  	for (i=0; i<allParticles.length; i++){
    	scene.remove(allParticles[i]);		
  	}
  } 
}
keyboard.domElement.addEventListener('keydown', onKeyDown );



var filterStrength = 20;
var frameTime = 0, lastLoop = new Date, thisLoop;
var highestScore = 0;

var render = function() {
  player.updatePosition();
  keyboardCallBack();
  moveAllParticles();
  addNewPlatform();
  moveAllPlatforms()
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
  document.getElementById('fps').innerHTML = "Frame Rate: " + (1000/frameTime).toFixed(1) + " fps";

	highestScore = Math.max(highestScore, ball.position.y); 
  document.getElementById('highest').innerHTML = "Current Height: " + highestScore.toFixed(1);

  document.getElementById('current').innerHTML = "Best Height: " + ball.position.y.toFixed(1);
},100);
  }
     
})(window, document, undefined);

render();