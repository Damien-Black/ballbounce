(function(global){
	// General Notes:
	//Double check that anom functions take the name of properties theyre asssigned to in current JS engine versions

	//var t_passed = 0; //DEBUG updating time value overtime

	//radius will always be a positive number
	var Ball = function( initparams ){
		this.x_curr = initparams.x;
		this.y_curr = initparams.y;
		this.color = initparams.color;
		this.radius = initparams.radius;
		this.mass = initparams.mass;
		this.KineticEnergy = 0;
		//TODO potential energy (Needs to be aware of external object, maybe don't handle it here)
		this.dx = initparams.dx || 0;
		this.dy = initparams.dy || 0;
		this.ddx = initparams.ddx || 0; //acceleration on ball X dir (Should ball contain X,Y accel this i think so)
		this.ddy = initparams.ddy || 0; //acceleration on ball Y dir (Remember canvas coor (x,-y) not normal cartersian)
		this.endX = initparams.endX || 0; //target ball X
		this.endY = initparams.endY || 0; //target ball Y
	};

	//Will be exposed to the browser.
	//Balloptions used are x,y,size,color,radius,mass
	var BallFactory = function (ballinit){
		//TODO validate init params
		return new Ball(ballinit);
	};

	//Simulation engine
	Ball.prototype.updatePosition = function(dt) {
		//t_passed += dt; //DEBUG keep track of time passed
		//console.log("Time passed: " + t_passed);
        this.y_curr += (this.dy * dt) + (0.5 * this.ddy * Math.pow(dt,2));
        //Below dx is 0 at all times in ball drop down simulation
        this.x_curr += (this.dx * dt) + (0.5 * this.ddx * Math.pow(dt,2));
        //TODO handle potential energy
        //console.log("Point at: " + (this.y_curr + this.radius)); //DEBUG
	};

	//Drawing a Ball
	Ball.prototype.DrawBall = function(ctx) {
    ctx.beginPath();
    ctx.arc(this.x_curr, this.y_curr, this.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#003300';
    ctx.stroke();
	};

	//Takes another circle (2d ball) and returns if the circle is colliding with this ball
	//	This approach means I'll be doing N! calculations for all collisions in ball system
	//  How big that system is though can be were I reduce the calulations I do.
	//		Broad phase: Quad Trees
	//Returns bool true if balls are colliding
	//In the future if collision back calc point on ball that collided
	Ball.prototype.IsCircleCollision = function(circle){
		//Currently objects touching exactly are considered colliding.
		var Xdist = Math.abs(this.x_curr - circle.x_curr);
		var Ydist = Math.abs(this.y_curr - circle.y_curr);
		var distanceOfCenters = Math.sqrt(Math.pow(Xdist,2) + Math.pow(Ydist,2));
		return (distanceOfCenters <= (this.radius + circle.radius)); 
		//Alternativeley avoid sqrt if thats an issue/performance
		//var distanceOfCenters = (Math.pow(Xdist,2) + Math.pow(Ydist,2))
		//return (distanceOfCenters <= Math.pow(this.radius + circle.radius)),2);
	};

	//Shoutout: http://gamedevelopment.tutsplus.com/tutorials/when-worlds-collide-simulating-circle-circle-collisions--gamedev-769
	//Shoutout: http://gamedev.stackexchange.com/questions/20516/ball-collisions-sticking-together
	//	Saving a brothers life out here
	//	This portion is cheaty and breaks physics.  In future I need to take dt into account
	//	And adjust accordingly to the time step
	Ball.prototype.ResolveCollision = function(circle,dt){
		//find actual collision point, 
		//	this will do for now, but real point will take velocity and direction into account
		//	Use collision point to see how far a balls predicted collision point has progressed
		//		to find dtPostCollision
		// var collisionPointX = 
 	// 		((this.x_curr * circle.radius) + (circle.x_curr * this.radius)) / (this.radius + circle.radius);
		// var collisionPointY = 
 	// 		((this.y_curr * circle.radius) + (circle.y_curr * this.radius)) / (this.radius + circle.radius);
 		//TODO See how far a ball progressed past the collision point and use dt to find dtCollision
 		var centerDistX = this.x_curr - circle.x_curr;
 		var centerDistY = this.y_curr - circle.y_curr;
 		var distSquared = Math.pow(centerDistY,2) + Math.pow(centerDistX,2);
 		var xVelocity = circle.dx - this.dx;
        var yVelocity = circle.dy - this.dy;
        var dotProduct = centerDistX*xVelocity + centerDistY*yVelocity;
        //Neat vector maths, used for checking if the objects moves towards one another.
        //TODO investigate, understand, explore. refresh Vector maths also
        if(dotProduct > 0){
            var collisionScale = dotProduct / distSquared;
            var xCollision = centerDistX * collisionScale;
            var yCollision = centerDistY * collisionScale;
            //The Collision vector is the speed difference projected on the Dist vector,
            //thus it is the component of the speed difference needed for the collision.
            var combinedMass = this.mass + circle.mass;
            var collisionWeightA = 2 * circle.mass / combinedMass;
            var collisionWeightB = 2 * this.mass / combinedMass;
            this.dx += collisionWeightA * xCollision;
            this.dy += collisionWeightA * yCollision;
            circle.dx -= collisionWeightB * xCollision;
            circle.dy -= collisionWeightB * yCollision;
        }
        //Alternate way not using vector math, still think reposition is necessary
 	// 	//Find new ball positions post collision
 	// 	var newVelX1 = (this.dx * (this.mass - circle.mass) + (2 * circle.mass * circle.dx)) / (this.mass + circle.mass);
		// var newVelY1 = (this.dy * (this.mass - circle.mass) + (2 * circle.mass * circle.dy)) / (this.mass + circle.mass);
		// var newVelX2 = (circle.dx * (circle.mass - this.mass) + (2 * this.mass * this.dx)) / (this.mass + circle.mass);
		// var newVelY2 = (circle.dy * (circle.mass - this.mass) + (2 * this.mass * this.dy)) / (this.mass + circle.mass);
		// //reposition balls and update velocity
		// //	Reposition balls at collisionPoint (X,Y) and progress in their directions dtCollision
		// //	Sticking does occur if correction does not move balls apart
		// this.x = this.x + newVelX1;
		// this.y = this.y + newVelY1;
		// circle.x = circle.x + newVelX2;
		// circle.y = circle.y + newVelY2;
		// this.dx = newVelX1;
		// this.dy = newVelY1;
		// circle.dx = newVelX2;
		// circle.dy = newVelY2;
	};

	//Take a rect and see if the the ball is colliding with any of botders
	//Note: Assumes the ball is in the box for this collision detection to be valid
	//Note:  Coonceptual approach
	//	I take a ball with radius R in a box.  I assume that there are 4 points on the ball
	//	which will collide first with any wall of the rectangle.  In a normal rectangle (no spinning/offset)
	//	The 4 points are the points on the circle which lie tangent to the rectangle's sides -- hope that made sense
	//		In the future when a rectangle rotates I'll have these 4 points rotate with the rectangle
	Ball.prototype.RectangleBorderCollision = function (rect,dt) {
		var rightSideRect = Math.max(rect.x + rect.width,rect.x);
		var leftSideRect = Math.min(rect.x + rect.width,rect.x);
		var bottSideRect = Math.max(rect.y + rect.height, rect.y);
		var topSideRect = Math.min(rect.y + rect.height, rect.y);
		var collisionStr = []; //Array of strings
		if (this.x_curr + this.radius >= rightSideRect) {collisionStr.push("right");}
		if (this.x_curr - this.radius <= leftSideRect) {collisionStr.push("left");}
		if (this.y_curr + this.radius >= bottSideRect) {collisionStr.push("bottom");}
		if (this.y_curr - this.radius <= topSideRect) {collisionStr.push("top");}
		if (collisionStr.length !== 0){
			//Move ball to surface where it collided with
			//change dir based on collision "wall" str array
			//	NOTE: moving ball breaks physics I recalculate to correct for this, but still not ideal
			var initAxisPos;
			var dtWall;
			var dtBounce;
			var tempV;
			for (var i = collisionStr.length - 1; i >= 0; i--) {
				//TODO divide by 0 very possible in dtWall calc
				//	Currently can cheat by putting box not at 0 in x or y
				if (collisionStr[i] == "right") {
					initAxisPos = (-0.5*this.ddx*Math.pow(dt,2)) - (this.dx * dt) + this.x_curr+this.radius;
					dtWall = (this.ddx) ? quadSolver((this.ddx / 2),this.dx,(initAxisPos - rightSideRect)) : (rightSideRect - initAxisPos) / this.dx;
					dtBounce = dt - dtWall;
					tempV = -1 * (this.dx + (this.ddx * dtWall));//velocity right after moment of collision
					this.x_curr = (rightSideRect - this.radius) + (tempV * dtBounce) + (0.5 * this.ddx * Math.pow(dtBounce,2));
					this.dx = tempV + (this.ddx * dtBounce);
				}
				if (collisionStr[i] == "left") {
					initAxisPos = (-0.5*this.ddx*Math.pow(dt,2)) - (this.dx * dt) + this.x_curr-this.radius;
					dtWall = (this.ddx) ? quadSolver((this.ddx / 2),this.dx,(initAxisPos - leftSideRect)) : (leftSideRect - initAxisPos) / this.dx;
					dtBounce = dt - dtWall;
					tempV = -1 * (this.dx + (this.ddx * dtWall));//velocity right after moment of collision
					this.x_curr = (leftSideRect + this.radius) + (tempV * dtBounce) + (0.5 * this.ddx * Math.pow(dtBounce,2));
					this.dx = tempV + (this.ddx * dtBounce);
				}
				if (collisionStr[i] == "top") {
					initAxisPos = (-0.5*this.ddy*Math.pow(dt,2)) - (this.dy * dt) + this.y_curr-this.radius;
					dtWall = (this.ddy) ? quadSolver((this.ddy / 2),this.dy,(initAxisPos - topSideRect)) : (topSideRect - initAxisPos) / this.dy;
					dtBounce = dt - dtWall;
					tempV = -1 * (this.dy + (this.ddy * dtWall));//velocity right after moment of collision
					this.y_curr = (topSideRect + this.radius) + (tempV * dtBounce) + (0.5 * this.ddy * Math.pow(dtBounce,2));
					this.dy = tempV + (this.ddy * dtBounce);
				 }
				if (collisionStr[i] == "bottom") {
					initAxisPos = (-0.5*this.ddy*Math.pow(dt,2)) - (this.dy * dt) + this.y_curr+this.radius;
					dtWall = (this.ddy) ? quadSolver((this.ddy / 2),this.dy,(initAxisPos - bottSideRect)) : (bottSideRect - initAxisPos) / this.dy;
					dtBounce = dt - dtWall;
					tempV = -1 * (this.dy + (this.ddy * dtWall));//velocity right after moment of collision
					this.y_curr = (bottSideRect - this.radius) + (tempV * dtBounce) + (0.5 * this.ddy * Math.pow(dtBounce,2)); //reposistion ball + velocity increase in remaining time
					this.dy = tempV + (this.ddy * dtBounce);
				}
				}
			}
			//update velocity if no collision in X or Y respectivley TODO imporve this section
			if (!(collisionStr.includes('right') | collisionStr.includes('right'))) {this.dx += this.ddx * dt;}
			if (!(collisionStr.includes('top') | collisionStr.includes('bottom'))) {this.dy += this.ddy * dt;}
			//update Ball Kinetic energy. is this correct form for .5mv^2?  double check its right when dx != 0
			this.KineticEnergy = 0.5 * this.m * (Math.pow(this.dx,2) + Math.pow(this.dy,2));
	};

	//Working with ball Vectors [Not used, just here]
	Ball.prototype.getVectorVelocity = function(){
		var magnitude = Math.sqrt(Math.pow(self.dx, 2) + Math.pow(self.dy, 2));
		var direction =Math.atan(self.dy/self.dx);
		return [magnitude,direction];
	};

	//Helper - Solve a quadratic equation
	//	Ax2 + Bx + C = 0 is the form that is expected and used
	//	Since there are 2 solutions I need to return the sensible solution (time is always positive)
	function quadSolver(A,B,C){
		root1 = ( -B + Math.sqrt(Math.pow(B,2) - 4*A*C) ) / (2*A);
		root2 = ( -B - Math.sqrt(Math.pow(B,2) - 4*A*C) ) / (2*A);
		//console.log('Time missed/past ' + Math.max(root1, root2)); //DEBUG
		return Math.max(root1, root2);
	}


	//Attach ball factory to the window.  Curious what browsers this doesnt work on (Check)
	global.BallFactory = BallFactory;

}(typeof window !== "undefined" ? window : this));