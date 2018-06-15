const windowHeight = window.innerHeight;
const scrollHeight = document.body.scrollHeight - windowHeight;

function scrollTransition(ease, direction='bottom') {
    var Y = window.pageYOffset || document.documentElement.scrollTop;

    d3.transition().duration(5000).ease(ease)
        .tween('scroll', () => {
            let i = null;
            if(direction === 'top')
                i = d3.interpolate(scrollHeight, 0);
            else if(direction === 'bottom')
                i = d3.interpolate(0, scrollHeight);
            return function (t) {
                window.scroll(0, i(t));
            }
        })
        .on('start', () => {
            d3.selectAll('button').attr('disabled', true);
        })
        .on('interrupt', () => {
            console.log('TRANSITION INTERRUPTED');
            d3.selectAll('button').attr('disabled', null);
        })
        .on('end', () => {
            d3.selectAll('button').attr('disabled', null);
        });
}
