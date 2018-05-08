// CONSTANTES
const INITIAL_SPEED = 1; // px par s
const G = 9.81; // px / s²

// DATA
let data = [];

let index = 0;
let position = [{}];

let currentSpeed = INITIAL_SPEED;

let pressing = false;

// SVG
const svg = d3.select("body").append("svg")
    .attr("width", window.innerWidth)
    .attr("height", window.innerHeight);

const coaster = svg.append("circle")
    .attr("r", 7)
    .style("opacity", 0)
    .attr("fill", "steelblue")
    .attr("stroke-width", "1.5px")
    .attr("stroke", "blue");

let width = svg.attr("width");
let height = svg.attr("height");

// Scale
const x = d3.scaleLinear()
    .domain([0, width])
    .range([0, width]);
const y = d3.scaleLinear()
    .domain([0, height])
    .range([height, 0]);

// Force Simulation
const simulation = d3.forceSimulation()
    .alphaDecay(0);

const line = d3.line()
    .x(function (d) { return d.x; })
    .y(function (d) { return d.y; })
    .curve(d3.curveBasis);
// .curve(d3.curveCatmullRom);

const path = svg.append("path");

svg.on("contextmenu", function (d) {
    d3.event.preventDefault();
})

svg.on("dblclick", function () {
    index = 0;
    const first = data[index];
    position = [first];

    if (first) {
        coaster
            .data(position)
            .style("opacity", 1)
            .attr("cx", function (d) { return d.x })
            .attr("cy", function (d) { return d.y });

        // coaster.transition().call(moveTransition, 1);

        simulation
            .nodes(position)
            .on("tick", ticked)
            .restart();
    }
});

svg.on("mousedown", function () {
    const button = d3.event.button;

    if (button === 0)
        pressing = true;
    else if (button === 2) {
        simulation.stop();

        data = [];
        currentSpeed = INITIAL_SPEED;
        updatePath();
    }
    coaster.transition().style("opacity", 0);
});

svg.on("mouseup", function () {
    pressing = false;
});

svg.on("mouseleave", function () {
    pressing = false;
});

svg.on("mousemove", function () {
    const mouse = d3.mouse(this);

    if (pressing) {
        data.push({ x: mouse[0], y: mouse[1] });
        updatePath();
    }
});

// Redraw based on the new size whenever the browser window is resized.
window.addEventListener("resize", () => {
    svg.attr("width", window.innerWidth)
        .attr("height", window.innerHeight);

    width = svg.attr("width");
    height = svg.attr("height");
});

function updatePath() {
    path.datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", line);
}

function moveTransition(transition, i) {
    // Point actuelle
    const current = {
        x: parseInt(coaster.attr("cx")),
        y: parseInt(coaster.attr("cy"))
    };
    // Point suivant
    const next = data[i];
    // Projection du point actuelle sur la droite y = x
    const projection = {
        x: current.x,
        y: next.y
    };
    // Calcul de la distance avec le suivant
    const distance = Math.sqrt(
        Math.pow(next.x - current.x, 2) +
        Math.pow(next.y - current.y, 2));
    // Calcul du vecteur
    const vector1 = {
        x: next.x - current.x,
        y: y.invert(next.y) - y.invert(current.y),
    };
    vector1.distance = Math.sqrt(Math.pow(vector1.x, 2) + Math.pow(vector1.y, 2));
    const vector2 = {
        x: next.x - projection.x,
        y: y.invert(next.y) - y.invert(projection.y)
    };
    vector2.distance = Math.sqrt(Math.pow(vector2.x, 2) + Math.pow(vector2.y, 2));
    // Calcul de l'angle entre les deux vecteurs
    const cos = (vector1.x * vector2.x + vector1.y * vector2.y) / (vector1.distance * vector2.distance);
    console.log('Cos : ' + cos);
    let angle = 0;
    console.log('Angle : ' + angle);
    if (isNaN(cos))
        throw 'Cos is NaN !';
    angle = Math.acos(cos) * 180 / Math.PI;
    const acceleration = G * Math.sin(angle);
    currentSpeed = Math.sqrt(Math.pow(currentSpeed, 2) + 2 * acceleration * distance);
    if (isNaN(currentSpeed) || currentSpeed < INITIAL_SPEED)
        currentSpeed = INITIAL_SPEED;
    const duration = distance / currentSpeed;
    // const newSpeed = currentSpeed + acceleration
    console.log('Vecteur 1 : %O', vector1);
    console.log('Vecteur 2 : %O', vector2);


    console.log('Distance : ' + distance.toFixed(2));
    console.log('Duration :' + duration.toFixed(2));
    // console.log(Math.pow(currentSpeed, 2) + 2 * acceleration * distance);
    console.log('Accélération : ' + acceleration);
    console.log('Vitesse : ' + currentSpeed);
    console.log('----------------------');

    if (isNaN(currentSpeed)) {
        console.log("EH !")
        throw 'Vitesse NaN';
    }

    transition
        .duration(duration * 1000)
        .ease(d3.easeLinear)
        .attr("cx", next.x)
        .attr("cy", next.y)
        .on("end", function () {
            i++;
            if (i < data.length) {
                d3.select(this).transition().call(moveTransition, i);
            }
        });
};

function ticked() {
    // Testing next
    // if(coaster.data() === data[index+1])
    let coasterData = coaster.data()[0];
    console.log(coasterData.x === data[index].x && coasterData.y === data[index].y);
    if (coasterData.x === data[index].x && coasterData.y === data[index].y) {
        const nextPosition = data[++index];
        if (nextPosition) {
            // On passe à la suite
            // position = [nextPosition];

            simulation
                .force("x", d3.forceX().x(nextPosition.x))
                .force("y", d3.forceY().y(nextPosition.y));
        } else
            simulation.stop();
    } else {
        simulation
        .force("x", d3.forceX().x(function (d) { return d.x; }))
        .force("y", d3.forceY().y(function (d) { return d.y; }));
    }

    coaster.attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; });
}