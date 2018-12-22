paper.install(window);

window.onload = () => {
    paper.setup('algo-visual');
    let activeLayer = paper.project.activeLayer;

    let drawSettings = {
        pointColor: new Color(0,0,1),
        pointSize: 2,
        pathColor: new Color(1,0,0),
        pathSize: 2,
    };
    let points = [];

    // Define references to control elements
    let elements = {};
    [
        "playConvexHull",
        "stepConvexHull",
        "resetConvexHull",
        "add10Points",
        "addExamplePoints",
        "playInterval",
        "highLevelStateDesc",
        "algoStateList",
    ].forEach(name => elements[name] = document.getElementById(name));

    // Define a function to intialize state
    let getInitialState = () => { return {
        path: null,
        targetPath: null,
        xPath: null,
        currentPoint: null,
        highLevelStateDesc: elements.highLevelStateDesc,
        algoStateList: elements.algoStateList,
    }};
    // Define a reference to access state
    let stateRef = {state: getInitialState()};

    let addPoint = point => {
        // Add point if not already running
        if (!sc.r.state.started) {
            drawPoint(point, drawSettings.pointColor, drawSettings.pointSize);
            points.push(point);
        }
    };

    // Add a point via click
    paper.view.onMouseDown = e => addPoint(e.point);

    let getAddNRandomPoints = n => () => {
        // Generate 10 random points biased towards the center
        let size = paper.view.size;
        let getVal = maxVal => {
            var v = Math.round(Math.random()*Math.random()*maxVal/2);
            v *= Math.round(Math.random()) ? 1 : -1
            return Math.round(v + maxVal/2);
        };
        let mkRandPoint = () =>
            addPoint(new Point(getVal(size.width), getVal(size.height)));
        repeat(mkRandPoint, n);
    };
    let add10 = getAddNRandomPoints(10);
    elements.add10Points.onclick = add10;

    var addedExamplePoints = false;
    let addExamplePoints = () => {
        if (!addedExamplePoints) {
            convexHullExamplePoints.map(scaleExamplePoint).forEach(addPoint);
            addedExamplePoints = true;
            elements.addExamplePoints.disabled = true;
        }
    };
    elements.addExamplePoints.onclick = addExamplePoints;

    let togglePlayUI = (playing, started) => {
        elements.playConvexHull.textContent = playing ? "Pause" : "Play";
        // Disable step button while playing
        elements.stepConvexHull.disabled = playing;
        elements.add10Points.disabled = started;
    };

    let drawStep = getDrawStep(stateRef, drawSettings.pathColor, drawSettings.pathSize);
    let sc = getStateController(drawStep, parseInt(elements.playInterval.value));
    let updateTimeInterval = () => sc.updateStepTime(
        parseInt(elements.playInterval.value)
    );
    elements.playInterval.onchange = updateTimeInterval;

    // Get the convex hull step list
    let updateList = () => graham_scan(points);
    sc.setUpdateList(updateList);
    let togglePlay = sc.getTogglePlay(togglePlayUI);

    // Set up play button for convex hull
    elements.playConvexHull.onclick = togglePlay;
    // Set up step button for convex hull
    elements.stepConvexHull.onclick = sc.manualStep;

    let resetUI = () => {
        // Clear old path if it exists
        if (!sc.r.state.justFinished) {
            // Clear existing points
            points.splice(0);
            activeLayer.clear();
            // Reset state to initial state
            stateRef.state = getInitialState();
        }
        // Reset play/pause button to initial state
        elements.playConvexHull.textContent = "Play";
        elements.playConvexHull.onclick = togglePlay;
        elements.stepConvexHull.disabled = false;
        elements.add10Points.disabled = false;
        // Reset high-level state description
        stateRef.state.highLevelStateDesc.textContent = "Not running";
        iter(stateRef.state.algoStateList.children, c => {
            unbold(c);
            if (c.childElementCount > 0) {
                iter(c.children[0].children, unbold);
            }
        });
    };
    sc.setResetUI(resetUI);
    elements.resetConvexHull.onclick = sc.reset;
}