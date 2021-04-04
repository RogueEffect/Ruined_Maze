
var WIDTH = 25;
var HEIGHT = 25;

var combinedContainer = document.getElementById('combinedContainer');
var depthContainer = document.getElementById('depthContainer');
var caveContainer = document.getElementById('caveContainer');

for(y = 0; y < HEIGHT; y++) {
	for(x = 0; x < WIDTH; x++) {
		combinedContainer.innerHTML += "<div class=\"cell\"></div>";
		depthContainer.innerHTML += "<div class=\"cell\"></div>";
		caveContainer.innerHTML += "<div class=\"cell\"></div>";
	}
}

function nextInt(max) {
	return Math.floor(Math.random() * max);
}

var WALL = "wall", FLOOR = "floor", NODE = "node";
var depthmap = [];
var cavemap = [];
var combinedmap = [];

function fill(map, tile) {
    for(i = 0; i < WIDTH * HEIGHT; i++) map[i] = tile;
}

function fillRandom(map) {
	for(i = 0; i < WIDTH * HEIGHT; i++) {
		if(nextInt(20) > 11) map[i] = WALL;
		else map[i] = FLOOR;
	}
}

function setTile(map, x, y, tile) {
    if(x < 0 || x >= WIDTH) return;
    if(y < 0 || y >= HEIGHT) return;
    map[x + y * WIDTH] = tile;
}

function getTile(map, x, y) {
    if(x < 0 || x >= WIDTH) return null;
    if(y < 0 || y >= HEIGHT) return null;
    return map[x + y * WIDTH];
}

function setNodes() {
    var nodes = 0;
    for(y = 0; y < HEIGHT; y++) {
        for(x = 0; x < WIDTH; x++) {
            if(x % 2 == 1 && y % 2 == 1) {
                setTile(depthmap, x, y, NODE);
                nodes++;
            }
        }
    }
    return nodes;
}

function hasNeighbor(x, y) {
    return (getTile(depthmap, x, y - 2) == NODE || getTile(depthmap, x, y + 2) == NODE ||
		getTile(depthmap, x - 2, y) == NODE || getTile(depthmap, x + 2, y) == NODE);
}

function getRandomNeighbor(x, y) {
    while(hasNeighbor(x, y)) {
        if(nextInt(4) == 0 && getTile(depthmap, x, y - 2) == NODE) return [0, -1];
        if(nextInt(4) == 0 && getTile(depthmap, x, y + 2) == NODE) return [0, 1];
        if(nextInt(4) == 0 && getTile(depthmap, x - 2, y) == NODE) return [-1, 0];
        if(nextInt(4) == 0 && getTile(depthmap, x + 2, y) == NODE) return [1, 0];
    }
    return null;
}

function applyMap(container, map) {
    var cells = container.getElementsByClassName('cell');
    for(y = 0; y < HEIGHT; y++) {
        for(x = 0; x < WIDTH; x++) {
            cells[x + y * WIDTH].className = "cell " + getTile(map, x, y);
        }
    }
}

function generateDepthMaze() {
    fill(depthmap, WALL);
    var nodes = setNodes();
	var x = 3, y = 3;
    var lastCell = [[x, y]];
    while(nodes > 0) {
        var next = getRandomNeighbor(x, y);
        if(next != null) {
            for(i = 0; i <= 2; i++) setTile(depthmap, x + next[0] * i, y + next[1] * i, FLOOR);
            nodes--;
            lastCell.push([x, y]);
            x += next[0] * 2;
            y += next[1] * 2;
        }
        else {
            if(lastCell.length < 1) break;
            var p = lastCell.pop();
            x = p[0];
            y = p[1];
        }
    }
    applyMap(depthContainer, depthmap);
}

function getNeighbors(x, y) {
	var neighbors = 0;
	for(y2 = -1; y2 < 2; y2++) {
		for(x2 = -1; x2 < 2; x2++) {
			if(getTile(cavemap, x + x2, y + y2) == WALL) neighbors++;
			if(getTile(cavemap, x + x2, y + y2) == null) neighbors++;
		}
	}
	return neighbors;
}

function doCaveGenStep() {
	var workmap = cavemap;
	
	for(y = 0; y < HEIGHT; y++) {
		for(x = 0; x < WIDTH; x++) {
			var neighbors = getNeighbors(x, y);
			if(getTile(workmap, x, y) == WALL) {
				if(neighbors < 3) setTile(workmap, x, y, FLOOR);
			}
			else {
				if(neighbors > 4) setTile(workmap, x, y, WALL);
			}
		}
	}
	
	cavemap = workmap;
}

function generateCaveMaze() {
	fillRandom(cavemap);
	
	for(i = 0; i < 10; i++) doCaveGenStep();
	
	applyMap(caveContainer, cavemap);
}

function generate() {
    generateDepthMaze();
	generateCaveMaze();
	
    for(y = 0; y < HEIGHT; y++) {
        for(x = 0; x < WIDTH; x++) {
            setTile(combinedmap, x, y, getTile(depthmap, x, y));
			if(x != 0 && y != 0 && x != WIDTH - 1 && y != HEIGHT - 1)
				if(getTile(cavemap, x, y) == FLOOR) setTile(combinedmap, x, y, FLOOR);
        }
    }
	applyMap(combinedContainer, combinedmap);
}

generate();
