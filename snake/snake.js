const width = window.innerWidth;
const height = window.innerHeight;

const midWidth = Math.floor(width / 2);
const midHeight = Math.floor(height / 2);

const MOVE_SIZE = 5;
const BORDER_LIMIT = 50;

const SNAKE_WIDTH = 5;
const FOOD_RADIUS = 5;

const DIRECTIONS = [ "LEFT", "UP", "RIGHT", "DOWN"]

let direction = 0;
let score = 0;
let fontSize = 0;

const svg = d3.select("body")
	.append("svg")
	.attr("width", width)
	.attr("height", height);

const snake = [
	{ x: midWidth, y: midHeight },
	{ x: midWidth + MOVE_SIZE, y: midHeight },
	{ x: midWidth + MOVE_SIZE * 2, y: midHeight},
	{ x: midWidth + MOVE_SIZE * 3, y: midHeight},
	{ x: midWidth + MOVE_SIZE * 4, y: midHeight}
];

const food = [{
	x: Math.floor(d3.randomUniform(BORDER_LIMIT, width - BORDER_LIMIT)()),
	y: Math.floor(d3.randomUniform(BORDER_LIMIT, height - BORDER_LIMIT)())
}];

const lineGen = d3.line()
	.x(function (d) { return d.x; })
	.y(function (d) { return d.y; })
	.curve(d3.curveCatmullRom.alpha(0.5));

const textScore = svg.append("text")
	.attr("x", width / 2)
	.attr("y", height / 2)
	.attr("font-family", "impact")
	.attr("font-size", fontSize + "px")
	.attr("text-anchor", "middle")
	.attr("fill", "white")
	.attr("opacity", 0)
	.text(score);

let snakeLine = svg
	.append("path")
	.data(snake)
	.attr("d", lineGen(snake))
	.attr("stroke", "white")
	.attr("stroke-width", SNAKE_WIDTH)
	.attr("fill", "none");

let foodCircle = svg.selectAll("circle")
	.data(food)
	.enter()
	.append('circle')
	.attr("cx", function (d) { return d.x; })
	.attr("cy", function (d) { return d.y; })
	.attr("r", FOOD_RADIUS)
	.attr("fill", function (d) {
		d.color = d3.interpolateViridis(d3.randomUniform()());
		return d.color;
	});

let simulation = d3.forceSimulation(food);

// KEY BINDING
document.body.addEventListener("keydown", function (event) {
	if (event.defaultPrevented) return;
	switch (event.key) {
		case 's':
		case "ArrowDown":
			if(direction != 1)
				direction = 3;
			break;
		case 'z':
		case "ArrowUp":
			if(direction != 3)	
				direction = 1;
			break;
		case 'q':
		case "ArrowLeft":
			if(direction != 2)
				direction = 0;
			break;
		case 'd':
		case "ArrowRight":
			if(direction != 0)
				direction = 2;
			break;
		default:
			return;
	}
	event.preventDefault();
}, true);

const timer = d3.timer(autoMove);
function autoMove() {
	// Mouvement
	movement();
	// Vérification de la direction
	switch(DIRECTIONS[direction]) {
		case DIRECTIONS[0]: // == "LEFT"
			moveLeft();
			break;
		case DIRECTIONS[1]: // == "UP"
			moveUp();
			break;
		case DIRECTIONS[2]: // == "RIGHT"
			moveRight();
			break;
		case DIRECTIONS[3]: // == "DOWN"
			moveDown();
			break;
	}
	// Y a-t-il de la nourriture à porter (10 px)
	let closeFood = simulation.find(snake[0].x, snake[0].y, 10);
	if (closeFood != null) {
		eat(closeFood);
		updateFood();
	}
	updateSnake();
	// Vérification de la viabilité du serpent
	checkViability();
}

function movement() {
	for (let i = snake.length - 1; i > 0; i--) {
		snake[i].x = snake[i - 1].x;
		snake[i].y = snake[i - 1].y;
	}
}

function checkViability() {
	if(!isInsideScreen() || crossed()) {
		timer.stop();
		console.error("Snake outside screen, refresh page");
		let highScore = 0;
		let url = document.location.search;
		if(url) {
			// Récupération du high score courant (eh oui, vous pouvez tricher...)
			let ind = url.lastIndexOf("=");
			highScore = parseInt(url.slice(ind+1));
			if(highScore < score) highScore = score;
		}
		document.location.search = "best_score=" + highScore; 
		// location.reload();
	}
}

function moveDown() {
	snake[0].y += MOVE_SIZE;
}

function moveUp() {
	snake[0].y -= MOVE_SIZE;
}

function moveLeft() {
	snake[0].x -= MOVE_SIZE;
}

function moveRight() {
	snake[0].x += MOVE_SIZE;
}

function eat() {
	// Suppression de la nourriture
	let removed = food.pop();
	// Augmentation du premier membre
	snake[0].food = true;
	// Augmentation de la taille du serpent
	snake.push({ x: snake[snake.length - 1].x, y: snake[snake.length - 1].y});
	// Génération du prochain point
	let next = {
		x: Math.floor(d3.randomUniform(BORDER_LIMIT, width - BORDER_LIMIT)()),
		y: Math.floor(d3.randomUniform(BORDER_LIMIT, height - BORDER_LIMIT)())
	};
	food.push(next);
	// Mise à jour du score
	score++;
	fontSize++;
	textScore
		.attr("font-size", fontSize + "px")
		.attr("opacity", score * 0.001)
		.text(score);
	// Transition couleur du serpent
	old_color = snakeLine.attr("stroke");
	snakeLine.transition().duration(1000).attrTween("stroke", function() {
		return d3.interpolateRgb(old_color, removed.color);
	});
}

function updateSnake() {
	snakeLine = snakeLine.attr("d", lineGen(snake));
}

function updateFood() {
	foodCircle = svg.selectAll("circle")
		.data(food)
	foodCircle.exit().remove();
	foodCircle.enter().append("circle");
	foodCircle.attr("cx", function (d) { return d.x; })
		.attr("cy", function (d) { return d.y; })
		.attr("r", FOOD_RADIUS)
		.attr("fill", function (d) {
			d.color = d3.interpolateViridis(d3.randomUniform()());
			return d.color;
		});

	simulation = d3.forceSimulation(food);
}

function isInsideScreen() {
	head = snake[0];
	if(head.x < 0 || head.x > width)
		return false;
	if(head.y < 0 || head.y > height)
		return false;
	return true;
}

function crossed() {
	for (let i = 1; i < snake.length; i++) {
		if((snake[0].x == snake[i].x && snake[0].y == snake[i].y))
			return true;
	}
	return false;
}

window.onfocus = function() {
	timer.restart(autoMove);
}

window.onblur = function() {
	timer.stop();
}

document.onblur = function() {
	timer.stop();
}