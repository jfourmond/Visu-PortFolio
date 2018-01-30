const width = window.innerWidth;
const height = window.innerHeight;

const midWidth = Math.floor(width / 2);
const midHeight = Math.floor(height / 2);

const svg = d3.select("body").append("svg")
	.attr("width", width)
    .attr("height", height);
    
const simulation = d3.forceSimulation()
    .alphaDecay(0)
    .alpha(1)
    .force("center", d3.forceCenter(midWidth, midHeight))
    .force("collide", d3.forceCollide(7.5).strength(0.05));
    // .force("charge", d3.forceManyBody());

const colors = d3.scaleOrdinal(d3.schemeCategory20)

const cells = [
    {x: midWidth, y:midHeight, color:colors(0)},
    {x: midWidth, y:midHeight, color:colors(1)},
    {x: midWidth, y:midHeight, color:colors(2)},
    {x: midWidth, y:midHeight, color:colors(3)}];

let nodes = svg.append("g")
	.attr("class", "nodes")
	.selectAll("circle")
	.data(cells)
	.enter().append("circle")
	    .attr("r", 5)
        .attr("fill", function(d) { return d.color; });
        
simulation
    .nodes(cells)
    .on("tick", ticked);

function ticked() {
    nodes
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
}

const timer = d3.interval(function(elapsed) {
    // Sélection aléatoire de la cellule
    let n = Math.floor(Math.random() * Math.floor(cells.length));
    let cell = cells[n];
    cells.push({x:cell.x , y:cell.y, color:cell.color });
    restart();
}, 1000);

function restart() {
	nodes = nodes.data(cells);
	nodes.exit().remove();
	nodes = nodes.enter()
		.append("circle")
		.attr("r", 5)
		.attr("fill", function(d) { return d.color; })
		.merge(nodes);
	simulation.nodes(cells);
	simulation.restart();
}