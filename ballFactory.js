(function(global){
	// Double check that anom funcitons take the name of properties theyre asssigned to in current JS engine versions
	
	var Ball = {
		curr_x: 0,
		curr_y: 0,
		dx:0,
		dy:0,
		//TODO end goal for spelling a name
	};

	var BallFactory = {
		CreateBall : function(){
			//Will be exposed to the browser.  Creates Balls

		}
	};
	//Attach ball factory to the window.  Should be IE safe based on global value
	global.BallFactory = BallFactory;

}(typeof window !== "undefined" ? window : this));