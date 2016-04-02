THREE.MovingMesh = function ( geometry, material) {

	THREE.Mesh.call( this, geometry, material );

	this.type = 'MovingMesh';

	this.geometry = geometry !== undefined ? geometry : new THREE.Geometry();
	this.material = material !== undefined ? material : new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff } );

	this.clock = new THREE.Clock(true);
	this.velocity = new THREE.Vector3(0,0,0);
	this.inAir = false;
	this.gravity = -5;
	this.accel = 1;

	this.drawMode = THREE.TrianglesDrawMode;
	this.updateMorphTargets();
};

THREE.MovingMesh.prototype = Object.create( THREE.Mesh.prototype);
THREE.MovingMesh.prototype.constructor = THREE.MovingMesh;

THREE.MovingMesh.prototype.jump = function () {
	var Vx = this.velocity.x
	var Vy = this.velocity.y
	var Vz = this.velocity.z
	this.velocity.set(Vx,200,Vz);
	this.inAir = true;
}

THREE.MovingMesh.prototype.updateVelocity = function () {
	var Vx = this.velocity.x;
	var Vy = this.velocity.y + this.gravity;
	var Vz = this.velocity.z;
	if (this.inAir) {
		this.velocity.set(Vx,Vy,Vz);
	} else {
		this.velocity.set(Vx,0,Vz);
	}
	
}

THREE.MovingMesh.prototype.updatePosition = function () {
	this.updateVelocity();
	var dT = this.clock.getDelta();
	var Px = this.position.x + this.velocity.x*dT;
	var Py = this.position.y + this.velocity.y*dT;
	var Pz = this.position.z + this.velocity.z*dT;
	if (this.position.y < 9) {
		this.position.set(Px,9,Pz);
		this.inAir = false;
	} else {
		this.position.set(Px,Py,Pz);
	}
	
}