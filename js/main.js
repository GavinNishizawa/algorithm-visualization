paper.install(window);

let main = (() => {
    const drawSettings = {
        pointColor: new Color(0,0,1),
        pointSize: 2,
        pathColor: new Color(1,0,0),
        pathSize: 2,
    };

    function getViewSize() {
        return paper.view.size;
    }
    function clearActiveLayer() {
        paper.project.activeLayer.clear();
    }
    function setCanvasClickEvent(fn) {
        paper.view.onMouseDown = fn;
    }

    function getControls() {
        // Define references to control elements
        let controls = {};
        let controlElements = document.getElementsByClassName("control");
        iter(controlElements, el => controls[el.id] = el);
        return controls;
    }

    // Define a function to intialize state
    let getInitialState = (controls) => { return {
        path: null,
        targetPath: null,
        xPath: null,
        currentPoint: null,
        highLevelStateDesc: controls.highLevelStateDesc,
        algoStateList: controls.algoStateList,
    }};

    let getAddPoint = (points, drawSettings) => (point, started) => {
        // Add point if not already running
        if (!started) {
            drawPoint(point, drawSettings.pointColor, drawSettings.pointSize);
            points.push(point);
        }
    };

    function initAddPointOnClick(addPoint) {
        // Add a point via click
        setCanvasClickEvent(e => addPoint(e.point));
    }

    function initAdd10Points(controls, addPoint) {
        controls.add10Points.onclick = getAddNRandomPoints(10, addPoint);
    }

    let getAddNRandomPoints = (n, addPoint) => () => {
        // Generate 10 random points biased towards the center
        let size = getViewSize();
        let getVal = maxVal => {
            var v = Math.round(Math.random()*Math.random()*maxVal/2);
            v *= Math.round(Math.random()) ? 1 : -1
            return Math.round(v + maxVal/2);
        };
        let mkRandPoint = () =>
            addPoint(new Point(getVal(size.width), getVal(size.height)));
        repeat(mkRandPoint, n);
    };

    let getTogglePlayUI = controls => (playing, started) => {
        controls.playConvexHull.textContent = playing ? "Pause" : "Play";
        // Disable step button while playing
        controls.stepConvexHull.disabled = playing;
        controls.add10Points.disabled = started;
    };

    let getPlayInterval = controls => parseInt(controls.playInterval.value);

    function initPlayInterval(controls, sc) {
        controls.playInterval.onchange = () => sc.updateStepTime(
            getPlayInterval(controls)
        );
    }

    let resetStateText = (highLevelStateDesc, algoStateList) => {
        // Reset high-level state description
        highLevelStateDesc.textContent = "Not running";
        iter(algoStateList.children, c => {
            unbold(c);
            if (c.childElementCount > 0) {
                iter(c.children[0].children, unbold);
            }
        });
    }

    let resetButtons = (controls, togglePlay) => {
        // Reset play/pause button to initial state
        controls.playConvexHull.textContent = "Play";
        controls.playConvexHull.onclick = togglePlay;
        controls.stepConvexHull.disabled = false;
        controls.add10Points.disabled = false;
    };

    function initButtons(controls, togglePlay, sc) {
        // Set up play button for convex hull
        controls.playConvexHull.onclick = togglePlay;
        // Set up step button for convex hull
        controls.stepConvexHull.onclick = sc.manualStep;
    }

    function initReset(points, controls, stateRef, sc, togglePlay) {
        let resetUI = (justFinished) => {
            // Clear old path if it exists
            if (!justFinished) {
                // Clear existing points
                points.splice(0);
                clearActiveLayer();
                // Reset state to initial state
                stateRef.state = getInitialState(controls);
            }
            resetButtons(controls, togglePlay);
            resetStateText(stateRef.state.highLevelStateDesc, stateRef.state.algoStateList);
        };
        sc.setResetUI(resetUI);
        controls.resetConvexHull.onclick = sc.reset;
    }

    function updateStateText(controls, highLevelState) {
        // Update the state description
        controls.highLevelStateDesc.textContent = algorithmStateText[highLevelState];
    }

    let getUpdateStateDescription = controls => (highLevelState, lowLevelState) => {
        updateStateText(controls, highLevelState);
        iter(controls.algoStateList.children, (c,i) => {
            if (i == highLevelState) {
                bold(c);
                if (c.childElementCount > 0) {
                    iter(c.children[0].children, (cc,j) =>
                        (j == lowLevelState) ? bold(cc) : unbold(cc)
                    );
                }
            } else {
                unbold(c);
                if (c.childElementCount > 0) {
                    iter(c.children[0].children, unbold);
                }
            }
        });
    }

    function initStateRef(controls) {
        let stateRef = {state: getInitialState(controls)};
        stateRef.updateStateDescription = getUpdateStateDescription(controls);
        return stateRef;
    }

    function init() {
        let points = [];
        let controls = getControls();
        // Define a reference to access state
        let stateRef = initStateRef(controls);
        let addPoint = getAddPoint(points, drawSettings);
        initAddPointOnClick(addPoint);
        initAdd10Points(controls, addPoint);

        let drawStep = getDrawStep(stateRef, drawSettings.pathColor, drawSettings.pathSize);
        let sc = getStateController(drawStep, getPlayInterval(controls));
        initPlayInterval(controls, sc);

        // Set the function to get an updated convex hull state list
        sc.setUpdateList(() => graham_scan(points));
        let togglePlay = sc.getTogglePlay(getTogglePlayUI(controls));

        initButtons(controls, togglePlay, sc);
        initReset(points, controls, stateRef, sc, togglePlay);
    }

    return { init };
})();

window.onload = () => {
    paper.setup('algo-visual');
    main.init();
}