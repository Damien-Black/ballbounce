(function(global){
	// General Notes:
	//Double check that anom funcitons take the name of properties theyre asssigned to in current JS engine versions

	var g = 9.8;  // Acceleration due to gravity, check if this is the proper way to instantiate a constant

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
	};

	//Will be exposed to the browser.
	//Balloptions used are x,y,size,color,radius,mass
	var BallFactory = function (ballinit){
		//TODO validate init params
		return new Ball(ballinit);
	};

	//Simulation engine
	Ball.prototype.updateSimulation = function(dt) {
	        // F = mg for gravity pulling down a point mass. We equate that force
	        // with ma to find acceleration and get:
	        // F = mg = ma --> g = a
	        var ddx = 0;
	        var ddy = -g;
	        // ^ when we're handling collisions, there will be more terms
	        this.dy -= ddy * dt;
	        this.y_curr += this.dy * dt;
	        //Below dx is 0 at all times in ball drop down simulation
	        this.dx -= ddx * dt;
	        this.x_curr += this.dx * dt;

	        // Collision detection against the ground
	        //handle via events, pretty important

	        //update Ball Kinetic energy. is this correct form for .5mv^2?  double check its right when dx != 0
	        this.KineticEnergy = 0.5 * this.m * (this.dx * this.dx + this.dy * this.dy);
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

	Ball.prototype.CircleCollision = function(circle){
		//Currently objects touching exactly are considered colliding.
		var Xdist = Math.abs(this.x_curr - circle.x_curr);
		var Ydist = Math.abs(this.y_curr - circle.y_curr);		
		var distanceOfCenters = Math.sqrt(Math.pow(Xdist,2) + Math.pow(Ydist,2));
		return (distanceOfCenters <= (this.radius + circle.radius));
	};

	//Attach ball factory to the window.  Curious what browsers this doesnt work on (Check)
	global.BallFactory = BallFactory;

}(typeof window !== "undefined" ? window : this));