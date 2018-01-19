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
let fontSize = 20;

const svg = d3.select("body")
	.append("svg")
	.attr("width", width)
	.attr("height", height);

const snake = [
	{ x: midWidth, y: midHeight },
	{ x: midWidth, y: midHeight - MOVE_SIZE },
	{ x: midWidth, y: midHeight - (MOVE_SIZE * 2) }
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
	.attr("fill", "lightgrey")
	.attr("opacity", 0)
	.text(score);

let snakeLine = svg
	.append("path")
	.attr("d", lineGen(snake))
	.attr("stroke", "black")
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
		case "ArrowDown":
			direction = 3;
			break;
		case "ArrowUp":
			direction = 1;
			break;
		case "ArrowLeft":
			direction = 0;
			break;
		case "ArrowRight":
			direction = 2;
			break;
		default:
			return;
	}
	event.preventDefault();
}, true);

const timer = d3.timer(autoMove);
function autoMove() {
	movement();
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
	var closeFood = simulation.find(snake[0].x, snake[0].y, 10);
	if (closeFood != null) {
		eat(closeFood);
		updateFood();
	}
	updateSnake();
}

function movement() {
	for (var i = snake.length - 1; i > 0; i--) {
		snake[i].x = snake[i - 1].x;
		snake[i].y = snake[i - 1].y;
	}
	if(!isInsideScreen()) {
		timer.stop();
		console.error("Snake outside screen, refresh page");
		location.reload();
	}
}

function moveDown() {
	movement();
	snake[0].y += MOVE_SIZE;
}

function moveUp() {
	movement();
	snake[0].y -= MOVE_SIZE;
}

function moveLeft() {
	movement();
	snake[0].x -= MOVE_SIZE;
}

function moveRight() {
	movement();
	snake[0].x += MOVE_SIZE;
}

function eat() {
	// Suppression de la nourriture
	var removed = food.pop();
	// Augmentation de la taille du serpent
	snake.push({ x: snake[snake.length - 1].x, y: snake[snake.length - 1].y, color: removed.color });
	// Génération du prochain point
	var next = {
		x: Math.floor(d3.randomUniform(BORDER_LIMIT, width - BORDER_LIMIT)()),
		y: Math.floor(d3.randomUniform(BORDER_LIMIT, height - BORDER_LIMIT)())
	};
	food.push(next);
	// Mise à jour du score
	score++;
	fontSize++;
	textScore
		.attr("font-size", fontSize + "px")
		.attr("opacity", score * 0.01)
		.text(score);
}

function updateSnake() {
	snakeLine = snakeLine.attr("d", lineGen(snake));
	snakeLine.exit().remove();
	snakeLine = snakeLine.enter()
		.append("path")
		.attr("stroke-width", SNAKE_WIDTH)
		.merge(snakeLine);
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