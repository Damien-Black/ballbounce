(function(){

var canvas=$("#canvas")[0];
var ctx=canvas.getContext("2d");
//initial state
// For now balls to be used will be set to 5.  Consider making dynamic and allowing user to choose (For the name portion)
var State = {
	TotalKE: 0,
	TotalPE: 0,
	dt: 0.2
};
State.balls = [];
State.room = {}; //room in this case is a rectangle obj
State.room.x = 0;
State.room.y = 0;
State.room.offset = 0; //Offset will be used for a spinning room (in Radians)
State.room.width = canvas.width;
State.room.height = canvas.height;

//Test region.  Add 5 ball
    for (var i = 0; i < 5; i++) {
    	var newBall = {};
		newBall.x = i * 50 + 40;
		//newBall.y = i * 10 + 30;
		newBall.y = 70;
		newBall.mass = 1;
		newBall.radius = 20;
		newBall.color = "red";
		newBall.ddy = 9.8;
        State.balls.push(BallFactory(newBall));
    }
    //	Error when dy = 49.00000000000002  , 50.96000000000002 on bounce
//End test region

//Collisions are elastic.  Preserved E and p
//This method takes 2 shapes and calculates their new x,y velocity then applies it
//if there is no shape 2 then the collision is assumed to be with a fixed obj
function collisionHandle(shape1, shape2){
	shape2 = shape2 || null;
	if (shape2 === null) {
		//bounce:  Find point of collision for obj1 reverse the velocity vector and apply it

	}
	else{
	//Handle an elastic collision
}
}


function loop(){
	//change State - Simulation engine call for next time point
	for (i = 0, length = State.balls.length; i < length; i++) {
	var currBall = State.balls[i];
	currBall.updateMotion(State.dt);
	currBall.RectangleBorderCollision(State.room);
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