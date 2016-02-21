(function(global){
	// General Notes:
	//Double check that anom funcitons take the name of properties theyre asssigned to in current JS engine versions

	var g = 9.8;  // Acceleration due to gravity, check if this is the proper way to instantiate a constant

	//radius will always be a positive number
	var Ball = function( initparams ){
		this.x_curr = initparams.x;
		this.y_curr = initparams.y;
		this.color = initparams.color;
		this.radius = initparams.radius;
		this.mass = initparams.mass;
		this.KineticEnergy = 0;
		//TODO potential energy (Needs to be aware of external object, maybe don't handle it here)
		this.dx = 0;
		this.dy = 0;
		this.ddx = initparams.ddx || 0; //acceleration on ball X dir (Should ball contain X,Y accel this i think so)
		this.ddy = initparams.ddy || 0; //acceleration on ball Y dir (Remember canvas coor (x,-y) not normal cartersian)
	};

	//Will be exposed to the browser.
	//Balloptions used are x,y,size,color,radius,mass
	var BallFactory = function (ballinit){
		//TODO validate init params
		return new Ball(ballinit);
	};

	//Simulation engine
	Ball.prototype.updateMotion = function(dt) {
	        //ddx/ddy signs will reflect direction
	        this.dy += this.ddy * dt;
	        this.y_curr += this.dy * dt + (0.5 * this.ddy * Math.pow(dt,2));
	        //Below dx is 0 at all times in ball drop down simulation
	        this.dx -= this.ddx * dt + 0.5 * this.ddx * Math.pow(dt,2);
	        this.x_curr += this.dx * dt;
	        //update Ball Kinetic energy. is this correct form for .5mv^2?  double check its right when dx != 0
	        this.KineticEnergy = 0.5 * this.m * (Math.pow(this.dx,2) + Math.pow(this.dy,2));
	        //TODO handle potential energy
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
	};

	//Take a rect and see if the the ball is colliding with any of botders
	//Note: Assumes the ball is in the box for this collision detection to be valid
	//Note:  Coonceptual approach
	//	I take a ball with radius R in a box.  I assume that there are 4 points on the ball
	//	which will collide first with any wall of the rectangle.  In a normal rectangle (no spinning/offset)
	//	The 4 points are the points on the circle which lie tangent to the rectangle's sides -- hope that made sense
	//		In the future when a rectangle rotates I'll have these 4 points rotate with the rectangle
	Ball.prototype.RectangleBorderCollision = function (rect) {
		var rightSideRect = Math.max(rect.x + rect.width,rect.x);
		var leftSideRect = Math.min(rect.x + rect.width,rect.x);
		var bottSideRect = Math.max(rect.y + rect.height, rect.y);
		var topSideRect = Math.min(rect.y + rect.height, rect.y);
		var collisionStr = []; //Array of strings
		//var x_InRectRange = (this.x_curr + this.radius >= rightSideRect) ||
		//					(this.x_curr - this.radius <= leftSideRect);
		//var y_InRectRange = (this.y_curr + this.radius >= bottSideRect) ||
		//					(this.y_curr - this.radius <= topSideRect);
		//return (x_InRectRange || y_InRectRange);
		//Same thing but return what wall was hit.  Review this handling
		if (this.x_curr + this.radius >= rightSideRect) {collisionStr.push("right");}
		if (this.x_curr - this.radius <= leftSideRect) {collisionStr.push("left");}
		if (this.y_curr + this.radius >= bottSideRect) {collisionStr.push("bottom");}
		if (this.y_curr - this.radius <= topSideRect) {collisionStr.push("top");}
		if (collisionStr.length !== 0){
			console.log(this.y_curr);
			//Move ball to surface where it collided with
			//change dir based on collision "wall" str array
			//	NOTE: moving ball breaks physics.  Better to recalculate what dx or dy was at collision time
			for (var i = collisionStr.length - 1; i >= 0; i--) {
				if (collisionStr[i] == "right") {this.x = rightSideRect - this.radius; this.dx = -1 * this.dx;}
				if (collisionStr[i] == "left") {this.x = leftSideRect + this.radius; this.dx = -1 * this.dx;}
				if (collisionStr[i] == "top") {this.y = topSideRect + this.radius; this.dy = -1 * this.dy;}
				if (collisionStr[i] == "bottom") {this.y = bottSideRect - 7*this.radius; this.dy = -1 * this.dy;}
				console.log(this.dy);
				}
				//expect ball to bounce higher than it should
			}
	};

	Ball.prototype.getVectorVelocity = function(){
		var magnitude = Math.sqrt(Math.pow(this.dx, 2) + Math.pow(this.dy, 2));
		var direction =Math.atan(this.dy/this.dx);
		return [magnitude,direction];
	};

	//[OBSOLETE]
	//collStr can contain more than 1 wall if multiple collisions
	Ball.prototype.handleCollision = function(collStr,rect){
		//Move ball to surface where it collided with
		//change dir based on collision "wall" str array
		for (var i = collStr.length - 1; i >= 0; i--) {
			if (collStr[i] == "right" || collStr[i] == "left") {this.dx = -1 * this.dx;}
			if (collStr[i] == "top" || collStr[i] == "bottom") { this.dy = -1 * this.dy;}
		}
	};

	//Attach ball factory to the window.  Curious what browsers this doesnt work on (Check)
	global.BallFactory = BallFactory;

}(typeof window !== "undefined" ? window : this));