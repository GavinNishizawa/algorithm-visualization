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

    let getAddPoint = (points, drawSettings) => (point, started) => {
        // Add point if not already running
        if (!started) {
            drawPoint(point, drawSettings.pointColor, drawSettings.pointSize);
            points.push(point);
        }
    };

    function initAddPointOnClick(addPoint, checkStarted) {
        // Add a point via click
        setCanvasClickEvent(e => addPoint(e.point, checkStarted()));
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

    let initPlayInterval = (controls, update) => controls.playInterval.onchange = update;

    let resetStateText = controls => {
        // Reset high-level state description
        controls.highLevelStateDesc.textContent = "Not running";
        iter(controls.algoStateList.children, c => {
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

    function initButtons(controls, togglePlay, pc) {
        // Set up play button for convex hull
        controls.playConvexHull.onclick = togglePlay;
        // Set up step button for convex hull
        controls.stepConvexHull.onclick = pc.stepForward;
    }

    function initReset(points, controls, pc, togglePlay) {
        let resetUI = (justFinished) => {
            // Clear old path if it exists
            if (!justFinished) {
                // Clear existing points
                points.splice(0);
                clearActiveLayer();
            }
            resetButtons(controls, togglePlay);
            resetStateText(controls);
        };

        controls.resetConvexHull.onclick = () => {
            pc.reset();
            resetUI(false);
        };
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

    function init() {
        let points = [];
        let controls = getControls();
        // Define a reference to access state
        let addPoint = getAddPoint(points, drawSettings);
        initAdd10Points(controls, addPoint);
        let updateStateDescription = getUpdateStateDescription(controls);
        let drawState = getDrawState(drawSettings.pathColor, drawSettings.pathSize);

        let updateList = () => graham_scan(points);
        let updateStepTime = () => getPlayInterval(controls);
        let update = (state, index) => {
            updateStateDescription(state.highLevelState, state.lowLevelState);
            drawState(state, index);
        };
        let togglePlayUI = getTogglePlayUI(controls);
        let resetUI = () => {
            togglePlayUI(false, false);
            resetStateText(controls);
        };
        let onStart = playing => togglePlayUI(playing, true);
        let togglePlay = (() => {
            let playing = false;
            return () => {
                playing = playController.togglePlay();
                onStart(playing);
            };
        })();
        let playController = getPlayController(updateList, updateStepTime, update, resetUI, onStart);
        initPlayInterval(controls, playController.updateStepTime);
        initAddPointOnClick(addPoint, playController.isStarted);

        initButtons(controls, togglePlay, playController);
        initReset(points, controls, playController, togglePlay);
    }

    return { init };
})();

window.onload = () => {
    paper.setup('algo-visual');
    main.init();
}