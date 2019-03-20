const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

const line = d3.line()
    .x((d) => d[0])
    .y((d) => d[1]);

const color = d3.scaleOrdinal(d3.schemeCategory10);

const data = [
    [[200, 200], [200, 300], [200, 400], [200, 500]],  // Première couche
    [[550, 250], [550, 350], [550, 450]],  // Seconde couche
    [[900, 200], [900, 300], [900, 400], [900, 500]]  // Troisième couche
];

const layers_circles = [];
const layers_connexions_static = [];
const layers_connexions_animated = [];

for (let layers_idx = 0; layers_idx < (data.length - 1); layers_idx++) {
    const connexions_static = [ ];
    const connexions_animated = [ ];
    for (let units1_idx = 0; units1_idx < (data[layers_idx].length); units1_idx++) {
        const units_1 = data[layers_idx][units1_idx];

        for (let units2_idx = 0; units2_idx < (data[layers_idx + 1].length); units2_idx++) {
            const units_2 = data[layers_idx + 1][units2_idx];

            let link = [units_1, units_2];

            let path = svg.append("path")
                .attr("d", line(link))
                .attr("fill", "none")
                .attr("stroke", "#cccccc")
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 1);
            connexions_static.push(path);

            let totalLength = path.node().getTotalLength();
            let dashLength = totalLength / 16;

            let animated_path = svg.append("path")
                .attr("d", line(link))
                .attr("fill", "none")
                .attr("stroke", "orange")
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 1.5)
                .attr("stroke-dasharray", dashLength + " " + (totalLength + dashLength))
                .attr("stroke-dashoffset", dashLength)
                .attr("stroke-linecap", "round");

            animated_path.animate = () => {
                animated_path.transition()
                    .duration(5000).ease(d3.easeLinear)
                    .attr("stroke-dashoffset", -(totalLength))
            };

            connexions_animated.push(animated_path);
        }
    }
    layers_connexions_static.push(connexions_static);
    layers_connexions_animated.push(connexions_animated);
}

for (let idx = 0; idx < data.length; idx++) {
    const d = data[idx];

    layers_circles.push(
        svg.selectAll(".layer_" + idx)
            .data(d)
            .enter()
            .append("circle")
            .attr("class", "layer_" + idx)
            .attr("r", 20)
            .attr("fill", color(idx))
            .attr("cx", (d) => d[0])
            .attr("cy", (d) => d[1])
    );
}

// Animation de la première couche
layers_connexions_animated[0].forEach(c => c.animate());
