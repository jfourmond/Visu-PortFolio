const width = window.innerWidth;
const height = window.innerHeight;

const midWidth = Math.floor(width / 2);
const midHeight = Math.floor(height / 2);

const color = d3.scaleOrdinal(d3.schemeCategory10);

function getIn(transition) {
	transition.duration(2500)
		.ease(d3.easeExp)
		.attr("cx", midWidth + 50)
		.attr("r", 20)
		.on("end", function () {
			d3.select(this).transition().call(firstRotateClockwise);
		});
}

function getOut(transition) {
	transition.duration(2500)
		.ease(d3.easeExp)
		.attr("cx", midWidth)
		.attr("r", 0)
		.on("end", function () {
			d3.select(this).transition().delay(5000).call(getIn);
		});
}

function firstRotateClockwise(transition) {
	transition.duration(5000)
		.ease(d3.easeBackIn)
		.attrTween("cx", function () {
			return function (t) {
				return (midWidth + 50 * Math.cos(2 * Math.PI * t));
			}
		})
		.attrTween("cy", function () {
			return function (t) {
				return (midHeight + 50 * Math.sin(2 * Math.PI * t));
			}
		}).on("end", function () {
			d3.select(this)
				.attr("lap", 1)
				.transition().call(rotateClockwise);
		});
}

function rotateClockwise(transition) {
	transition.duration(1500)
		.ease(d3.easeLinear)
		.attrTween("cx", function () {
			return function (t) {
				return (midWidth + 50 * Math.cos(2 * Math.PI * t));
			}
		})
		.attrTween("cy", function () {
			return function (t) {
				return (midHeight + 50 * Math.sin(2 * Math.PI * t));
			}
		}).on("end", function () {
			let lap = parseFloat(d3.select(this).attr("lap")) + 1;
			if (lap != 10)
				d3.select(this).attr("lap", lap)
					.transition().call(rotateClockwise);
			else
				d3.select(this).transition().call(getOut);
		});
}

const svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);

for (let i = 0; i < 3; i++) {
	svg.append("circle")
		.attr("cx", midWidth)
		.attr("cy", midHeight)
		.attr("r", 0)
		.attr("fill", color(i))
		.attr("lap", 0)
		.transition().delay(500 * i).call(getIn);
}