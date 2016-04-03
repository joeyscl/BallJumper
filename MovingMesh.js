THREE.MovingMesh = function ( geometry, material, size) {

	THREE.Mesh.call( this, geometry, material );

	this.type = 'MovingMesh';

	this.geometry = geometry !== undefined ? geometry : new THREE.Geometry();
	this.material = material !== undefined ? material : new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff } );

	this.size = size;

	this.clock = new THREE.Clock(true);

	this.velocity = new THREE.Vector3(0,0,0);

	this.maxJumps = 2;		// number of jumps allowed
	this.jumpCounter = 0;	// current number of jumps
	this.gravity = -10;
	this.accel = 20;		// acceleration in other directions
	this.maxV = 10		// max velocity in any direction

	this.floorHeight = this.size*2 - 1;
	this.platformHeight = this.floorHeight;

	// flags for collision in each direction. 0 = no collision, -1 and 1 = collision on one of the sides
	// ie: (0,-1,0) means collision with floor
	this.collisions = new THREE.Vector3(0,0,0);

	// Set the rays : one vector for every potential direction
    this.rays = [
    //rays for checking collision in Y (up/down) 
    new THREE.Vector3(0, -1, 0),
    new THREE.Vector3(0, 1, 0),

    //rays for checking collision in X
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(1, 0, 0),

    //rays for checking collision in Z
    new THREE.Vector3(0, 0, -1),
    new THREE.Vector3(0, 0, 1),
	];

	// And the "RayCaster", able to test for intersections
    this.caster = new THREE.Raycaster();

	this.drawMode = THREE.TrianglesDrawMode;
	this.updateMorphTargets();
};

THREE.MovingMesh.prototype = Object.create( THREE.Mesh.prototype);
THREE.MovingMesh.prototype.constructor = THREE.MovingMesh;

THREE.MovingMesh.prototype.jump = function () {
	var Vy = this.velocity.y
	if (this.jumpCounter < this.maxJumps) {
		this.velocity.setY(300);
		this.jumpCounter += 1;
	}	
}

THREE.MovingMesh.prototype.updateVelocity = function () {
	var Vx = this.velocity.x;
	var Vy = this.velocity.y + this.gravity;
	var Vz = this.velocity.z;

	var Cx = this.collisions.x;
	var Cy = this.collisions.y;
	var Cz = this.collisions.z;

	// change velocities to 0 when object hits obstacle
	if (Cy == -1 && Vy <= 0) {			// collision with floor
		this.velocity.setY(0);
		this.jumpCounter = 0;
	} else if (Cy == 1 && Vy >= 0) {	// collision with ceiling
		this.velocity.setY(0);
	} else {							// no collision
		this.velocity.setY(Vy);
	}

	if (Cx == -1 && Vx <= 0) {
		this.velocity.setX(0);
	} else if (Cx == 1 && Vx >= 0) {
		this.velocity.setX(0);
	} else {
		this.velocity.setX(Vx);
	}

	if (Cz == -1 && Vz <= 0) {
		this.velocity.setZ(0);
	} else if (Cz == 1 && Vz >= 0) {
		this.velocity.setZ(0);
	} else {
		this.velocity.setZ(Vz);
	}
}

THREE.MovingMesh.prototype.updatePosition = function () {
	this.CollisionCheck();
	this.updateVelocity();

	var dT = this.clock.getDelta();
	var Px = this.position.x + this.velocity.x*dT;
	var Py = this.position.y + this.velocity.y*dT;
	var Pz = this.position.z + this.velocity.z*dT;

	if (Py < this.platformHeight) {
		this.position.setY(this.platformHeight);
	} else {
		this.position.setY(Py);
	}	
}

THREE.MovingMesh.prototype.CollisionCheck = function () {
	this.collisions.set(0,0,0);

	for (i = 0; i < this.rays.length; i += 1) {
	  // We reset the raycaster to this direction
	  this.caster.set(this.position, this.rays[i]);
	  // Test if we intersect with any obstacle mesh
	  collisions = this.caster.intersectObjects(obstacles);
	  // And flag for collision if we do
	  if (collisions.length > 0 && collisions[0].distance <= this.size) {
	    if (i === 0) {
	    	this.collisions.setY(-1);
	    	this.platformHeight = collisions[0].point.y; //set height of current platform
	    } else if (i === 1) {
	    	this.collisions.setY(1);
	    }

	    if (i === 2) {	    	
	    	this.collisions.setX(-1);
	    	console.log("collision!!")
	    } else if (i === 3) {
	    	this.collisions.setX(1);
	    	console.log("collision!!")
	    }

	    if (i === 4) {
	    	this.collisions.setZ(-1);
	    	console.log("collision!!")
	    } else if (i === 5) {
	    	this.collisions.setZ(1);
	    	console.log("collision!!")
	    }
	  } else { // no collisions so the ball is allowed to fall
	  	this.platformHeight = this.floorHeight;
	  }
	}
}