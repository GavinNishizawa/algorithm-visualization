paper.install(window);

window.onload = () => {
    paper.setup('algo-visual');

    // Draw the convex hull example points
    drawPoints(convexHullExamplePoints, "blue", 2);

    let drawPath = getDrawPath("red", 2);

    // Define references to control elements
    let playConvexHullButton = document.getElementById("playConvexHull");
    let stepConvexHullButton = document.getElementById("stepConvexHull");
    let resetConvexHullButton = document.getElementById("resetConvexHull");
    let timeIntervalInput = document.getElementById("playInterval");

    // Define a function to intialize state
    let getInitialState = () => { return {
        playing: false,
        started: false,
        doStep: false,
        steptime: parseInt(timeIntervalInput.value),
        refreshTime: 10,
    }};
    // Define a reference to access state
    let stateRef = {state: getInitialState()};

    let reset = () => {
        // Reset state to initial state
        stateRef.state = getInitialState();
        // Reset play/pause button to initial state
        playConvexHullButton.textContent = "Play";
        playConvexHullButton.onclick = playConvexHull;
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
            doManualStep();
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
    }

    let updateTimeInterval = () => {
        // Update the state with the updated element value
        stateRef.state.steptime = parseInt(timeIntervalInput.value);
    };
    timeIntervalInput.onchange = updateTimeInterval;

    let playConvexHull = () => {
        // Begin execution of algorithm
        togglePlay();

        // Get the convex hull step generator
        var hullStep = graham_scan(convexHullExamplePoints);
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