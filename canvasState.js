(function(){

var canvas=$("#canvas")[0];
var ctx=canvas.getContext("2d");
//initial state
var State = {
	TotalKE: 0,
	TotalPE: 0,
	dt: 0.2,
	totalTimePassed: 0
};
State.balls = [];
State.room = {}; //room in this case is a rectangle obj
State.room.x = 0;
State.room.y = 0;
State.room.offset = 0; //Offset will be used for a spinning room (in Radians)
State.room.width = canvas.width;
State.room.height = canvas.height;

//Add balls
    for (i = 0; i < 96; i++) {
    	var newBall = {};
		newBall.x = getRandomInt(0,State.room.width); //DEBUG
		newBall.y = getRandomInt(0,State.room.height); //DEBUG 40 for some reason works correctly, test 70
		newBall.mass = 1;
		newBall.radius = 10;
		newBall.color = "red";
		newBall.dx = getRandomInt(-50,50);
		newBall.dy = getRandomInt(-50,50);
        State.balls.push(BallFactory(newBall));
    }
        for (i = 0; i < 4; i++) {
    	var targetBall = {};
		targetBall.x = getRandomInt(0,State.room.width); //DEBUG
		targetBall.y = getRandomInt(0,State.room.height); //DEBUG 40 for some reason works correctly, test 70
		console.log(targetBall.x);
		console.log(targetBall.y);
		targetBall.mass = 1;
		targetBall.radius = 10;
		targetBall.color = "green";
		targetBall.dx = getRandomInt(-50,50);
		targetBall.dy = getRandomInt(-50,50);
		targetBall.endX = 60;
		targetBall.endY = 60;
		targetBall.isSpecial = true;
        State.balls.push(BallFactory(targetBall));
    }

// Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}


//Collisions are elastic.  Preserved E and p
//This method takes 2 shapes and calculates their new x,y velocity then applies it
//if there is no shape 2 then the collision is assumed to be with a fixed obj
function collisionHandle(cir1, cir2){
	var Xdist = Math.abs(cir1.x_curr - cir2.x_curr);
	var Ydist = Math.abs(cir1.y_curr - cir2.y_curr);
	var distanceOfCenters = Math.sqrt(Math.pow(Xdist,2) + Math.pow(Ydist,2));
	if (distanceOfCenters <= (cir1.radius + cir2.radius)) {
		cir1.ResolveCollision(cir2);
	}
}

function loop(){
	//change State - Simulation engine call for next time point
	for (i = 0, length = State.balls.length; i < length; i++) {
	var currBall = State.balls[i];
	currBall.updatePosition(State.dt);
	currBall.RectangleBorderCollision(State.room,State.dt); //dt passing here is suspect
	if (State.totalTimePassed > 10) { //40 is good
		if (currBall.isSpecial) {
		currBall.gotoEndGoal();
		}
	}
	for (j = i + 1; j < State.balls.length; j++){
        if (currBall.IsCircleCollision(State.balls[j]))  
        {
            currBall.ResolveCollision(State.balls[j],State.dt); //Not using dt yet
        }
    } //Handle ball to ball collisions

	}
	//Pulse target Balls to end locations
	//Clear Canvas
	ctx.fillStyle = "rgb(200,200,200)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
	//Redraw - Redraw all balls
    for (i = State.balls.length - 1; i >= 0; i--) {
        var ball = State.balls[i];
        ball.DrawBall(ctx);
    }
    State.totalTimePassed += State.dt;
}
//Set interval
setInterval(loop, 50);

//Expose the State in the future for user interaction

})();