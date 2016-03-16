(function(global){
	// General Notes:
	//Check that anom functions take the name of properties theyre asssigned to in current JS engine versions

	//var t_passed = 0; //DEBUG updating time value overtime

	//radius will always be a positive number
	var Ball = function( initparams ){
		this.x_curr = initparams.x;
		this.y_curr = initparams.y;
		this.color = initparams.color;
		this.radius = initparams.radius;
		this.mass = initparams.mass;
		//TODO potential energy (Needs to be aware of external object, maybe don't handle it here)
		this.dx = initparams.dx || 0;
		this.dy = initparams.dy || 0;
		this.ddx = initparams.ddx || 0; //acceleration on ball X dir
		this.ddy = initparams.ddy || 0; //acceleration on ball Y dir (Remember canvas coor (x,-y) not normal cartersian)
		this.endX = initparams.endX || 0; //target ball X
		this.endY = initparams.endY || 0; //target ball Y
		this.isSpecial = initparams.isSpecial || false;
	};

	//Will be exposed to the browser.
	//Balloptions used are x,y,size,color,radius,mass
	var BallFactory = function (ballinit){
		//TODO validate init params
		return new Ball(ballinit);
	};

	//Calculate KE of the ball
	Ball.prototype.KineticEnergy = function(){
		var KE = 0.5 * this.mass * (Math.pow(this.dx,2) + Math.pow(this.dy,2));
		return KE;
	};

	//Simulation engine
	Ball.prototype.updatePosition = function(dt) {
		//Cap velocity at 40
		this.color = ((this.dx > 40) | (this.dy > 40)) ? "green" : "red";
		this.dx = (this.dx > 40) ? 40 : this.dx;
		this.dy = (this.dy > 40) ? 40 : this.dy;
		//t_passed += dt; //DEBUG keep track of time passed
		//console.log("Time passed: " + t_passed);
        this.y_curr += (this.dy * dt) + (0.5 * this.ddy * Math.pow(dt,2));
        this.x_curr += (this.dx * dt) + (0.5 * this.ddx * Math.pow(dt,2));
        //TODO handle potential energy
        //console.log("Point at: " + (this.y_curr + this.radius)); //DEBUG
	};

	Ball.prototype.gotoEndGoal = function(totalTime) {
		var velocityMultiplier = (totalTime < 50) ? totalTime * 0.1 : 5; //limit time multiplier to 100 to avoid velocities exploding out
		console.log(totalTime);
		var colors = ["blue","green","yellow","Gold","HotPink","Lime"];
		this.color = colors[Math.floor(Math.random() * ((colors.length-1)))]; //get a random color. has to be a better way
		if (this.mass < 400) {this.mass += 5;}//ball gets more massive as it approaches end goal
		//Force balls velocity towards end goal, force position after some time
		var xDistToGoal = this.endX - this.x_curr;
		var yDistToGoal = this.endY - this.y_curr;
		if (totalTime > 70) {
			if (Math.random() > 0.7) {this.x_curr += (xDistToGoal/3) ; this.y_curr += (yDistToGoal/3);}
		}
		this.dx = (xDistToGoal) * velocityMultiplier;
		this.dy = (yDistToGoal / 10) * velocityMultiplier;
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
	//Shoutout: https://blogs.msdn.microsoft.com/faber/2013/01/09/elastic-collisions-of-balls/
	//	Saving a brothers life out here
	//	This portion is cheaty and breaks physics.  In future I need to take dt into account
	//	And adjust accordingly to the time step
	Ball.prototype.ResolveCollision = function(circle,dt){
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
	};
	//Alternate collision handling
	Ball.prototype.ResolveCollision2 = function(circle,dt){
 		var centerDistX = this.x_curr - circle.x_curr;
 		var centerDistY = this.y_curr - circle.y_curr;
 		var phi = Math.arctan(centerDistY/centerDistX);
 		var theta1 = this.getVectorVelocity[1];
 		var theta2 = circle.getVectorVelocity[1];
 		var magnitude1 = this.getVectorVelocity[0];
 		var magnitude2 = circle.getVectorVelocity[0];
 		//Transform x y vectors to collision coordinate plane
 		var coll_dx1 =  magnitude1 * Math.cos(theta1 - phi);
 		var coll_dy1 =  magnitude1 * Math.sin(theta1 - phi); //Perpendicular to collision axis unaffeced
 		var coll_dx2 =  magnitude2 * Math.cos(theta2 - phi);
 		var coll_dy2 =  magnitude2 * Math.sin(theta2 - phi); //Perpendicular to collision axis unaffeced
 		//Calculate new velocities vector on collision axis
 		var coll_du1 = ((coll_dx1 * (this.mass - circle.mass)) / (this.mass + circle.mass)) +
 						((coll_dx2 * (2 * circle.mass)) / (this.mass + circle.mass));
 		var coll_du2 = ((coll_dx2 * (circle.mass - this.mass)) / (this.mass + circle.mass)) +
 						((coll_dx1 * (2 * this.mass)) / (this.mass + circle.mass));
 		//Transform back to cartesian coordinates, magnitude type change, not sure about
 		vector1 = createVector(coll_du1,coll_dy1);
 	 	vector2 = createVector(coll_du2,coll_dy2);
 	 	this.dx =  magnitude1 * Math.cos(phi - theta1);
 		this.dy =  magnitude1 * Math.sin(phi - theta1);
 		circle.dx =  magnitude2 * Math.cos(phi - theta2);
 		circle.dy =  magnitude2 * Math.sin(phi - theta2);

 		// var xVelocity = circle.dx - this.dx;
   //      var yVelocity = circle.dy - this.dy;
   //      var dotProduct = centerDistX*xVelocity + centerDistY*yVelocity;
   //      //Neat vector maths, used for checking if the objects moves towards one another.
   //      //TODO investigate, understand, explore. refresh Vector maths also
   //      if(dotProduct > 0){
   //          var collisionScale = dotProduct / distSquared;
   //          var xCollision = centerDistX * collisionScale;
   //          var yCollision = centerDistY * collisionScale;
   //          //The Collision vector is the speed difference projected on the Dist vector,
   //          //thus it is the component of the speed difference needed for the collision.
   //          var combinedMass = this.mass + circle.mass;
   //          var collisionWeightA = 2 * circle.mass / combinedMass;
   //          var collisionWeightB = 2 * this.mass / combinedMass;
   //          this.dx += collisionWeightA * xCollision;
   //          this.dy += collisionWeightA * yCollision;
   //          circle.dx -= collisionWeightB * xCollision;
   //          circle.dy -= collisionWeightB * yCollision;
   //      }
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

	//Takes dx and a dy and returns a vector array
	// NOT USED
	function createVector(dx,dy){
		var magnitude = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
		var direction =Math.atan(dy/dx);
		return [magnitude,direction];
	}

	//Attach ball factory to the window.  Curious what browsers this doesnt work on (Check)
	global.BallFactory = BallFactory;

}(typeof window !== "undefined" ? window : this));