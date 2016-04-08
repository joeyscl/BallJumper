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


function resize() {
  renderer.setSize(window.innerWidth,window.innerHeight);
}
//SCROLLBAR FUNCTION DISABLE
window.onscroll = function () {
     window.scrollTo(0,0);
   }


// SKYBOX/BACKGROUND
// tutorial and code from http://blog.romanliutikov.com/post/58705840698/skybox-and-environment-map-in-threejs
var urls = [
  // Images from http://opengameart.org/content/forest-skyboxes
  'images/skybox/px.jpg',
  'images/skybox/nx.jpg',
  'images/skybox/py.jpg',
  'images/skybox/ny.jpg',
  'images/skybox/pz.jpg',
  'images/skybox/nz.jpg'
  ];

var cubemap = THREE.ImageUtils.loadTextureCube(urls); // load textures
cubemap.format = THREE.RGBFormat;

var shader = THREE.ShaderLib['cube']; // init cube shader from built-in lib
shader.uniforms['tCube'].value = cubemap; // apply textures to shader

// create shader material
var skyBoxMaterial = new THREE.ShaderMaterial( {
  fragmentShader: shader.fragmentShader,
  vertexShader: shader.vertexShader,
  uniforms: shader.uniforms,
  depthWrite: false,
  side: THREE.BackSide
});

// create skybox mesh
var skybox = new THREE.Mesh(
  new THREE.CubeGeometry(10000, 10000, 10000),
  skyBoxMaterial
);
skybox.rotation.x = Math.PI / 2;

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
player.add(skybox);

// add ball
var ballSize = 10;
var geometry = new THREE.SphereGeometry(ballSize, 32, 32);
var material = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('images/ballTexture.jpg') } );
var ball = new THREE.Mesh(geometry, material);
ball.position.set(0,0,0);
ball.castShadow = true;
player.add(ball);

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
camera.position.set(150,200,500);
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

makeManyParticles(20,5);

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



// Picking Functionality
var mouseVector = new THREE.Vector3();
var rayCaster = new THREE.Raycaster();
var intersects, particleToRemove;

window.addEventListener('click', onDocumentMouseDown);

function onDocumentMouseDown(e) {

  mouseVector.setX(  2 * (e.clientX / container.clientWidth) - 1  );
  mouseVector.setY(  1 - 2 * (e.clientY / container.clientHeight)  );

  rayCaster.setFromCamera( mouseVector.clone(), camera );
  intersects = rayCaster.intersectObjects(allParticles, recursive=false);
  console.log(mouseVector);


  if (intersects.length > 0) {
    particleToRemove = intersects[0].object;    
    var index = allParticles.indexOf(particleToRemove);
    if (index > -1) {
      scene.remove(allParticles[index]);
      allParticles.splice(index, 1);
    }
  }
}





// Picking Functionality
var mouseVector = new THREE.Vector3();
var rayCaster = new THREE.Raycaster();
var intersects, particleToRemove;

window.addEventListener('click', checkIfPotion);

function checkIfPotion(e) {
  mouseVector.x = 2 * (e.clientX / container.clientWidth) - 1;
  mouseVector.y = 1 - 2 * (e.clientY / container.clientHeight);
  
  rayCaster.setFromCamera( mouseVector.clone(), camera);
  intersects = rayCaster.intersectObjects(allParticles, recursive=true);
  if (intersects.length > 0) {
    particleToRemove = intersects[0].object;    
    var index = allParticles.indexOf(particleToRemove);
    if (index > -1) {
      scene.remove(allParticles[i]);
      allParticles.splice(index, 1);
    }
  }
}



var filterStrength = 20;
var frameTime = 0, lastLoop = new Date, thisLoop;
var highestScore = 0;

function getHighestScore() {
  var newHigh = localStorage.getItem("highest score");
  highestScore = newHigh >= 0? newHigh:0;
}

getHighestScore();


/* Snow */

var pMaterial = new THREE.PointCloudMaterial({
  color: 0xFFFFFF,
  size: 10,
  map: THREE.ImageUtils.loadTexture(
     'images/snow.png'
   ),
   blending: THREE.AdditiveBlending,
   depthTest: false,
   transparent: true
});

var particleCount = 10;

var particles = new THREE.Geometry();

function populate() {

for (var i = 0; i < particleCount; i++) {
    var pX = Math.random()*500 - 250,
    pY = Math.random()*500 - 250,
    pZ = Math.random()*500 - 250,
    particle = new THREE.Vector3(pX, pY, pZ);
    particle.velocity = {};
    particle.velocity.y = 0;
    particles.vertices.push(particle);
}
}

populate();

var particleSystem = new THREE.PointCloud(particles, pMaterial);
scene.add(particleSystem);

var simulateSnow = function(){
  var pCount = particleCount;
  while (pCount--) {
    var particle = particles.vertices[pCount];
    if (particle.y < -200) {
      particle.y = 200;
      particle.velocity.y = 0;
    }

    particle.velocity.y -= Math.random() * .02;

    particle.y += particle.velocity.y;
  }

  particles.verticesNeedUpdate = true;
};

document.getElementById("snow").onclick = function() {
  scene.remove(particleSystem);
  if (particleCount < 10000) {
    particleCount = particleCount*10;
  }
  else {
    particleCount = 10;
  }
  particles = new THREE.Geometry();
  populate();
  particleSystem = new THREE.PointCloud(particles, pMaterial);
  scene.add(particleSystem);
}

/*//////////////////////////*/

var render = function() {
  player.updatePosition();
  keyboardCallBack();
  updateAllParticles();
  addNewPlatform();
  moveAllPlatforms()
  requestAnimationFrame(render);

  particleSystem.rotation.y += 0.01;
  simulateSnow();

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

	highestScore = Math.max(highestScore, player.position.y); 
  document.getElementById('highest').innerHTML = "Best Height: " + highestScore.toFixed(1);

  document.getElementById('current').innerHTML = "Current Height: " + player.position.y.toFixed(1);
},100);
  }
     
})(window, document, undefined);


document.getElementById("restart").onclick = function() {
  localStorage.setItem("highest score", highestScore);
  window.location.reload()
}

render();