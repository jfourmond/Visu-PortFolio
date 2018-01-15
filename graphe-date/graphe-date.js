const svg = d3.select("body").append("svg")
	.attr("width", window.innerWidth)
	.attr("height", window.innerHeight);

const margin = { top: 20, right: 50, bottom: 30, left: 50 };
const width = svg.attr("width") - margin.left - margin.right;
const height = svg.attr("height") - margin.top - margin.bottom;

const g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")

const x = d3.scaleTime().rangeRound([0, width]);
const y = d3.scaleLinear().rangeRound([height, 0]);

const parseDate = d3.timeParse("%Y-%m-%d");
const displayDate = d3.timeFormat("%d-%m-%Y");
const displayValue = d3.format(",.0f");

const random = d3.randomUniform(1, 25);
const nb_values = 25;

const data = [];

const line = d3.line()
	.x(function (d) { return x(d.year); })
	.y(function (d) { return y(d.value); });

let yAxis;
let xAxis;

d3.queue()
	.defer(buildData)
	.await(process);

function buildData(callback) {
	const values = [];
	const now = new Date;
	for (let i = 0; i < nb_values; i++)
		values.push(Math.round(random()));
	years = d3.timeDay.range(d3.timeDay.offset(now, -nb_values), now);
	callback(null, { values: values, years: years });
}

function process(error, x) {
	if (error) throw error;

	for (let i = 0; i < nb_values; i++)
		data.push({ value: x.values[i], year: x.years[i] });

	draw();
}

function draw() {
	x.domain(d3.extent(data, function (d) { return d.year; }));
	y.domain([0, d3.max(data, function (d) { return d.value; })]);

	xAxis = g.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x).tickFormat(d3.timeFormat("%B %d")))
		.select(".domain")
		.remove();

	yAxis = g.append("g")
		.attr("class", "YAxis")
		.call(d3.axisLeft(y).tickSize(-width))
		.append("text")
		.attr("x", 10)
		.attr("y", y(y.ticks().pop()) + 0.5)
		.attr("dy", "0.32em")
		.attr("fill", "#000")
		.attr("font-weight", "bold")
		.attr("text-anchor", "start")
		.text("Nombre");

	g.append("path")
		.datum(data)
		.attr("fill", "none")
		.attr("stroke", "steelblue")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("stroke-width", 1.5)
		.attr("d", line);
}