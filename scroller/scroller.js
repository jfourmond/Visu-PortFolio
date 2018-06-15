const windowHeight = window.innerHeight;
const scrollHeight = document.body.scrollHeight - windowHeight;

function scrollTransition(ease) {
    d3.transition().duration(5000).ease(ease)
        .tween('scroll', () => {
            const i = d3.interpolate(0, scrollHeight);
            return function (t) {
                window.scroll(0, i(t));
            }
        })
        .on('start', () => {
            console.log('TRANSITION STARTED');
        })
        .on('interrupt', () => {
            console.log('TRANSITION INTERRUPTED');
        })
        .on('end', () => {
            console.log('TRANSITION ENDED');
        });
}
