
const Interface = (() => {

    function getControls() {
    // Define a controls object with references to control elements
        let controls = {};
        // Control elements are elements with the 'control' class
        let controlElements = document.getElementsByClassName("control");
        // Assign each element to the controls object with its id as its key
        iter(controlElements, el => controls[el.id] = el);
        return controls;
    }

    const controls = getControls();

    const getAddNRandomPoints = (N, addPoint) => () => {
    // Generate N random points biased towards the center
        // Generate a random 1 or -1
        const getRandomSign = () => Math.round(Math.random()) ? 1 : -1;
        // Generate a random value in [0, 1] biased towards 0
        const getBiasedRandom = () => Math.random() * Math.random();

        const getVal = maxVal => {
        // Generate a random value in range [0, maxVal] biased towards the center
            const middle = maxVal / 2;
            const offset = getRandomSign() * getBiasedRandom() * middle;
            return Math.round(middle + offset);
        };

        // Get the canvas size
        const size = Canvas.getSize();
        // Generate a random point
        const mkRandPoint = () =>
            addPoint(new Point(getVal(size.width), getVal(size.height)));

        // DO: Make N random points
        repeat(mkRandPoint, N);
    };

    const togglePlayUI = (playing, started) => {
    // Updates the UI based on the play state
        // Set the play/pause button text based on the play state
        controls.playConvexHull.textContent = playing ? "Pause" : "Play";
        // Disable step button while playing
        controls.stepConvexHull.disabled = playing;
        // Disable add points button once started
        controls.add10Points.disabled = started;
    };

    const getPlayInterval = () => (() => {
    // Returns the current play interval value
        const speeds = [];
        // Set N speeds starting from 2000, 60% speed up each time
        repeat(i => speeds.push(Math.round(2000 * ((1/1.6)**i))),
            controls.playInterval.max);
        speeds.push(0); // Set fastest speed: 0
        return () => speeds[parseInt(controls.playInterval.value)];
    })();

    function initPlayInterval(playController) {
        // Get the function to draw the state
        const drawState = Draw.getDrawState(
            Canvas.drawSettings.pathColor,
            Canvas.drawSettings.pathSize,
        );

        playController.setOnChange((state, index) => {
        // Update the UI on state changes
            // Update the state description
            updateStateDescription(state.highLevelState, state.lowLevelState);
            // Draw the current state
            drawState(state, index);
        });
        // Update the play controller's step time when the UI element is changed
        controls.playInterval.oninput = playController.updateStepTime;
    }

    const getAddPoint = (points, drawSettings) => (point, started) => {
    // Returns a function which takes a point and started state
    // and draws the point and adds it to the points list

        // Add point if not already running
        if (!started) {
            // DO: Draw the point on the canvas
            Draw.drawPoint(point, drawSettings.pointColor, drawSettings.pointSize);
            // DO: Add the point to the points list
            points.push(point);
        }
    };

    function initAddPointOnClick(addPoint, checkStarted) {
        // Add a point via click if algorithm has not started
        Canvas.setClickEvent(e => addPoint(e.point, checkStarted()));
    }

    function resetStateText() {
        // Reset high-level state description
        controls.highLevelStateDesc.textContent = "Not running";
        // Reset algorithm steps state
        iter(controls.algoStateList.children, c => {
            unbold(c); // unbold high level states
            if (c.childElementCount > 0) {
                // unbold lowlevel states
                iter(c.children[0].children, unbold);
            }
        });
    }

    function updateStateText(highLevelState) {
        // Update the state description
        controls.highLevelStateDesc.textContent = Graham.algorithmStateText[highLevelState];
    }

    const updateStateDescription = (highLevelState, lowLevelState) => {
    // Updates the UI state description for the given state
        updateStateText(highLevelState);
        iter(controls.algoStateList.children, (c,i) => {
            // bold current high level state and unbold others
            (i == highLevelState) ? bold(c) : unbold(c);

            if (c.childElementCount > 0) {
            // Define low level update if low level states exist
                const updateLowLevel = (cc,j) =>
                    // bold current low level state and unbold others
                    (i == highLevelState && j == lowLevelState) ? bold(cc) : unbold(cc);
                // update the low level states
                iter(c.children[0].children, updateLowLevel);
            }
        });
    };

    function resetButtons(togglePlay) {
        // Reset play/pause button to initial state
        controls.playConvexHull.textContent = "Play";
        controls.playConvexHull.onclick = togglePlay;
        // Enable step button
        controls.stepConvexHull.disabled = false;
        // Enable add points button
        controls.add10Points.disabled = false;
    }

    function initButtons(pc, addPoint) {
        // Set up play button for convex hull
        controls.playConvexHull.onclick = pc.togglePlay;
        // Set up step button for convex hull
        controls.stepConvexHull.onclick = pc.manualStep;
        // Initialize the add points button to add 10 points
        controls.add10Points.onclick = getAddNRandomPoints(10, addPoint);
    }

    function initReset(points, playController) {
        // Get function to update UI based on play state
        // Set the play controller's togglePlayUI function
        playController.setTogglePlayUI(playing => togglePlayUI(playing, true));

        const resetControls = () => {
        // Reset the buttons and state text
            resetButtons(playController.togglePlay);
            togglePlayUI(false, false);
            resetStateText();
        };
        const resetAll = () => {
        // Reset the canvas and controls
            points.splice(0); // Clear existing points
            Canvas.clear();
            resetControls();
            playController.reset();
        };

        // Set the controls to reset when play finishes
        playController.setOnDone(resetControls);
        // Initialize reset button
        controls.resetConvexHull.onclick = resetAll;
    }

    function init(points, playController ) {
        // Get the function to add a point
        const addPoint = getAddPoint(points, Canvas.drawSettings);

        // Initialize the reset functionality
        initReset(points, playController);
        // Initialize the play functionality
        initPlayInterval(playController);
        // Initialize the click to add point functionality
        initAddPointOnClick(addPoint, playController.isStarted);
        // Initialize the control buttons' functionality
        initButtons(playController, addPoint);
    }

    return {
        init,
        getPlayInterval,
    };
})();