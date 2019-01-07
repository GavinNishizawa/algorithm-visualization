paper.install(window); // set up paper.js

const Canvas = (() => {
    const drawSettings = {
    // Define the canvas drawing settings
        pointColor: new Color(0,0,1),
        pointSize: 2,
        pathColor: new Color(1,0,0),
        pathSize: 2,
    };

    // Define helper functions to interact with the canvas
    const getSize = () => paper.view.size;
    const clear = () => paper.project.activeLayer.clear();
    const setClickEvent = fn => paper.view.onMouseDown = fn;
    const init = () => paper.setup('algo-visual');

    return {
        clear,
        drawSettings,
        getSize,
        setClickEvent,
        init,
    };
})();
