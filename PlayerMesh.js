THREE.PlayerMesh = function (geometry, material) {

	THREE.Mesh.call( this, geometry, material );

	this.type = 'PlayerMesh';

	this.geometry = geometry !== undefined ? geometry : new THREE.Geometry();
	this.material = material !== undefined ? material : new THREE.MeshNormalMaterial();

	this.size = geometry.boundingSphere.radius;

	this.clock = new THREE.Clock(true);

	this.velocity = new THREE.Vector3(0,0,0);

	this.maxJumps = 2;		// number of jumps allowed
	this.jumpCounter = 0;	// current number of jumps
	this.jumpV = 350;		// jump velocity
	this.gravity = -600;	// acceleration downwards
	this.maxV = 800		// max velocity in any direction

	this.floorHeight = this.size*2-1.1;
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

    // diagonal directions
    new THREE.Vector3(1, 0, 1),
    new THREE.Vector3(1, 0, -1),
    new THREE.Vector3(-1, 0, 1),
    new THREE.Vector3(-1, 0, -1),

    new THREE.Vector3(0, 1, 1),
    new THREE.Vector3(0, 1, -1),
    new THREE.Vector3(0, -1, 1),
    new THREE.Vector3(0, -1, -1),

    new THREE.Vector3(1, 1, 0),
    new THREE.Vector3(1, -1, 0),
    new THREE.Vector3(-1, 1, 0),
    new THREE.Vector3(-1, -1, 0)
	];

	// And the "RayCaster", able to test for intersections
    this.caster = new THREE.Raycaster();

	this.drawMode = THREE.TrianglesDrawMode;
	this.updateMorphTargets();

	this.score = 0;
};

THREE.PlayerMesh.prototype = Object.create( THREE.Mesh.prototype);
THREE.PlayerMesh.prototype.constructor = THREE.PlayerMesh;

THREE.PlayerMesh.prototype.jump = function () {
	var Vy = this.velocity.y
	if (this.jumpCounter < this.maxJumps) {
		this.velocity.setY(this.jumpV);
		this.jumpCounter += 1;
	}	
}

THREE.PlayerMesh.prototype.updateVelocity = function (dT) {
	var Vy;

	if (this.velocity.y > 0) {
		var Vy = Math.min(this.velocity.y + this.gravity*dT, this.maxV);
	} else {
		var Vy = Math.max(this.velocity.y + this.gravity*dT, -this.maxV);
	}
	var Cy = this.collisions.y;

	// change velocities to 0 when object hits obstacle
	if (Cy == -1 && Vy <= 0) {			// collision with floor
		this.velocity.setY(0);
		this.jumpCounter = 0;
	} else if (Cy == 1 && Vy >= 0) {	// collision with ceiling
		this.velocity.setY(0);
	} else {							// no collision
		this.velocity.setY(Vy);
	}
}

THREE.PlayerMesh.prototype.updatePosition = function () {
	this.CollisionCheck();

	dT = this.clock.getDelta();
	this.updateVelocity(dT);
	
	var Py = this.position.y + this.velocity.y*dT;

	if (Py < this.platformHeight) {
		this.position.setY(this.platformHeight);
	} else {
		this.position.setY(Py);
	}
	if ( (Math.abs(this.position.x)>500) || (Math.abs(this.position.z)>500) ) {
		this.floorHeight = - 50000;
		if (this.position < -500) {
			this.maxV = -10000;
		}
	} else if (this.position.y >= 0) {
		this.floorHeight = this.size*2-1.1;
	}
}

THREE.PlayerMesh.prototype.CollisionCheck = function () {
	this.collisions.set(0,0,0);

	for (i = 0; i < this.rays.length; i += 1) {
	  // We reset the raycaster to this direction
	  this.caster.set(this.position, this.rays[i]);
	  // Test if we intersect with any obstacle mesh
	  collisions = this.caster.intersectObjects(allObstacles);
	  // And flag for collision if we do
	  if (collisions.length > 0 && collisions[0].distance <= this.size) {
	    if ([0,12,13,15,17].indexOf(i) != -1) {
	    	this.collisions.setY(-1);
	    	this.platformHeight = collisions[0].point.y; //set height of current platform
	    	this.translateY(this.size-collisions[0].distance);		//shift player so it's just touching the edge

	    } else if ([1,10,11,14,16].indexOf(i) != -1) {
	    	this.collisions.setY(1);
	    	this.translateY(-(this.size-collisions[0].distance));	//shift player so it's just touching the edge 
	    }

	    if ([2,8,9,16,17].indexOf(i) != -1) {	    	
	    	this.collisions.setX(-1);
	    	this.translateX(this.size-collisions[0].distance);		//shift player so it's just touching the edge 
	    } else if ([3,6,7,14,15].indexOf(i) != -1) {
	    	this.collisions.setX(1);
	    	this.translateX(-(this.size-collisions[0].distance));	//shift player so it's just touching the edge 
	    }

	    if ([4,7,9,11,13].indexOf(i) != -1) {
	    	this.collisions.setZ(-1);
	    	this.translateZ(this.size-collisions[0].distance);		//shift player so it's just touching the edge 
	    } else if ([5,6,8,10,12].indexOf(i) != -1) {
	    	this.collisions.setZ(1);
	    	this.translateZ(-(this.size-collisions[0].distance));	//shift player so it's just touching the edge 
	    }

	  } else { // no collisions so the ball is allowed to fall
	  	this.platformHeight = this.floorHeight;
	  }
	}
}