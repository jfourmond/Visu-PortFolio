const width = window.innerWidth;
const height = window.innerHeight;

const midWidth = Math.floor(width / 2);
const midHeight = Math.floor(height / 2);

const svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

const simulation = d3.forceSimulation()
    .alphaDecay(0.2)
    .alpha(1)
    // .force("center", d3.forceCenter(midWidth, midHeight))
    .force("x", d3.forceX(midWidth).strength(0.001))
    .force("y", d3.forceY(midHeight).strength(0.001))
    .force("collide", d3.forceCollide(15).strength(0.2).iterations(2));

const colors = d3.scaleOrdinal(d3.schemeCategory10);

const cells = [
    { x: midWidth, y: midHeight, color: colors(0) },
    { x: midWidth, y: midHeight, color: colors(1) },
    { x: midWidth, y: midHeight, color: colors(2) },
    { x: midWidth, y: midHeight, color: colors(3) }
];

const voronoi = d3.voronoi()
    .x(function (d) { return d.x; })
    .y(function (d) { return d.y; })
    .extent([[-1, -1], [width + 1, height + 1]]);

var polygon = svg.append("g")
    .attr("class", "polygons")
    .selectAll("path")
    .data(voronoi.polygons(cells))
    .enter().append("path")
    .call(redrawPolygon);

var site = svg.append("g")
    .attr("class", "cells")
    .selectAll("circle")
    .data(cells)
    .enter().append("circle")
    .attr("r", 10)
    .call(redrawSite);

simulation
    .nodes(cells)
    .on("tick", ticked);

function ticked() {
    redraw();
}

function redraw() {
    site = site.data(cells).enter()
        .append("circle")
        .attr("r", 10)
        .merge(site)
        .call(redrawSite);

    polygon = polygon.data(voronoi(cells).polygons()).enter()
        .append("path")
        .merge(polygon)
        .call(redrawPolygon);
}

function redrawPolygon(polygon) {
    polygon
        .attr("d", function (d) { return d ? "M" + d.join("L") + "Z" : null; })
        .attr("fill", function (d) {
            if (d != undefined)
                return d.data.color;
        })
        .attr("fill-opacity", 0.10);
}

function redrawSite(site) {
    site
        .attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; })
        .attr("fill", function (d) { return d.color; });
}

function addCell(cell) {
    // Sélection aléatoire de la cellule
    if (cell == null) {
        let n = Math.floor(Math.random() * Math.floor(cells.length));
        cell = cells[n];
    }
    cells.push({ x: cell.x, y: cell.y, color: cell.color });
    restart();
}

function restart() {
    redraw();

    simulation.nodes(cells);
    simulation.alpha(1).alphaDecay(0.2).restart();
}

const timer = d3.interval(function(elapsed) {
    addCell();
}, 1000);

svg.on("click", function () {
    addCell();
});