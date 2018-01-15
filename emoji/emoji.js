const width = window.innerWidth;
const height = window.innerHeight;

const midWidth = width / 2;
const midHeight = height / 2;

const emojis = [];
let length;
let index = 0;

const svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height)

d3.queue()
	.defer(d3.csv, "../data/emojis.csv")
	.await(process);

function process(error, emojisCSV) {
	console.log(emojisCSV)

	for (let i = 0; i < emojisCSV.length; i++) {
		emojis.push({ name:emojisCSV[i]["Name"], emoji:emojisCSV[i]["Brow."] });
	}

	index = Math.floor(Math.random() * emojis.length);

	draw();
}

let emoji;
let name;

function draw() {
	name = svg.append("text")
		.text(emojis[index].name)
		.attr("y", height-10)
		.attr("x", width-20)
		.attr("font-size", 10)
		.attr("font-family", "monospace")
		.attr("text-anchor", "end")
		.attr("fill", "grey")
		.attr("alignment-baseline", "middle");

	emoji = svg.append("text")
		.text(emojis[index].emoji)
		.attr("y", midHeight)
		.attr("x", midWidth)
		.attr("font-size", 50)
		.attr("text-anchor", "middle")
		.attr("alignment-baseline", "middle")
		.on("mouseover", function () {
			d3.select(this)
				.transition().duration(100)
				.attr("font-size", 75);
		})
		.on("mouseleave", function () {
			index = Math.floor(Math.random() * emojis.length);
			d3.select(this)
				.text(emojis[index].emoji)
				.transition().duration(100)
				.attr("font-size", 50);
			name.text(emojis[index].name)
		});
}