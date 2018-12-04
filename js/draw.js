function scaleExamplePoint(pt){
    var scaleFactor = 20, xOffset = 0, yOffset=10*scaleFactor;
    return new Point(scaleFactor*pt[0]+xOffset, -scaleFactor*pt[1]+yOffset);
}

function drawPoint(point, pointColor='blue', pointSize=1) {
    var ptCircle = new Path.Circle(point, pointSize);
    ptCircle.strokeColor = pointColor;
    ptCircle.fillColor = pointColor;
    return ptCircle;
}
function drawPoints(points, pointColor, pointSize) {
    points.forEach(pt => {
        drawPoint(pt, pointColor, pointSize);
    })
}

function getDrawPath(pathColor='red', pathWidth=1) {
    function drawCompute(stepFn, stateRef, then, initial=false) {
        // clear old path if starting over
        if (initial && stateRef.state.path) stateRef.state.path.remove();

        function doStep() {
            // RESET
            if (!stateRef.state.started) {
                // state was reset if started is false => end execution
                return
            }
            // PAUSE
            if (!stateRef.state.playing) {
                if (stateRef.state.doStep) {
                    // DO STEP
                    stateRef.state.doStep = false;
                } else {
                    // Wait for refreshTime ms until checking play status again
                    setTimeout(doStep, stateRef.state.refreshTime);
                    return
                }
            }

            // Take a step
            var step = stepFn.next();

            // Finish by calling then with the final result
            if (step.done) {
                stateRef.state.justFinished = true;
                then(step.value);
                return;
            }

            // Create new path object
            if (stateRef.state.path) stateRef.state.path.remove();
            stateRef.state.path = new Path();
            stateRef.state.path.strokeColor = pathColor;
            stateRef.state.path.strokeWidth = pathWidth;

            // draw the path between points
            step.value.forEach(pt => {
                stateRef.state.path.lineTo(pt);
                stateRef.state.path.moveTo(pt);
            });

            setTimeout(() => {
                // take the next step
                drawCompute(stepFn, stateRef, then);
            }, stateRef.state.steptime);
        }
        doStep();
    }
    // Start
    return (stepFn, stateRef, then=r=>{}) => drawCompute(stepFn, stateRef, then, true);
}