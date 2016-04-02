// CPSC 314 Final project: 
// Game name: 

var scene = new THREE.Scene();

// setting up renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0xBBBBBBB);
document.body.appendChild(renderer.domElement);
     // for the mouse operation
//document.addEventListener('mouseDown', onDocumentMouseDown, false);
//document.addEventListener('mouseDown', onDocumentMouseDown, false);
//document.addEventListener('mouseDown', onDocumentMouseDown, false);

// setting up the camera:
 var aspect = window.innerWidth/window.innerHeight;
 var camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 20000);
 camera.position.set(300,250,300);
 camera.lookAt(scene.position);	
 scene.add(camera);

// setting controls
 var controls = new THREE.OrbitControls(camera);
 controls.enableDamping = true;
 controls.dampingFactor = 0.25;
 controls.enableZoom = false;

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
var ballSize = 5;
var geometry = new THREE.SphereGeometry(ballSize, 32, 32);
var material = new THREE.MeshPhongMaterial( {specular: "#ff5555", color: "#ff0000", emissive: "#ff0000", side: THREE.DoubleSide} );
var ball = new THREE.MovingMesh(geometry, material);
ball.position.set(0,0,0);
scene.add(ball);

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
	 var jumpDistance = 100 * delta

	 if(keyboard.pressed("W")){
	 	 ball.translateZ (-distanceMoved);
	 }
	 if(keyboard.pressed("A")){
	 	ball.translateX( -distanceMoved);
   }
   if(keyboard.pressed("S")){
      ball.translateZ (distanceMoved);
	 }
   if(keyboard.pressed("D")){
   	ball.translateX(distanceMoved);	 
  }
  if(keyboard.pressed("Q")){
    ball.translateY(jumpDistance);  	 
  }
  if (keyboard.pressed("R")){
   	ball.translateY(-jumpDistance);  	 
  }
}

function onKeyDown(event) {
  if(keyboard.eventMatches(event,"space")){
    ball.jump();
  }
}
keyboard.domElement.addEventListener('keydown', onKeyDown );


var render = function() {
 // controls.update();
 ball.updatePosition();
 keyboardCallBack();
 requestAnimationFrame(render);
 renderer.render(scene, camera);
};

render();
