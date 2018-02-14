function rotate(transition) {
	transition
		.duration(function(d) { return d.revolution * 30000; })
 		.ease(d3.easeLinear)
 		.attrTween("cx", function (d) {
 			return function (t) {
 				return (midWidth + distanceScale(d.distance) * Math.cos(2 * Math.PI * t));
			}
		})
		.attrTween("cy", function (d) {
			return function (t) {
				return (midHeight + distanceScale(d.distance) * Math.sin(2 * Math.PI * t));
			}
		})
		.on("end", function() {
			d3.active(this).transition().call(rotate);
		});
}

const width = window.innerWidth;
const height = window.innerHeight;

const midWidth = Math.floor(width / 2);
const midHeight = Math.floor(height / 2);

const UA = 15000000;

const sun = { name: "Soleil", radius: 696000, revolution: 0 };

const planets = [
	{ name: "Mercure", radius: 2439, distance: 0.387 * UA, revolution: 0.2408, color: "silver" },
	{ name: "Vénus", radius: 6051, distance: 0.723 * UA, revolution: 0.6152, color: "palegoldenrod" },
	{ name: "Terre", radius: 6378, distance: UA, revolution: 1, color: "deepskyblue" },
	{ name: "Mars", radius: 3393, distance: 1.524 * UA, revolution: 1.8808, color: "sandybrown" },
	{ name: "Jupiter", radius: 71492, distance: 5.302 * UA, revolution: 11.862, color: "orange" },
	{ name: "Saturne", radius: 60268, distance: 9.516 * UA, revolution: 29.457, color: "khaki" },
	{ name: "Uranus", radius: 25559, distance: 19.165 * UA, revolution: 84.018, color: "powderblue" },
	{ name: "Nepture", radius: 24764, distance: 30.003 * UA, revolution: 164.78, color: "powderblue" }
]

const color = d3.scaleOrdinal(d3.schemeCategory10);

const radiusScale = d3.scaleLinear().domain([0, sun.radius]).range([1, width/100]);
const distanceScale = d3.scaleLinear().domain([0, UA]).range([1, width/25])

const svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);

// SOLEIL
const sunCircle = svg.append("circle")
	.datum(sun)
	.attr("cx", midWidth)
	.attr("cy", midHeight)
	.attr("r", function(d) { return radiusScale(d.radius); })
	.attr("fill", "gold");
sunCircle.append("title")
	.html(function(d) { return d.name; });

// PLANETES PATH
const paths = svg.selectAll(".paths")
	.data(planets)
	.enter()
	.append("circle")
	.attr("cx", midWidth)
	.attr("cy", midHeight)
	.attr("r", function (d) { return distanceScale(d.distance); })
	.attr("fill", "none")
	.attr("stroke", function(d) { return d.color })
	.attr("stroke-width", 0.5);
paths.append("title")
	.html(function(d) { return d.name; });

// PLANETES
const circles = svg.selectAll(".planets")
	.data(planets)
	.enter()
	.append("circle")
	.attr("cx", function (d) { return midWidth + distanceScale(d.distance); })
	.attr("cy", midHeight)
	.attr("r", function (d) { return radiusScale(d.radius); })
	.attr("fill", function(d) { return d.color; });
circles.append("title")
	.html(function(d) { return d.name; });
// circles.transition().call(rotate);
circles.each(function(p, j) {
	d3.select(this).transition().call(rotate);
})