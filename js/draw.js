function scalePoint(pt){
    var scaleFactor = 20, xOffset = 0, yOffset=10*scaleFactor;
    return [scaleFactor*pt[0]+xOffset, -scaleFactor*pt[1]+yOffset];
}

function drawPoints(points, pointColor='blue', pointSize=1) {
    points.forEach(pt => {
        var myCircle = new Path.Circle(new Point(...scalePoint(pt)), pointSize);
        myCircle.strokeColor = pointColor;
        myCircle.fillColor = pointColor;
    })
}

function getDrawPath(pathColor='red', pathWidth=1) {
    var path;
    function drawCompute(stepFn, stateRef, then, initial=false) {
        // clear old path if starting over
        if (initial && path) path.remove();

        function doStep() {
            // RESET
            if (!stateRef.state.started) {
                // state was reset if started is false
                // clear path and end execution
                if (path) path.remove();
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
                then(step.value);
                return;
            }

            // Create new path object
            if (path) path.remove();
            path = new Path();
            path.strokeColor = pathColor;
            path.strokeWidth = pathWidth;

            // draw the path between points
            step.value.forEach(pt => {
                var point = new Point(...scalePoint(pt));
                path.lineTo(point);
                path.moveTo(point);
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