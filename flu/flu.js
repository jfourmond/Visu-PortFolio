const width = window.innerWidth;
const height = window.innerHeight;

const midWidth = Math.floor(width / 2);
const midHeight = Math.floor(height / 2);

const margin = { top: 75, right: 125, bottom: 100, left: 150 };

const svg = d3.select("body")
	.append("svg")
	.attr("width", width)
	.attr("height", height);

var tooltip = d3.select('body').append('div')
	.attr('class', 'hidden tooltip');

var g = svg.append("g");

var projection = d3.geoConicConformal()
	.center([2.454071, 46.279229]) // Centrer sur la France
	.scale(5000)
	.translate([midWidth, midHeight]);

// Définition d'une echelle de couleur
var color = d3.scaleSequential(d3.interpolateBlues);

var path = d3.geoPath()
	.projection(projection);

let data = null;
let dates = [];
let min_max = [0, 0];

let legend = null;
let legend_stop = [null, null, null, null, null];
const legendScale = d3.scaleLinear();
let legendRect = null;
let legendAxis = null;
let legendbar = null;

let map_regions = null;

let idx = 0;

Promise.all([
	d3.csv("../data/GrippeFrance2014.csv"),
	d3.json("../data/region.json")
]).then((values) => {
	// Injection des valeurs dans le geo json
	const regions = values[0];
	const geo_json = values[1];
	// Récupération des dates
	const columns = regions.columns;
	dates = columns.slice(1, columns.length - 1)

	regions.forEach(region => {
		const dataRegion = region.region;
		const dataValues = {}

		dates.forEach(date => { dataValues[date] = parseInt(region[date]); })

		let x = geo_json.features.find(e => {
			return e.properties.nom.localeCompare(dataRegion) === 0;
		});
		if (x)
			x.properties.values = dataValues;
	});

	data = geo_json.features;

	draw();
})

function draw() {
	d3.select('#slider').attr("max", dates.length);
	d3.select('#week').html("Semaine du " + dates[idx]);

	min_max = d3.extent(data, (x) => {
		try {
			const value = x.properties.values[dates[idx]]
			return value;
		} catch (TypeError) { }
	});
	color.domain(min_max);

	map_regions = g.selectAll("path")
		.data(data)
		.enter()
		.append("path")
		.attr("d", path)
		.style("fill", function (d) {
			try {
				const value = d.properties.values[dates[idx]];
				return color(value)
			} catch (TypeError) {
				return "#ccc"
			}
		})
		.on('mousemove', function (d) {
			let value = 'NC'
			try {
				value = d.properties.values[dates[idx]];
			} catch (TypeError) { }
			const mouse = d3.mouse(svg.node()).map(function (d) { return parseInt(d); });
			tooltip.classed('hidden', false)
				.attr('style', 'left:' + (mouse[0] + 15) + 'px; top:' + (mouse[1] - 35) + 'px')
				.html(d.properties.nom + " : " + value);
		})
		.on('mouseout', function () {
			tooltip.classed('hidden', true);
		})
		.on('mouseover', function (d) {
			try {
				const value = d.properties.values[dates[idx]];
				legendBar
					.transition()
					.duration(200)
					.ease(d3.easeLinear)
					.attr("y1", legendScale(d.properties.values[dates[idx]]))
					.attr("y2", legendScale(d.properties.values[dates[idx]]))
					.attr("stroke", () => { return d.properties.value >= min_max[1] / 2 ? "white" : "black"; });
			} catch (TypeError) { };
		});

	legend = svg.append("defs")
		.append("svg:linearGradient")
		.attr("id", "gradient")
		.attr("x1", "100%")
		.attr("y1", "0%")
		.attr("x2", "100%")
		.attr("y2", "100%")
		.attr("spreadMethod", "pad")

	legend_stop[0] = legend.append("stop")
		.attr("offset", "0%")
		.attr("stop-color", color((min_max[1])))
		.attr("stop-opacity", 1);

	legend_stop[1] = legend.append("stop")
		.attr("offset", "20%")
		.attr("stop-color", color((min_max[1] / 5) * 4))
		.attr("stop-opacity", 1);

	legend_stop[2] = legend.append("stop")
		.attr("offset", "40%")
		.attr("stop-color", color((min_max[1] / 5) * 3))
		.attr("stop-opacity", 1);

	legend_stop[3] = legend.append("stop")
		.attr("offset", "60%")
		.attr("stop-color", color((min_max[1] / 5) * 2))
		.attr("stop-opacity", 1);

	legend_stop[4] = legend.append("stop")
		.attr("offset", "80%")
		.attr("stop-color", color((min_max[1] / 5)))
		.attr("stop-opacity", 1);

	legend_stop[5] = legend.append("stop")
		.attr("offset", "100%")
		.attr("stop-color", color(min_max[0]))
		.attr("stop-opacity", 1);

	legendRect = svg.append("rect")
		.attr("width", 30)
		.attr("height", midHeight)
		.style("fill", "url(#gradient)")
		.attr("transform", "translate(" + (width - margin.left) + ", " + (midHeight - midHeight / 2) + ")");

	legendScale.range([midHeight, 0]).domain(min_max);

	legendAxis = svg.append("g")
		.attr("transform", "translate(" + (width - margin.left + 30) + ", " + (midHeight - midHeight / 2) + ")")
		.call(d3.axisRight(legendScale));

	legendBar = svg
		.append('line')
		.attr("x1", 0)
		.attr("y1", legendScale(min_max[0]))
		.attr("x2", 30)
		.attr("y2", legendScale(min_max[0]))
		.attr("transform", "translate(" + (width - margin.left) + ", " + (midHeight - midHeight / 2 + 1) + ")")
		.attr("stroke", "black")
		.attr("stroke-width", 0.5);
}

d3.select("#slider").on("input", function () {
	idx = +this.value - 1;
	// updateViz(+this.value);
	update();
});

function update() {
	d3.select('#slider').attr("max", dates.length);
	d3.select('#week').html("Semaine du " + dates[idx]);

	min_max = d3.extent(data, (x) => {
		try {
			const value = x.properties.values[dates[idx]]
			return value;
		} catch (TypeError) { }
	});
	color.domain(min_max);

	// Mise à jour des régions
	map_regions
		.transition()
		.duration(200)
		.ease(d3.easeLinear)
		.style("fill", function (d) {
			try {
				const value = d.properties.values[dates[idx]];
				return color(value)
			} catch (TypeError) {
				return "#ccc"
			}
		});

	legend_stop[0]
		.attr("stop-color", color((min_max[1])))
		.attr("stop-opacity", 1);

	legend_stop[1]
		.attr("stop-color", color((min_max[1] / 5) * 4))
		.attr("stop-opacity", 1);

	legend_stop[2]
		.attr("stop-color", color((min_max[1] / 5) * 3))
		.attr("stop-opacity", 1);

	legend_stop[3]
		.attr("stop-color", color((min_max[1] / 5) * 2))
		.attr("stop-opacity", 1);

	legend_stop[4]
		.attr("stop-color", color((min_max[1] / 5)))
		.attr("stop-opacity", 1);

	legend_stop[5]
		.attr("stop-color", color(min_max[0]))
		.attr("stop-opacity", 1);

	legendScale.range([midHeight, 0]).domain(min_max);

	legendAxis
		.transition()
		.duration(200)
		.ease(d3.easeLinear)
		.call(d3.axisRight(legendScale));
}