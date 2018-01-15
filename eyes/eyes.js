const width = window.innerWidth;
const height = window.innerHeight;

const midWidth = Math.floor(width / 2);
const midHeight = Math.floor(height / 2);

const svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);

svg.append("circle")
	.attr("cx", midWidth)
	.attr("cy", midHeight)
	.attr("r", 30)
	.style("fill", "none")
	.style("stroke-width", "2px")
	.style("stroke", "black");

svg.append("circle")
	.attr("cx", midWidth + 12)
	.attr("cy", midHeight - 10)
	.attr("r", 10)
	.style("fill", "none")
	.style("stroke-width", "2px")
	.style("stroke", "black");

svg.append("circle")
	.attr("cx", midWidth - 12)
	.attr("cy", midHeight - 10)
	.attr("r", 10)
	.style("fill", "none")
	.style("stroke-width", "2px")
	.style("stroke", "black");

const eye1 = svg.append("circle")
	.attr("cx", midWidth + 12)
	.attr("cy", midHeight - 10)
	.attr("r", 4);

const eye2 = svg.append("circle")
	.attr("cx", midWidth - 12)
	.attr("cy", midHeight - 10)
	.attr("r", 4);

svg.on("mousemove", function () {
	const mouse = d3.mouse(this);

	// Déplacement du premier oeil
	moveEyeOne(mouse[0], mouse[1]);

	// Déplacement du second oeil
	moveEyeTwo(mouse[0], mouse[1]);
});

svg.on("mouseleave", function () {
	// Reset de la position des yeux
	eye1.transition().duration(500)
		.attr("cx", midWidth + 12)
		.attr("cy", midHeight - 10);

	eye2.transition().duration(500)
		.attr("cx", midWidth - 12)
		.attr("cy", midHeight - 10);
});

function moveEyeOne(x, y) {
	let a = y - eye1.attr("cy");
	let b = x - eye1.attr("cx");
	let c = Math.hypot(a, b);

	let cos = b / c;
	let sin = a / c;

	eye1.transition().duration(50)
		.attr("cx", midWidth + 12 + (cos * 5))
		.attr("cy", midHeight - 10 + (sin * 5));
}

function moveEyeTwo(x, y) {
	let a = y - eye2.attr("cy");
	let b = x - eye2.attr("cx");
	let c = Math.hypot(a, b);

	let cos = b / c;
	let sin = a / c;

	eye2.transition().duration(50)
		.attr("cx", midWidth - 12 + (cos * 5))
		.attr("cy", midHeight - 10 + (sin * 5));
}