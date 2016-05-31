//Use Vectors from Sylvester API instead of dx dy
(function(global){
	// General Notes:
	//Check that anom functions take the name of properties theyre asssigned to in current JS engine versions

	//var t_passed = 0; //DEBUG updating time value overtime

	//Axis of rotation
	var axis = $L([0,0,0],[0,0,1]);

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

	//Will be exposed to the browser
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
		//this.color = ((this.dx > 40) | (this.dy > 40)) ? "green" : this.color; DEBUG
		this.dx = (this.dx > 40) ? 40 : this.dx;
		this.dy = (this.dy > 40) ? 40 : this.dy;
        this.y_curr += (this.dy * dt) + (0.5 * this.ddy * Math.pow(dt,2));
        this.x_curr += (this.dx * dt) + (0.5 * this.ddx * Math.pow(dt,2));
        //TODO handle potential energy
	};

	Ball.prototype.gotoEndGoal = function(totalTime) {
		var velocityMultiplier = (totalTime < 50) ? totalTime * 0.1 : 5; //limit time multiplier to 100 to avoid velocities exploding out
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

	    //DEBUG START - drawing "The 4 points" on circle
	    // ctx.beginPath();
	    // ctx.arc(this.circPoint12[0], this.circPoint12[1], 5, 0, 2 * Math.PI, false);
	    // ctx.fillStyle = "red";
	    // ctx.fill();
	    // ctx.lineWidth = 5;
	    // ctx.strokeStyle = '#003300';
	    // ctx.stroke();

	    // ctx.beginPath();
	    // ctx.arc(this.circPoint23[0], this.circPoint23[1], 5, 0, 2 * Math.PI, false);
	    // ctx.fillStyle = "blue";
	    // ctx.fill();
	    // ctx.lineWidth = 5;
	    // ctx.strokeStyle = '#003300';
	    // ctx.stroke();

	    // ctx.beginPath();
	    // ctx.arc(this.circPoint34[0], this.circPoint34[1], 5, 0, 2 * Math.PI, false);
	    // ctx.fillStyle = "green";
	    // ctx.fill();
	    // ctx.lineWidth = 5;
	    // ctx.strokeStyle = '#003300';
	    // ctx.stroke();

	    // ctx.beginPath();
	    // ctx.arc(this.circPoint41[0], this.circPoint41[1], 5, 0, 2 * Math.PI, false);
	    // ctx.fillStyle = "gold";
	    // ctx.fill();
	    // ctx.lineWidth = 5;
	    // ctx.strokeStyle = '#003300';
	    // ctx.stroke();
	    //DEBUG END
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

	Ball.prototype.RectangleBorderCollision2 = function(Rect,offset,dt){
		//create vector for both axis of the border, remember with canvas Y is flipped
		var point1 = Rect.row(1);
		var point2 = Rect.row(2);
		var point3 = Rect.row(3);

		var side12 = $V([point2.elements[0] - point1.elements[0], -1 * (point2.elements[1] - point1.elements[1]),0]);  
		var side23 = $V([point3.elements[0] - point2.elements[0], -1 * (point3.elements[1] - point2.elements[1]),0]); 
		var side12Normal = side12.rotate(-1 * Math.PI / 2, axis); //want normals pointing towards the center of the circle
		var side23Normal = side23.rotate(-1 * Math.PI / 2, axis);
		//Instead Circle is 4 points (which always collide with a box first) rotate those 4 points that correspod to a side
		//  Then Project each point onto 1 of 2 possible axis the rectangle can have, result should be >0 for no collision
		circPoint12 = [this.x_curr + (this.radius * Math.cos(offset)), this.y_curr - (this.radius * Math.sin(offset))];
		circPoint23 = [this.x_curr + (this.radius * Math.sin(offset)), this.y_curr + (this.radius * Math.cos(offset))];
		circPoint34 = [this.x_curr - (this.radius * Math.cos(offset)), this.y_curr + (this.radius * Math.sin(offset))];
		circPoint41 = [this.x_curr - (this.radius * Math.sin(offset)), this.y_curr - (this.radius * Math.cos(offset))];

		circVector12 = $V([circPoint12[0] - point1.elements[0],-1 * (circPoint12[1] - point1.elements[1]),0]);
		circVector23 = $V([circPoint23[0] - point3.elements[0],-1 * (circPoint23[1] - point3.elements[1]),0]);
		circVector34 = $V([circPoint34[0] - point3.elements[0],-1 * (circPoint34[1] - point3.elements[1]),0]);
		circVector41 = $V([circPoint41[0] - point1.elements[0],-1 * (circPoint41[1] - point1.elements[1]),0]);
		//for each side find dot product Normal with circle is less than or equal to 0
		pointLineBorderCollisionHandle(this,circVector12,side12Normal.toUnitVector());
		pointLineBorderCollisionHandle(this,circVector23,side23Normal.toUnitVector());
		pointLineBorderCollisionHandle(this,circVector34,side12Normal.rotate(Math.PI, axis).toUnitVector()); //Negative of side34 vector
		pointLineBorderCollisionHandle(this,circVector41,side23Normal.rotate(Math.PI, axis).toUnitVector()); //Negative of side41 vector

		//DEBUG stuff start
		this.circPoint23 = circPoint23;
		this.circPoint12 = circPoint12;
		this.circPoint23 = circPoint23;
		this.circPoint34 = circPoint34;
		this.circPoint41 = circPoint41;
		//DEBUG stuff end
	};

	//handle a collision with the rectangle border
	//Rect: rectangle Obj | rectNormal: Vector(sylvester API) normal to rectangle side 
	function pointLineBorderCollisionHandle(circle,pointToSideVec,lineUnitVecNorm) {
		posVecDot = pointToSideVec.dot(lineUnitVecNorm);		
		if (posVecDot < 0) {
			//if ball is moving away from rectangle do nothing
			var ballV = $V([circle.dx,-1 * circle.dy,0]);
			var collAxisVdot = ballV.dot(lineUnitVecNorm);
			var dtPastWall = posVecDot / collAxisVdot;
			//reposition ball at edge of rect
			var posCorrection = lineUnitVecNorm.x(posVecDot);
			circle.x_curr -= (posCorrection.elements[0]);
			circle.y_curr +=  (posCorrection.elements[1]);
			//move ball if bounce is needed (dot velocity towards wall)
			if (collAxisVdot < 0) {
				var bounceVector = lineUnitVecNorm.x(collAxisVdot * -1);
				//ballV = ballV.add(bounceVector).add(bounceVector);
				circle.dx += bounceVector.elements[0] * 2;
				circle.dy +=  bounceVector.elements[1] * -2;
				circle.x_curr += ( circle.dx * dtPastWall );
				circle.y_curr += ( circle.dy * dtPastWall );
			}
			// if (collAxisDot < 0) {
			// 	//Move ball to edge of circle uses projection NOT physics TODO
			// 	projVectPos = lineUnitVecNorm.x(positionVecDot);
			// 	circle.x_curr -= projVectPos.elements[0];
			// 	circle.y_curr += projVectPos.elements[1];
			// 	console.log(projVectPos.elements);
			// 	//Apply resultant force, project negative ballVec along dx dy and set values respectively
			// 	console.log("Ori Ball:" + ballV.elements);
			// 	console.log*(collAxisDot);
			// 	//Sign-age below is because axis are flipped and I'm using offset not PI/2 + offset
			// 	var bounceVector = lineUnitVecNorm.x(collAxisDot);
			// 	var resultantVec = bounceVector.rotate(Math.PI,$L([0,0,0],[0,0,1]));
			// 	ballV = ballV.add(resultantVec).add(resultantVec);
			// 	console.log("Current Ball: " + ballV.elements);
			// 	circle.dx = ballV.elements[0];
			// 	circle.dy = -1 * ballV.elements[1];
			// }		
		}
	}

	//Helper - Solve a quadratic equation
	//	Ax2 + Bx + C = 0 is the form that is expected and used
	//	Since there are 2 solutions I need to return the sensible solution (time is always positive)
	function quadSolver(A,B,C){
		root1 = ( -B + Math.sqrt(Math.pow(B,2) - 4*A*C) ) / (2*A);
		root2 = ( -B - Math.sqrt(Math.pow(B,2) - 4*A*C) ) / (2*A);
		return Math.max(root1, root2);
	}

	//Attach ball factory to the window.  Curious what browsers this doesnt work on (Check)
	global.BallFactory = BallFactory;

}(typeof window !== "undefined" ? window : this));