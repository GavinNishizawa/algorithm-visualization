paper.install(window);

window.onload = () => {
    paper.setup('algo-visual');

    let drawSettings = {
        pointColor: 'blue',
        pointSize: 2,
        pathColor: 'red',
        pathSize: 2,
    };
    let points = convexHullExamplePoints.map(scaleExamplePoint);

    // Draw the convex hull example points
    drawPoints(points, drawSettings.pointColor, drawSettings.pointSize);

    // Define references to control elements
    let playConvexHullButton = document.getElementById("playConvexHull");
    let stepConvexHullButton = document.getElementById("stepConvexHull");
    let resetConvexHullButton = document.getElementById("resetConvexHull");
    let add10PointsConvexHullButton = document.getElementById("add10PointsConvexHull");
    let timeIntervalInput = document.getElementById("playInterval");

    // Define a function to intialize state
    let getInitialState = () => { return {
        playing: false,
        started: false,
        doStep: false,
        steptime: parseInt(timeIntervalInput.value),
        refreshTime: 10,
        path: null,
        justFinished: false,
    }};
    // Define a reference to access state
    let stateRef = {state: getInitialState()};

    let addPoint = (point) => {
        // Add point if not already running
        if (!stateRef.state.started) {
            drawPoint(point, drawSettings.pointColor, drawSettings.pointSize);
            points.push(point);
        }
    }

    paper.view.onMouseDown = (e) => {
        // Add a point via click
        addPoint(e.point);
    };

    let getAddNRandomPoints = (n) => () => {
        // Generate 10 random points biased towards the center
        let size = paper.view.size;
        let getVal = (maxVal) => {
            var v = Math.round(Math.random()*Math.random()*maxVal/2);
            v *= Math.round(Math.random()) ? 1 : -1
            return Math.round(v + maxVal/2);
        };
        for (var i = 0; i < n; i++) {
            addPoint(new Point(getVal(size.width), getVal(size.height)));
        }
    };
    let add10 = getAddNRandomPoints(10);
    add10PointsConvexHullButton.onclick = add10;

    let reset = () => {
        // Clear old path if it exists
        if (!stateRef.state.justFinished && stateRef.state.path) {
            stateRef.state.path.remove();
        }
        // Reset state to initial state
        let init = getInitialState();
        stateRef.state = stateRef.state.justFinished ? {...init, path:stateRef.state.path} : init;
        // Reset play/pause button to initial state
        playConvexHullButton.textContent = "Play";
        playConvexHullButton.onclick = playConvexHull;
        stepConvexHullButton.disabled = stateRef.state.playing;
        add10PointsConvexHullButton.disabled = stateRef.state.started;
    };
    resetConvexHullButton.onclick = reset;

    let doManualStep = () => {
        // Perform a manual step
        if (stateRef.state.started) {
            // Signal to perform a step
            stateRef.state.doStep = true;
        } else {
            // First start and pause before manual stepping
            playConvexHull();
            togglePlay();
        }
    };
    stepConvexHullButton.onclick = doManualStep;

    let togglePlay = () => {
        // Signal to Play/Pause execution
        stateRef.state.started = true;
        stateRef.state.playing = !stateRef.state.playing;
        playConvexHullButton.textContent = stateRef.state.playing ? "Pause" : "Play";
        // Disable step button while playing
        stepConvexHullButton.disabled = stateRef.state.playing;
        add10PointsConvexHullButton.disabled = stateRef.state.started;
    }

    let updateTimeInterval = () => {
        // Update the state with the updated element value
        stateRef.state.steptime = parseInt(timeIntervalInput.value);
    };
    timeIntervalInput.onchange = updateTimeInterval;

    let drawPath = getDrawPath(drawSettings.pathColor, drawSettings.pathSize);

    let playConvexHull = () => {
        // Begin execution of algorithm
        togglePlay();

        // Get the convex hull step generator
        var hullStep = graham_scan(points);
        // Run the algorithm visualization
        drawPath(hullStep, stateRef, result => {
            console.log(result);
            reset();
        });
        // While running, set play button to toggle between play and pause
        playConvexHullButton.onclick = togglePlay;
    };

    // Set up play button for convex hull
    playConvexHullButton.onclick = playConvexHull;
}