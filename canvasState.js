(function(){

var canvas=$("#canvas")[0];
var ctx=canvas.getContext("2d");
console.log(ctx);
//initial state
// For now balls to be used will be set to 5.  Consider making dynamic and allowing user to choose (For the name portion)
var State = {
	TotalKE: 0,
	TotalPE: 0,
	dt: 0.2
};
State.balls = [];
State.room = {};
State.room.width = 300;
State.room.height = 300;

//Test region.  Add 5 ball
    for (var i = 0; i < 5; i++) {
    	var newBall = {};
		newBall.x = i * 50 + 40;
		newBall.y = i * 10 + 30;
		newBall.mass = 1;
		newBall.radius = 20;
		newBall.color = "red";
        State.balls.push(BallFactory(newBall));
    }
//End test region

function loop(){
	//change State - Simulation engine call for next time point
	for (i = 0, length = State.balls.length; i < length; i++) {
	var currBall = State.balls[i];
	currBall.updateSimulation(State.dt);
	}
	//Clear Canvas
	ctx.fillStyle = "rgb(200,200,200)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
	//Redraw - Redraw all balls
    for (i = State.balls.length - 1; i >= 0; i--) {
        var ball = State.balls[i];
        ball.DrawBall(ctx);
    }
}

//Set interval
setInterval(loop, 50);

//Expose the State in the future for user interaction



})();