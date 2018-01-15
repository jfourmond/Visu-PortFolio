const typing_times = [67, 62, 72, 51, 92, 60, 84, 65, 60];
const sum = typing_times.reduce(function (a, b) { return a + b; });
const avg = sum / typing_times.length; // Average words per minute

let string = "";
const sentences = [];

const input = document.getElementById("input");
input.value = string;

const width = window.innerWidth;
const height = window.innerHeight;
// Calcul du nombre de caractères en fonction de la fenêtre
const height_char = 36;
const width_char = height_char * 0.6; // 60% de la hauteur

const max_char = Math.round(width / width_char);

// const max_char = 67;

console.log("Typing Speed : %O", avg);
console.log("Max char per line : %O", max_char);

// SVG
let svg = d3.select("body").append("svg")
    .attr("width", width - 20)
    .attr("height", height - 150);

// TEXT
let text = svg.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("font-size", "36px")
    .attr("font-family", "monospace");

function updateText() {
    string = input.value;
    splitText();
    updateView();
    animate_tspans();
}

function splitText() {
    // Initialisation du tableau
    sentences.length = 0;
    // Compte du nombre de mots
    const words = string.split(" ");
    const count_word = words.length;
    // Création des lignes
    let char_count = 0;
    let line = "";
    let word_count = 0
    for (let ch of words) {
        const char = ch.length;
        if (char + char_count > max_char) {
            sentences.push({
                sentence: line,
                words: word_count
            });
            line = "";
            char_count = 0;
            word_count = 0;
        }
        line = line.concat(ch, " ");
        char_count = line.length;
        word_count++;
    }
    if (line != "") {
        sentences.push({
            sentence: line,
            words: word_count
        });
    }
}

function updateView() {
    svg.attr("height", sentences.length * height_char);
    text.selectAll("tspan").remove()
    text.selectAll("span").data(sentences)
        .enter()
        .append("tspan")
        .attr("x", 0)
        .attr("y", 26)
        .attr("dy", function (d, i) { return i * height_char; });
}

function animate_tspans() {
    const tspans = text.selectAll("tspan");
    let index = 0;
    animate_tspan(tspans.nodes(), index);
}

function animate_tspan(nodes, index) {
    const nodes_nb = nodes.length;
    const it = d3.select(nodes[index]);
    const datum = it.datum();
    const ms_needed = 60000 * (datum.words / avg);
    it.transition().duration(ms_needed).ease(d3.easeLinear)
        .tween("text", function (d) {
            const that = d3.select(this),
                i = d3.interpolateRound(0, d.sentence.length);
            return function (t) {
                const current_length = i(t);
                that.text(d.sentence.slice(0, current_length));
            }
        })
        .on("end", function () {
            index++;
            if (index < nodes_nb)
                animate_tspan(nodes, index);
        });
}