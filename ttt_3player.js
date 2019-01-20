var cnv;

var board = [
	" ", " ", " ", " ",
	" ", " ", " ", " ",
	" ", " ", " ", " ",
	" ", " ", " ", " "
];
// board = [
// 	"x", " ", " ",
// 	" ", "o", " ",
// 	" ", " ", "x"
// ];

var currMarker = "x";

// Processing functions
function setup() {
	cnv = createCanvas(windowWidth, windowHeight);
	background("#000");
}

function draw() {
	// Background
	background("#000");

	// Grid
	strokeWeight(2);
	stroke("#faf");
	line(0, height/4, width, height/4);
	line(0, height*2/4, width, height*2/4);
	line(0, height*3/4, width, height*3/4);
	line(width/4, 0, width/4, height);
	line(width*2/4, 0, width*2/4, height);
	line(width*3/4, 0, width*3/4, height);

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
	var posX = ((i%4) * width/4) + (width/8); // Cell, then center of cell
	var posY = (Math.floor(i/4) * height/4) + (height/8);

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
	else if (marker == "h") {
		stroke("#fa0");

		// H
		// line(posX - markerSize/16, posY - markerSize/16, posX - markerSize/16, posY + markerSize/16); // |
		// line(posX - markerSize/16, posY, posX + markerSize/16, posY); // -
		// line(posX + markerSize/16, posY - markerSize/16, posX + markerSize/16, posY + markerSize/16); // |

		// Triangle
		line(posX, posY - markerSize/16, posX - markerSize/16, posY + markerSize/16); // /
		line(posX, posY - markerSize/16, posX + markerSize/16, posY + markerSize/16); // \
		line(posX - markerSize/16, posY + markerSize/16, posX + markerSize/16, posY + markerSize/16); // _
	}
}

function placeMarker(x, y) {
	// var i = ((x/width) % 3) + ((y/height) % 3);
	var i = getBoardPositionFromCoordinates(x, y);

	if (!isBoardPositionOccupied(i)) {
		board[i] = currMarker; // Place

		// Switch marker
		if (currMarker == "x") {currMarker = "o";}
		else if (currMarker == "o") {currMarker = "h";}
		else if (currMarker == "h") {currMarker = "x";}
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
	else if (currMarker == "h") {
		stroke("#fa0");
		
		// Triangle
		line(mouseX, mouseY - markerSize/16, mouseX - markerSize/16, mouseY + markerSize/16); // /
		line(mouseX, mouseY - markerSize/16, mouseX + markerSize/16, mouseY + markerSize/16); // \
		line(mouseX - markerSize/16, mouseY + markerSize/16, mouseX + markerSize/16, mouseY + markerSize/16); // _
	}
}

function getBoardPositionFromCoordinates(x, y) {
	var i = (Math.floor((x/width) * 4)) + (Math.floor((y/height) * 4) * 4);
	return i;
}

function isBoardPositionOccupied(i) {
	return board[i] != " ";
}
