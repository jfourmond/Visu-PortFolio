const width = window.innerWidth;
const height = window.innerHeight;

const midWidth = Math.floor(width / 2);
const midHeight = Math.floor(height / 2);

const color = d3.scaleOrdinal(d3.schemeCategory10);

let colorVar = 0;

function grow(transition) {
	transition
		.duration(5000).ease(d3.easeCubic)
		.attr("r", 50)
		.attrTween("fill", function () {
			return d3.interpolateRgb(d3.select(this).attr("fill"), color(colorVar++));
		})
		.on("end", function () {
			d3.select(this).transition().call(shrink);
		});
}

function shrink(transition) {
	transition
		.duration(3500).ease(d3.easeCubic)
		.attr("r", 20)
		.attrTween("fill", function () {
			return d3.interpolateRgb(d3.select(this).attr("fill"), color(colorVar++));
		})
		.on("end", function () {
			d3.select(this).transition().call(grow);
		});
}

const svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);

const circle = svg.append("circle")
	.attr("cx", midWidth)
	.attr("cy", midHeight)
	.attr("r", 20)
	.attr("fill", color(colorVar++));

circle.transition().call(grow);