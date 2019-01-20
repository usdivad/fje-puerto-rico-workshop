var cnv;

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

// var voiceX = new Tone.Synth({"oscillator": {"type": "triangle"}});
// var voiceO = new Tone.Synth({"oscillator": {"type": "fmtriangle"}});

var numSynthVoices = 4;
var synthX = new Tone.PolySynth(numSynthVoices, function() {return new Tone.Synth({"oscillator": {"type": "triangle"}});}).toMaster();
var synthO = new Tone.PolySynth(numSynthVoices, function() {return new Tone.Synth({"oscillator": {"type": "fmtriangle"}});}).toMaster();
var synthBGM = new Tone.PolySynth(numSynthVoices, function() {return new Tone.Synth({"oscillator": {"type": "fattriangle"}});}).toMaster();
var hasBGMStarted = false;
var currNumMoves = 0;
var maxNumMoves = 8;

var availableNotes = ["C4", "D4", "E4", "F4", "G4", "A4", "B4"];
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
	strokeWeight(2);
	stroke("#faf");
	line(0, height/3, width, height/3);
	line(0, height*2/3, width, height*2/3);
	line(width/3, 0, width/3, height);
	line(width*2/3, 0, width*2/3, height);

	// ellipse(50, 50, 80, 80);

	// Existing bits
	noFill();
	strokeWeight(6);
	for (var i=0; i<board.length; i++) {
		drawBoardCell(i, board[i]);
	}

	// Mouse hover
	strokeWeight(1);
	drawMarkerHover();
}

function mousePressed() {
	placeMarker(mouseX, mouseY);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


// Custom functions
function drawBoardCell(i, marker) {
	var markerSize = Math.min(width, height);
	var posX = ((i%3) * width/3) + (width/6); // Cell, then center of cell
	var posY = (Math.floor(i/3) * height/3) + (height/6);

	if (marker == "x") {
		stroke("#0fa");

		// Diagonal lines
		line(posX - markerSize/16, posY - markerSize/16, posX + markerSize/16, posY + markerSize/16);
		line(posX + markerSize/16, posY - markerSize/16, posX - markerSize/16, posY + markerSize/16);
	}
	else if (marker == "o") {
		stroke("#0af");
		ellipse(posX, posY, markerSize/8, markerSize/8);
	}
}

function placeMarker(x, y) {
	// var i = ((x/width) % 3) + ((y/height) % 3);
	var i = getBoardPositionFromCoordinates(x, y);

	if (!isBoardPositionOccupied(i)) {
		board[i] = currMarker; // Place
		playMarkerPlacementSound(currMarker, i);
		startBGM();
		currMarker = currMarker == "x" ? "o" : "x"; // Switch marker
		currNumMoves++;
		if (currNumMoves > maxNumMoves) {
			stopBGM();
		}
	}
}

function drawMarkerHover() {
	if (isBoardPositionOccupied(getBoardPositionFromCoordinates(mouseX, mouseY))) {
		return;
	}

	var markerSize = Math.min(width, height);

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

function playMarkerPlacementSound(marker, i) {
	var notes = availableNotes;
	var note1 = chooseRandomFromArray(notes);
	note1 = "C4";
	notes = notes.filter(function(v, i, a) {return v != note1;});
	var note2 = chooseRandomFromArray(notes);
	notes = notes.filter(function(v, i, a) {return v != note2;});
	var note3 = chooseRandomFromArray(notes);

	console.log(note1 + ", " + note2 + ", " + note3);
	currBGMNotes = [note1.replace("4", "3"), note2.replace("4", "3"), note3.replace("4", "3")];

	if (currMarker == "x") {
		synthX.triggerAttackRelease([note1, note2, note3], "8n");
	}
	else if (currMarker == "o") {
		synthO.triggerAttackRelease([note1, note2, note3], "8n");
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
		// console.log("asdf");
		if (currMarker == "x") {
			synthBGM.triggerAttackRelease(currBGMNotes, "16n");
		}
		else if (currMarker == "o") {
			synthBGM.triggerAttackRelease(currBGMNotes, "16n");
		}
	}, "8n");

	hasBGMStarted = true;
}

function stopBGM() {
	synthBGM.triggerAttackRelease(["C3", "G3", "C4"], "8n");
	Tone.Transport.stop();
}

