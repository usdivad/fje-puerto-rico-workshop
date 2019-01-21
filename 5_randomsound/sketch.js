// Visual params
var cnv;

var currMarkerThickness = 0;
var maxMarkerThickness = 10;

var currGridThickness = 0;
var maxGridThickness = 10;

// Game params
var board = [
	" ", " ", " ",
	" ", " ", " ",
	" ", " ", " "
];
// board = [
// 	"x", " ", " ",
// 	" ", "o", " ",
// 	" ", " ", "x"
// ];

var currMarker = "x";
var currNumMoves = 0;
var maxNumMoves = 8;

var winner = {"positions": [], "marker": " "};


// Synth params
// var voiceX = new Tone.Synth({"oscillator": {"type": "triangle"}});
// var voiceO = new Tone.Synth({"oscillator": {"type": "fmtriangle"}});
var numSynthVoices = 4;
var synthX = new Tone.PolySynth(numSynthVoices, function() {return new Tone.Synth({"oscillator": {"type": "triangle"}});}).toMaster();
var synthO = new Tone.PolySynth(numSynthVoices, function() {return new Tone.Synth({"oscillator": {"type": "fmtriangle"}});}).toMaster();
var synthBGM = new Tone.PolySynth(numSynthVoices, function() {return new Tone.Synth({"oscillator": {"type": "fattriangle"}});}).toMaster();
var hasBGMStarted = false;

var availableNotes = ["C4", "D4", "E4", "F4", "G4", "A4", "B4",
					  "C5", "D5", "E5", "F5", "G5", "A5", "B5"];
var currBGMNotes = ["C3", "G3"];


// Processing functions
function setup() {
	cnv = createCanvas(windowWidth, windowHeight);
	background("#000");
	// cnv.position( (windowWidth - width) / 2, (windowHeight - height) / 2);
	// console.log(cnv);
}

function draw() {
	// Background
	background("#000");

	// Grid
	strokeWeight(currGridThickness + 2);
	stroke("#faf");
	line(0, height/3, width, height/3);
	line(0, height*2/3, width, height*2/3);
	line(width/3, 0, width/3, height);
	line(width*2/3, 0, width*2/3, height);

	currGridThickness = Math.max(0, currGridThickness - 1);

	// ellipse(50, 50, 80, 80);

	// Existing bits
	noFill();
	strokeWeight(6 + currMarkerThickness);
	for (var i=0; i<board.length; i++) {
		drawBoardCell(i, board[i]);
	}
	currMarkerThickness = Math.max(0, currMarkerThickness - 1);

	// Mouse hover
	if (!isGameOver()) {
		strokeWeight(1);
		drawMarkerHover();
	}
}

