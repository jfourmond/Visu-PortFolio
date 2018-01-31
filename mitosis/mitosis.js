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
    // .force("center", d3.forceCenter(midWidth, midHeight))
    .force("x", d3.forceX(midWidth).strength(0.001))
    .force("y", d3.forceY(midHeight).strength(0.001))
    .force("collide", d3.forceCollide(15).strength(0.2).iterations(2));

const colors = d3.scaleOrdinal(d3.schemeCategory10);

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
	    .attr("r", 10)
        .attr("fill", function(d) { return d.color; })
        .on("click", function(d) { addCell(d); });
        
simulation
    .nodes(cells)
    .on("tick", ticked);

function ticked() {
    nodes
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
}

const timer = d3.interval(function(elapsed) {
    addCell();
}, 1000);

// svg.on("click", addCell);

function addCell(cell) {
    // Sélection aléatoire de la cellule
    if(cell == null) {
        let n = Math.floor(Math.random() * Math.floor(cells.length));
        cell = cells[n];
    }
    cells.push({x:cell.x , y:cell.y, color:cell.color });
    restart();
}

function restart() {
	nodes = nodes.data(cells);
	nodes.exit().remove();
	nodes = nodes.enter()
		.append("circle")
		.attr("r", 10)
        .attr("fill", function(d) { return d.color; })
        .on("click", function(d) { addCell(d); })
		.merge(nodes);
	simulation.nodes(cells);
	simulation.restart();
}