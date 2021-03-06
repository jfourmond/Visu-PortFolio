const butProp = document.getElementById("butProp");
const butRes = document.getElementById("butRes");

const height = 500;
const width = 960;

const svg = d3.select("#left").append("svg")
    .attr("width", 725)
    .attr("height", 500);

const color = d3.scaleOrdinal(d3.schemeCategory10);
const prctFormat = d3.format(".1f");
const weightFormat = d3.format(".3f");

let simulation = null;

let dnodes = null;
let dlasts = null;
let dlinks = null;

let node = null;
let link = null;
let texts = null;

let nLayer = 0;

let transitions = 0;
let running = false;

const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .html("");

Promise.all([
    d3.json("../data/propagation/nodes.json"),
    d3.json("../data/propagation/links.json")
]).then((values) => {
    for (let i = 0; i < values[1].length; i++)
        values[1][i].weight = Math.random();

    nLayer = d3.max(values[0], function (x) { return x.layer })

    dnodes = values[0];
    dlinks = values[1];

    dlasts = dnodes.filter(d => d.layer == nLayer);
    dlasts.forEach(element => { element.value = 0; });

    draw();
}).catch((e) => {
    console.error(e);
});

function reLU(value) {
    return Math.max(0, value);
}

function softmax(arr) {
    return arr.map(function (value, index) {
        return Math.exp(value) / arr.map(function (y) { return Math.exp(y) }).reduce(function (a, b) { return a + b })
    })
}

function draw() {
    simulation = d3.forceSimulation(dnodes)
        .force("link", d3.forceLink(dlinks).id(d => d.id).strength(0));

    link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(dlinks)
        .join("line")
        .attr("stroke-width", 0.75)
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)
        .on("mouseover", function(d) {
            d3.select(this).attr('stroke-width', 1.5);
            tooltip.style("opacity", .9);	
        })
        .on("mousemove", function(d) {
            tooltip.html(weightFormat(d.weight))	
                .style("left", (d3.event.pageX - 20) + "px")		
                .style("top", (d3.event.pageY - 20) + "px");	
        })
        .on("mouseout", function(d) {
            d3.select(this).attr('stroke-width', 0.75);
            tooltip.style("opacity", 0);
        })

    node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(dnodes)
        .join("circle")
        .attr("r", 15)
        .attr("fill", (d, i) => color(d.layer))
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("value", function (d) {
            if (d.layer == 1) return 1;
            return 0;
        });

    texts = svg.append("g")
        .selectAll("text")
        .data(dlasts)
        .join("text")
        .attr('opacity', 0)
        .attr("x", (d) => { return d.x + 20; })
        .attr("y", (d) => { return d.y + 4; })
        .text((d) => { return d.value; })
        .attr("font-family", "sans-serif")
        .attr("font-size", "12px");
}

d3.selectAll('input')
    .on('input', function (d, i) {
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
    })
    .on('keypress', function () {
        if (d3.event.keyCode === 13 && !running)
            propagate();
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
                        if (d1.target.layer != nLayer)
                            node.filter((n) => n.layer == (d.layer + 1)).attr('value', function () {
                                return reLU(d3.select(this).attr('value'));
                            }).call(animate);
                        else {


                            let xSelect = node.filter((n) => n.layer == (d.layer + 1));
                            let xSelectNodes = xSelect.nodes();

                            let yS = xSelect.nodes().map((a) => a.attributes.value.value);
                            let softmaxY = softmax(yS);
                            let prctY = softmaxY.map((a) => a * 100);

                            for (let i = 0; i < prctY.length; i++)
                                dlasts[i].value = prctY[i];

                            texts
                                .transition().duration(150)
                                .attr("opacity", 1)
                                .tween("text", function (d) {
                                    const that = d3.select(this),
                                        i = d3.interpolateNumber(that.text(), d.value);
                                    return function (t) { that.text(prctFormat(i(t))) }
                                });

                            let xS = d3.scan(xSelect.nodes(), (a, b) => b.attributes.value.value - a.attributes.value.value);

                            d3.select(xSelectNodes[xS])
                                .transition().duration(150)
                                .attr('fill', 'yellow')
                                .attr('stroke', 'red');

                            butProp.disabled = false;
                            butRes.disabled = false;
                            running = false;
                        }
                    }
                });
        });
    })
}

/**
 * Lancement de l'animation de propagation
 */
function propagate() {
    butProp.disabled = true
    butRes.disabled = true;
    running = true;
    // Initialisation
    node.filter((n) => n.layer != 1)
        .attr('value', 0)
        .transition().duration(100)
        .attr("fill", (d, i) => color(d.layer))
        .attr('stroke', '#fff');
    texts.transition().duration(100)
        .attr("opacity", 0);
    // Récupération des noeuds de la première couche et activation de la propagation
    node.filter((n) => n.layer == 1).call(animate);
}

/**
 * Réinitialisation des poids
 */
function resetWeights() {
    for (let i = 0; i < dlinks.length; i++)
        dlinks[i].weight = Math.random();

    node.filter((n) => n.layer != 1)
        .attr('value', 0)
        .transition().duration(100)
        .attr("fill", (d, i) => color(d.layer))
        .attr('stroke', '#fff');
    texts.transition().duration(100)
        .attr("opacity", 0);
}