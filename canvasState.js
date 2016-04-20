(function(global){
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
//Create Rectangle matrix
var point1 = [canvas.width*0.75,canvas.height*0.25];
var point2 = [canvas.width*0.75,canvas.height*0.75];
var point3 = [canvas.width*0.25,canvas.height*0.75];
var point4 = [canvas.width*0.25,canvas.height*0.25];
State.room.rectMatrix = $M([point1,point2,point3,point4]);
State.room.offset = 0;
var Rect = State.room.rectMatrix; //Short hand for rectangle
Rect.offset = 0;

//Add balls
// for (i = 0; i < 25; i++) {
// 	var newBall = {};
// 	newBall.x = getRandomInt(0,State.room.width); //DEBUG
// 	newBall.y = getRandomInt(0,State.room.height); //DEBUG 40 for some reason works correctly, test 70
// 	newBall.mass = 1;
// 	newBall.radius = 10;
// 	newBall.color = "blue";
// 	newBall.dx = getRandomInt(-25,25);
// 	newBall.dy = getRandomInt(-25,25);
// 	//newBall.ddy = 9.8;
//     State.balls.push(BallFactory(newBall));
// }

//TEST for rotating scenario

//Get letter end point position
//TODO center letters of any length (right now it centers 3)
var letterPositions = makeLetter("",
	[Math.min(State.room.x + State.room.width*0.15,State.room.x+ State.room.width*0.85),
	Math.min(State.room.y + State.room.height*0.3,State.room.y + State.room.height*0.7)]);

//target balls for making a letter
// how many balls needed
// end position of each ball [x's] and [y's]
//TODO have abetter way of making letters, right now too hard to read
if (letterPositions) {
	for (var i = 0 ; i < letterPositions[0].length; i++) {
	var currletterX = letterPositions[0][i];
	for (var j = currletterX.length - 1; j >= 0; j--) {
		var targetBall = {};
		targetBall.x = getRandomInt(0,State.room.width);
		targetBall.y = getRandomInt(0,State.room.height);
		targetBall.mass = 1;
		targetBall.radius = 10;
		targetBall.color = "red";
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
}

//TEST for rotating scenario
var testBall1 = {};
testBall1.x = 250;
testBall1.y = 300;
testBall1.mass = 1;
testBall1.radius = 20;
testBall1.color = "red";
testBall1.dx = 20;
testBall1.dy = 0;
State.balls.push(BallFactory(testBall1));

// var testBall2 = {};
// testBall2.x = 500;
// testBall2.y = 300;
// testBall2.mass = 1;
// testBall2.radius = 20;
// testBall2.color = "blue";
// testBall2.dx = -20;
// testBall2.dy = 0;
// State.balls.push(BallFactory(testBall2));


//Returns [x],[y] values needed to create a letter
//starting corner is the upperleft [x,y] coordinates for writing the letter
//	Conceptual: just have a set letter (based on 0,0) and update coordinates based on new starting corner
//		Could make recursivel and call until letters is empty
//		assuming left to right writing
//TODO ensure string will fit on Canvas
function makeLetter(letters,startingCorner,resultsX,resultsY){
	if (letters === "") {return;} //handle empty string
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

//Returns a rotated Rect matrix
function RotateRect(rectangle, radians) {
	//Create centered matrix
	var newElements= [];
	for (var i = rectangle.elements.length - 1; i >= 0; i--) {
		var newX = rectangle.elements[i][0] - canvas.width*0.5;
		var newY = rectangle.elements[i][1] - canvas.height*0.5;
		newElements.push([newX,newY]);
	}
	var resultMatrix = $M(newElements);
	// Rotate points
	resultMatrix = resultMatrix.multiply(MatrixObj.Rotation(radians));
	State.room.offset += radians;
	State.room.offset = (State.room.offset >= Math.PI*2) ? (State.room.offset - (2*Math.PI) + (Math.PI / 64)) : State.room.offset; //keep offset below 2pi (keeps number small is this important?)
	//Recenter on original center
	newElements.length = 0;
	for (var i = resultMatrix.elements.length - 1; i >= 0; i--) {
		var newX = resultMatrix.elements[i][0] + canvas.width*0.5;
		var newY = resultMatrix.elements[i][1] + canvas.height*0.5;
		newElements.push([newX,newY]);
	}
	//Return Matrix
	return $M(newElements);
}

// Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function DrawRect(){
	ctx.beginPath();
	ctx.fillStyle = "rgb(200,200,200)";
	ctx.lineWidth="6";
	ctx.strokeStyle="red";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

	//Draw Rect in center of the canvas
	var point1 = Rect.row(1);
	var point2 = Rect.row(2);
	var point3 = Rect.row(3);
	var point4 = Rect.row(4);
	ctx.moveTo(point1.elements[0], point1.elements[1]);
	ctx.lineTo(point2.elements[0], point2.elements[1]);
	ctx.lineTo(point3.elements[0], point3.elements[1]);
	ctx.lineTo(point4.elements[0], point4.elements[1]);
	ctx.lineTo(point1.elements[0], point1.elements[1]);
	ctx.stroke();
}

function loop(){
	//change State - Simulation engine call for next time point
	//Move center to origin (0) and rotate using matrix, then move center to original location
	Rect = RotateRect(Rect, Math.PI / 128);
	for (i = 0, length = State.balls.length; i < length; i++) {
	var currBall = State.balls[i];
	currBall.updatePosition(State.dt);
	currBall.RectangleBorderCollision2(Rect,State.room.offset,State.dt); //dt passing here is suspect
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
	DrawRect();
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
global.State = State;

})(typeof window !== "undefined" ? window : this);