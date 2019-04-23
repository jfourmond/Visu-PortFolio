const butProp = document.getElementById("butProp");

const height = 500;
const width = 960;

const svg = d3.select("body").append("svg")
    .attr("width", 960)
    .attr("height", 500);

const color = d3.scaleOrdinal(d3.schemeCategory10);

let simulation = null;

let node = null;
let link = null;

let nLayer = 0;

let transitions = 0;

Promise.all([
    d3.json("../data/propagation/nodes.json"),
    d3.json("../data/propagation/links.json")
]).then((values) => {
    for (let i = 0; i < values[1].length; i++)
        values[1][i].weight = Math.random();

    nLayer = d3.max(values[0], function (x) { return x.layer })

    build(values[0], values[1]);
}).catch((e) => {
    console.error(e);
});

function activationFunction(value) {
    // RELU
    return Math.max(0, value);
}

function build(nodes, links) {
    simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).strength(0));

    link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", d => 0.5).attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 15)
        .attr("fill", (d, i) => color(d.layer))
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("value", function (d) {
            if (d.layer == 1) return 1;
            return 0;
        });
}

d3.selectAll('input').on('input', function (d, i) {
    let value = parseFloat(d3.select(this).property("value"));
    if (isNaN(value))
        value = 0;

    node.filter((n) => n.layer == 1 && n.unit == (i + 1))
        .attr("value", value)
        .transition().duration(500).attr("fill", function (d) {
            let ncolor = d3.color(color(d.layer));
            ncolor.opacity = value;
            return ncolor + ""
        }).attr("stroke", function () {
            if (value < 0.5) return '#000';
            else return '#fff';
        });
});

function animate(selection) {
    selection.each(function (d, i) {
        let value = parseFloat(d3.select(this).attr("value"));

        link.filter((li) => li.source == d).each((d1, i) => {
            const src = d;
            const weight = d1.weight;
            const dst = d1.target;

            svg.append("line")
                .attr("x1", src.x)
                .attr("y1", src.y)
                .attr("x2", src.x)
                .attr("y2", src.y)
                .attr("stroke", "#fe2d2d")
                .attr("stroke-width", 1.75)
                .style("opacity", weight * value)
                .lower()	// Placement en arrière plan
                .transition().duration(1000).ease(d3.easeLinear)
                .attrTween("x1", function () {
                    const x = d3.interpolateNumber(src.x, dst.x);
                    return function (t) {
                        let nxt = x(t - 0.05);
                        if ((t - 0.05) < 0) nxt = src.x;
                        return nxt;
                    };
                })
                .attrTween("y1", function () {
                    const y = d3.interpolateNumber(src.y, dst.y);
                    return function (t) {
                        let nxt = y(t - 0.05);
                        if ((t - 0.05) < 0) nxt = src.y;
                        return nxt;
                    };
                })
                .attr("x2", dst.x)
                .attr("y2", dst.y)
                .on('start', function () {
                    transitions++;
                })
                .on('end', function () {
                    transitions--;

                    d3.select(this).remove();

                    node.filter((n) => n == d1.target).attr('value', function () {
                        return parseFloat(d3.select(this).attr('value')) + d1.weight * value;
                    })

                    node.filter((n) => n == d1.target)
                        .transition().duration(100).attr("r", 17)
                        .transition().duration(100).attr("r", 15);

                    if (transitions == 0) {
                        node.filter((n) => n.layer == (d.layer + 1)).attr('value', function () {
                            return activationFunction(d3.select(this).attr('value'));
                        }).call(animate);

                        if (d1.target.layer == nLayer) {
                            // TODO animation de la prédiction
                            let xSelect = node.filter((n) => n.layer == (d.layer + 1));
                            let xSelectNodes = xSelect.nodes();

                            let xS = d3.scan(xSelect.nodes(), (a, b) => b.attributes.value.value - a.attributes.value.value);

                            d3.select(xSelectNodes[xS])
                                .transition().duration(150)
                                .attr('fill', 'yellow')
                                .attr('stroke', 'red');

                            butProp.disabled = false;
                        }
                    }
                });
        });
    })
}

function propagate() {
    butProp.disabled = true
    // Initialisation
    node.filter((n) => n.layer != 1)
        .attr('value', 0)
        .transition().duration(100)
        .attr("fill", (d, i) => color(d.layer))
        .attr('stroke', '#fff');
    // Récupération des noeuds de la première couche et activation de la propagation
    node.filter((n) => n.layer == 1).call(animate);
}