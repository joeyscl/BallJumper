THREE.PlatformMesh = function (geometry, material) {

	THREE.Mesh.call( this, geometry, material );

	this.type = 'PlatformMesh';

	this.geometry = geometry !== undefined ? geometry : new THREE.Geometry();
	this.material = material !== undefined ? material : new THREE.MeshNormalMaterial();

	this.clock = new THREE.Clock(true);

	//determine velocity
	if (allObstacles.length <= 5) {
		this.velocity = 0.25;
	} else if (allObstacles.length <= 10) {
		this.velocity = (Math.random() * 0.25) + 0.25;
	} else if (allObstacles.length <= 15) {
		this.velocity = (Math.random() * 0.25) + 0.5;
	} else if (allObstacles.length <= 20) {
		this.velocity = (Math.random() * 0.5) + 0.5;
	} else {
		this.velocity = (Math.random() * 0.75) + 0.25;
	}

	this.moveDirection = Math.floor(Math.random() * 5); // 0,1 = stationary, 2 = move X, 3 = move Y, 4 = move Z
	//avoid having 2 UP/DOWN platforms in a row
	while (allObstacles[allObstacles.length-1].moveDirection == 3 && this.moveDirection ==3) {
		this.moveDirection = Math.floor(Math.random() * 5);
	}
	
	this.drawMode = THREE.TrianglesDrawMode;
	this.updateMorphTargets();
};

THREE.PlatformMesh.prototype = Object.create( THREE.Mesh.prototype);
THREE.PlatformMesh.prototype.constructor = THREE.PlatformMesh;

THREE.PlatformMesh.prototype.movePlatform = function () {
	var t = this.clock.getElapsedTime();

	var V;
	if (Math.cos(t) >= 0) {
		var V = this.velocity;
	} else {
		var V = -this.velocity;
	}

	var type = this.moveDirection;

	if (type == 2) {
		this.translateX(V);
	} else if (type == 3) {
		this.translateY(V);
	} else if (type == 4) {
		this.translateZ(V);
	}

}