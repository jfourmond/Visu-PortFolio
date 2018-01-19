const width = window.innerWidth;
const height = window.innerHeight;

const initialRadius = 20;
let circleRadius = initialRadius;
const maxRadius = 30;
const collisionRadius = 20;

const growRate = 0.01;

let started = true;

const snake = [{}];

const svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);

const headPos = { x: width / 2, y: height / 2 };

document.body.onkeyup = function (e) {
	if (e.keyCode == 32)
		startStopTimer();
}

const simulation = d3.forceSimulation()
	.alphaDecay(0)
	.force("charge", d3.forceCollide(collisionRadius).strength(2))
	.force("x", d3.forceX().x(function (d) {
		var index = d.index;
		if (index == 0) return headPos.x;
		else return snake[index - 1].x;
	}))
	.force("y", d3.forceY().y(function (d) {
		var index = d.index;
		if (index == 0) return headPos.y;
		else return snake[index - 1].y;
	}));

let body = svg.selectAll("circle")
	.data(snake)
	.enter()
	.append("circle")
	.attr("r", initialRadius)
	.attr("fill", "red")
	.attr("style", "stroke: #000");

const head = body;

simulation
	.nodes(snake)
	.on("tick", ticked);

function addCircle() {
	var previous = snake[snake.length - 1];
	snake.push({ x: previous.x, y: previous.y });
	restart();
}

function restart() {
	body = body.data(snake);
	body.exit().remove();
	body = body.enter()
		.append("circle")
		.attr("r", 0)
		.attr("fill", "red")
		.attr("style", "stroke: #000")
		.merge(body);
	simulation.nodes(snake);
	simulation.alpha(1).restart();
}

function ticked() {
	simulation.force("x", d3.forceX().x(function (d) {
		let index = d.index;
		if (index == 0) return headPos.x;
		else return snake[index - 1].x;
	}))
		.force("y", d3.forceY().y(function (d) {
			let index = d.index;
			if (index == 0) return headPos.y;
			else return snake[index - 1].y;
		}));

	body
		.attr("cx", function (d) { return d.x; })
		.attr("cy", function (d) { return d.y; });
}

const timer = d3.timer(nextPos);
function startStopTimer() {
	if (started) {
		timer.stop();
		simulation.alphaDecay(0.5);
	} else {
		timer.restart(nextPos);
		simulation.alphaDecay(0)
			.alpha(1).restart();
	}
	started = !started;
}

function nextPos(elapsed) {
	let nextX = 0, nextY = 0;
	do
		nextX = d3.randomUniform(-40, 40)();
	while ((headPos.x + nextX) < 0 || (headPos.x + nextX) > width);
	do
		nextY = d3.randomUniform(-40, 40)();
	while ((headPos.y + nextY) < 0 || (headPos.y + nextY) > height);

	headPos.x += nextX;
	headPos.y += nextY;

	if (circleRadius > maxRadius) {
		body.transition()
			.duration(1000).delay(function (d) { return d.index * 100; })
			.on("start", function (d) { if (d.index == 0) addCircle(); })	// Pour n'en ajouter qu'un seul.
			.attr("r", initialRadius)
		circleRadius = initialRadius;
	} else {
		circleRadius += growRate;
		body
			.transition().duration(50)
			.attr("r", circleRadius);
	}
}