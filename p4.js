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
  
// add ball/player
var ballSize = 10;
var geometry = new THREE.SphereGeometry(ballSize, 32, 32);
var material = new THREE.MeshPhongMaterial( {specular: "#ff5555", color: "#ff0000", emissive: "#ff0000", side: THREE.DoubleSide} );
var ball = new THREE.PlayerMesh(geometry, material, ballSize);
ball.position.set(0,100,0);
scene.add(ball);

// setting up the camera:
var aspect = window.innerWidth/window.innerHeight;
var camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 20000);
camera.position.set(100,250,350);
camera.lookAt(scene.position); 
ball.add(camera);

// setting controls
var controls = new THREE.OrbitControls(camera);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = false;

// array to track obstacles
var obstacles = [];

// floor from p3 used
var floorTexture = new THREE.ImageUtils.loadTexture( 'images/checkerboard.jpg' );
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
floorTexture.repeat.set(10, 10);
var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
var floorGeometry = new THREE.PlaneGeometry(400, 400, 10, 10);
var floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.y = -1 + ballSize;
floor.rotation.x = Math.PI / 2;
scene.add(floor);

obstacles.push(floor);

//test obstacle
var geometry = new THREE.BoxGeometry( 100, 40, 100 );
var material = new THREE.MeshNormalMaterial();
var cube = new THREE.Mesh( geometry, material );
cube.position.set(100,30,0);
scene.add(cube);
obstacles.push(cube);

//test obstacle
var geometry = new THREE.BoxGeometry( 100, 40, 100 );
var material = new THREE.MeshNormalMaterial();
var cube = new THREE.Mesh( geometry, material );
cube.position.set(0,150,0);
scene.add(cube);
obstacles.push(cube);
	
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

	 if(keyboard.pressed("W")  && ball.collisions.z != -1){
	 	 ball.translateZ (-distanceMoved);
	 }
	 if(keyboard.pressed("A") && ball.collisions.x != -1){
	 	ball.translateX(-distanceMoved);
   }
   if(keyboard.pressed("S")  && ball.collisions.z != 1){
      ball.translateZ (distanceMoved);
	 }
   if(keyboard.pressed("D") && ball.collisions.x != 1){
   	ball.translateX(distanceMoved);	 
  }
}

function onKeyDown(event) {
  if(keyboard.eventMatches(event,"space")){
    ball.jump();
  }
}
keyboard.domElement.addEventListener('keydown', onKeyDown );


var filterStrength = 20;
var frameTime = 0, lastLoop = new Date, thisLoop;
var highestScore = 0;

var render = function() {
 ball.updatePosition();
 keyboardCallBack();
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