function mousePressed() {
	if (!isGameOver()) {
		placeMarker(mouseX, mouseY);
	}
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


// Custom functions
function drawBoardCell(i, marker) {
	// Setup position and size
	var markerSize = Math.min(width, height);
	var posX = ((i%3) * width/3) + (width/6); // Cell, then center of cell
	var posY = (Math.floor(i/3) * height/3) + (height/6);

	// Draw
	if (marker == "x") {
		// Winning markers
		if (marker == winner["marker"] && winner["positions"].indexOf(i) >= 0) {
			strokeWeight(24);
			stroke("#0a9");

			line(posX - markerSize/16, posY - markerSize/16, posX + markerSize/16, posY + markerSize/16);
			line(posX + markerSize/16, posY - markerSize/16, posX - markerSize/16, posY + markerSize/16);
		}

		// Reset for regular markers
		strokeWeight(6);
		stroke("#0fa");

		// Diagonal lines
		line(posX - markerSize/16, posY - markerSize/16, posX + markerSize/16, posY + markerSize/16);
		line(posX + markerSize/16, posY - markerSize/16, posX - markerSize/16, posY + markerSize/16);
	}
	else if (marker == "o") {
		// Winning markers
		if (marker == winner["marker"] && winner["positions"].indexOf(i) >= 0) {
			strokeWeight(24);
			stroke("#09a");

			ellipse(posX, posY, markerSize/8, markerSize/8);
		}

		// Reset for regular markers
		strokeWeight(6);
		stroke("#0af");
		ellipse(posX, posY, markerSize/8, markerSize/8);
	}
}

function placeMarker(x, y) {
	// var i = ((x/width) % 3) + ((y/height) % 3);
	var i = getBoardPositionFromCoordinates(x, y);

	if (!isBoardPositionOccupied(i)) {
		board[i] = currMarker; // Place marker in data
		winner = determineWinner(); // Determine winner
		playMarkerPlacementSound(currMarker, i); // Play music
		startBGM(); // Start BGM if not started already
		currMarkerThickness = maxMarkerThickness; // Reset marker thickness for animation
		currMarker = currMarker == "x" ? "o" : "x"; // Switch marker
		currNumMoves++; // Increment num moves
		if (currNumMoves > maxNumMoves || isGameOver()) {
			stopBGM(); // Stop BGM if game is done
		}
	}
}

function drawMarkerHover() {
	// Skip occupied spaces
	if (isBoardPositionOccupied(getBoardPositionFromCoordinates(mouseX, mouseY))) {
		return;
	}

	// Setup
	var markerSize = Math.min(width, height);

	// Draw
	if (currMarker == "x") {
		stroke("#0fa");

		// Diagonal lines
		line(mouseX - markerSize/16, mouseY - markerSize/16, mouseX + markerSize/16, mouseY + markerSize/16);
		line(mouseX + markerSize/16, mouseY - markerSize/16, mouseX - markerSize/16, mouseY + markerSize/16);
	}
	else if (currMarker == "o") {
		stroke("#0af");
		ellipse(mouseX, mouseY, markerSize/8, markerSize/8);
	}
}

function getBoardPositionFromCoordinates(x, y) {
	var i = (Math.floor((x/width) * 3)) + (Math.floor((y/height) * 3) * 3);
	return i;
}

function isBoardPositionOccupied(i) {
	return board[i] != " ";
}

// Determine winner of the game
function determineWinner() {
	// var isGameOver = false;
	var winningPositions = [];
	var winningMarker = " ";

	// Set up position indices and steps
	var horizontalPositions = [0, 3, 6];
	var horizontalStep = 1;

	var verticalPositions = [0, 1, 2];
	var verticalStep = 3;

	var diagonalTopLeftPositions = [0];
	var diagonalTopLeftStep = 4;

	var diagonalTopRightPositions = [2];
	var diagonalTopRightStep = 2;

	// Composite horizontal, vertical, diagonal
	var dataToCheck = [
		{"positions": horizontalPositions, "step": horizontalStep},
		{"positions": verticalPositions, "step": verticalStep},
		{"positions": diagonalTopLeftPositions, "step": diagonalTopLeftStep},
		{"positions": diagonalTopRightPositions, "step": diagonalTopRightStep},
	];

	// Check all possible winning combos
	for (var positionStepPairIndex=0; positionStepPairIndex < dataToCheck.length; positionStepPairIndex++) {
		var positions = dataToCheck[positionStepPairIndex]["positions"];
		var step = dataToCheck[positionStepPairIndex]["step"];

		// Each starting position for h, v, d
		for (var startingPositionIndex=0; startingPositionIndex < positions.length; startingPositionIndex++) {
			var startingPosition = positions[startingPositionIndex];
			if (board[startingPosition] == board[startingPosition + step] &&
				board[startingPosition] == board[startingPosition + (step*2)] &&
				board[startingPosition] != " ") {
				winningPositions = [startingPosition,
									startingPosition + step,
									startingPosition + (step*2)];
				winningMarker = board[startingPosition];
				console.log("We have a winner!");
			}
		}
	}

	console.log("winningPositions:");
	console.log(winningPositions);
	console.log("winningMarker = " + winningMarker);

	return {"positions": winningPositions, "marker": winningMarker};
}

// Checks if game is over
function isGameOver() {
	// console.log(winner);
	return winner["marker"] != " ";
}


function playMarkerPlacementSound(marker, i) {
	// Setup notes
	var notes = availableNotes;
	var note1 = chooseRandomFromArray(notes);
	note1 = "C4";
	notes = notes.filter(function(v, i, a) {return v != note1;});
	var note2 = chooseRandomFromArray(notes);
	notes = notes.filter(function(v, i, a) {return v != note2;});
	var note3 = chooseRandomFromArray(notes);
	notes = notes.filter(function(v, i, a) {return v != note3;});
	var note4 = chooseRandomFromArray(notes);

	// Add to BGM
	console.log(note1 + ", " + note2 + ", " + note3 + ", " + note4);
	currBGMNotes = [note1.replace("4", "3").replace("5", "4"),
					note2.replace("4", "3").replace("5", "4"),
					note3.replace("4", "3").replace("5", "4"),
					note4.replace("4", "3").replace("5", "4")
					];

    // Play
	if (currMarker == "x") {
		if (winner["marker"] == currMarker) {
			synthX.triggerAttackRelease(["C4", "E4", "G4", "C5"], "8n");	
		}
		else {
			synthX.triggerAttackRelease([note1, note2, note3, note4], "8n");
		}
	}
	else if (currMarker == "o") {
		if (winner["marker"] == currMarker) {
			synthO.triggerAttackRelease(["C4", "E4", "G4", "C5"], "8n");	
		}
		else {
			synthO.triggerAttackRelease([note1, note2, note3, note4], "8n");
		}
	}
}

function chooseRandomFromArray(arr) {
	var i = Math.floor(Math.random() * arr.length);
	return arr[i];
}

function startBGM() {
	if (hasBGMStarted) return;

	Tone.Transport.start();
	Tone.Transport.scheduleRepeat(function(t) {

		// BGM
		var note1 = currBGMNotes[0];
		var note2 = chooseRandomFromArray(currBGMNotes.slice(1,4));

		if (currMarker == "x") {
			synthBGM.triggerAttackRelease([note1, note2], "16n");
		}
		else if (currMarker == "o") {
			synthBGM.triggerAttackRelease([note1, note2], "16n");
		}

		// Grid animation
		currGridThickness = maxGridThickness;

	}, "8n");

	hasBGMStarted = true;
}

function stopBGM() {
	// Play ending chord
	synthBGM.triggerAttackRelease(["C3", "E3", "G3", "C4", "G4", "C5"], "8n");
	synthX.triggerAttackRelease(["C4", "E4", "G4", "C5"], "8n");
	
	// Stop transport
	Tone.Transport.stop();
}

