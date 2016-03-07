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
for (i = 0; i < 25; i++) {
	var newBall = {};
	newBall.x = getRandomInt(0,State.room.width); //DEBUG
	newBall.y = getRandomInt(0,State.room.height); //DEBUG 40 for some reason works correctly, test 70
	newBall.mass = 1;
	newBall.radius = 10;
	newBall.color = "red";
	newBall.dx = getRandomInt(-25,25);
	newBall.dy = getRandomInt(-25,25);
	//newBall.ddy = 9.8;
    State.balls.push(BallFactory(newBall));
}

//Get letter end point position
var letterPositions = makeLetter("BAD",[75,75]);
console.log(letterPositions);

//target balls for making a letter
// how many balls needed
// end position of each ball [x's] and [y's]
//TODO have abetter way of making letters, right now too hard to read
for (var i = 0 ; i < letterPositions[0].length; i++) {
	var currletterX = letterPositions[0][i];
	for (var j = currletterX.length - 1; j >= 0; j--) {
		var targetBall = {};
		targetBall.x = getRandomInt(0,State.room.width);
		targetBall.y = getRandomInt(0,State.room.height);
		targetBall.mass = 1;
		targetBall.radius = 10;
		targetBall.color = "green";
		targetBall.dx = getRandomInt(-25,25);
		targetBall.dy = getRandomInt(-25,25);
		targetBall.endX = currletterX[j]; //since I'm already looking at the X value
		targetBall.endY = letterPositions[1][i][j];
		targetBall.isSpecial = true;
	    State.balls.push(BallFactory(targetBall));
	}
	console.log('letter #' + i);
	console.log('EndX: ' + letterPositions[0][i]);
	console.log('EndY: ' + letterPositions[1][i]);
}

//     for (i = 0; i < 4; i++) {
// 	var targetBall = {};
// 	targetBall.x = getRandomInt(0,State.room.width); //DEBUG
// 	targetBall.y = getRandomInt(0,State.room.height); //DEBUG 40 for some reason works correctly, test 70
// 	console.log(targetBall.x);
// 	console.log(targetBall.y);
// 	targetBall.mass = 2;//heavier
// 	targetBall.radius = 20;
// 	targetBall.color = "red";
// 	targetBall.dx = getRandomInt(-50,50);
// 	targetBall.dy = getRandomInt(-50,50);
// 	targetBall.endX = getRandomInt(20,State.room.width);
// 	targetBall.endY = getRandomInt(20,State.room.height);
// 	targetBall.isSpecial = true;
//     State.balls.push(BallFactory(targetBall));
// }

//Returns [x],[y] values needed to create a letter
//starting corner is the upperleft [x,y] coordinates for writing the letter
//	Conceptual: just have a set letter (based on 0,0) and update coordinates based on new starting corner
//		Could make recursivel and call until letters is empty
//		assuming left to right writing
//TODO ensure string will fit on Canvas
function makeLetter(letters,startingCorner,resultsX,resultsY){
	var coordinatesX = [];
	var coordinatesY = [];
	var hLet = 120; //max height a letter can take
	var wLet = 90; //max width a letter can take
	var endCoord = [0,0];
	resultsX = resultsX || [];
	resultsY = resultsY || [];
	var currLetter = letters.charAt(0);
	console.log('currLetter = ' + currLetter);

	if (currLetter == "A") {
		coordinatesX = [0.55*wLet,0.16*wLet,0.55*wLet,85,0,wLet];
		coordinatesY = [0,0.5*hLet,0.5*hLet,0.5*hLet,hLet,hLet];
	}
	if (currLetter == "B") {
		coordinatesX = [0,0,0,0.5*wLet,0.5*wLet,0.5*wLet,wLet,wLet];
		coordinatesY = [0,0.5* hLet,hLet,0,0.5* hLet,hLet,0.25*hLet,0.75*hLet];
	}
	if (currLetter == "D") {
		coordinatesX = [0,0,0,0.5*wLet,0.5*wLet,wLet,wLet];
		coordinatesY = [0,0.5* hLet,hLet,0,hLet,0.25*hLet,0.75*hLet];
	}
	for (var i = coordinatesX.length - 1; i >= 0; i--) {
		coordinatesX[i] += startingCorner[0];
		coordinatesY[i] += startingCorner[1];
	}
	resultsX.push(coordinatesX);
	resultsY.push(coordinatesY);
	endCoord[0] = Math.max.apply(null,coordinatesX) + 60; //the 60 is a 'space' between letters
	endCoord[1] = Math.min.apply(null,coordinatesY);
	console.log('End Coorders are: ' + endCoord);
	if (letters.length === 1) {
		return [resultsX,resultsY];} else{
		console.log("Substr: "+ letters.substring(1));
		return makeLetter(letters.substring(1), endCoord,resultsX,resultsY);
	}
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
		currBall.gotoEndGoal(State.totalTimePassed);
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