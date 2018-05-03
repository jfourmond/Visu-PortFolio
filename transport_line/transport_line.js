// Random Number
let n = Math.floor(d3.randomUniform(60)());

// SVG
const svg = d3.select("body").append("svg")
    .attr("width", window.innerWidth)
    .attr("height", window.innerHeight);

const margin = { top: 20, right: 100, bottom: 30, left: 50 };
const width = svg.attr("width") - margin.left - margin.right;
const height = svg.attr("height") - margin.top - margin.bottom;

const midHeight = height / 2;

const g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")

const x = d3.scaleLinear()
    .domain([60, 0])
    .range([0, width]);

const color = d3.scaleSequential(d3.interpolateRgb("black", "green"))
    .domain([60, 0]);

// Ligne 
const line = g.append("line")
    .attr("x1", x(0))
    .attr("y1", midHeight)
    .attr("x2", x(60))
    .attr("y2", midHeight)
    .attr("stroke-width", 2)
    .attr("stroke", "black");

// Point - BUS
const bus = g.append("g")
    .attr("transform", function(d) { return "translate(" + x(n) + "," + midHeight + ")"; });
// Cercle
bus.append("circle")
    .attr("r", 30)
    .style("fill", color(n));
// Image
bus.append("image")
   .attr("xlink:href", "bus.png")
   .attr("x", -24)
   .attr("y", -24)
   .attr("height", 48)
   .attr("width", 48);

// Temps restant
const text = g.append("text")
    .attr("x", x(0) + 40)
    .attr("y", midHeight + 5)
    .attr("dx", 0)
    .attr("dy", 0)
    .attr("text-anchor", "start")
    .attr("font-size", "24px")
    .attr("font-family", "monospace")
    .text(`${n}`);

bus.transition().duration(n * 1000)
    .ease(d3.easeQuadInOut)
    .attr("transform", function(d) { return "translate(" + x(0) + "," + midHeight + ")"; })
    .select("circle")
        .style("fill", color(0));

text.transition().duration(n * 1000)
    .ease(d3.easeLinear)
    .tween("text", function () {
        const that = d3.select(this),
            i = d3.interpolateNumber(that.text(), 0);
        return function (t) { that.text(Math.round(i(t))); };
    });