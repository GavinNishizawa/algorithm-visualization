function scaleExamplePoint(pt){
    var scaleFactor = 16, xOffset = 0, yOffset=8*scaleFactor;
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

function createTargetPath(a, b, pathWidth=1) {
    let targetPath = new Path();
    targetPath.strokeColor = new Color(0,0.3,0.7);
    targetPath.strokeWidth = pathWidth;
    targetPath.lineTo(a);
    targetPath.moveTo(a);
    targetPath.lineTo(b);
    targetPath.moveTo(b);
    return targetPath;
}

function createXPath(x, pathWidth=1) {
    let xPath = new Path();
    xPath.strokeColor = new Color(0.1,0.1,0.1);
    xPath.strokeWidth = pathWidth;
    xPath.lineTo(x, 0);
    xPath.moveTo(x, 0);
    xPath.lineTo(x, 10000);
    xPath.moveTo(x, 10000);
    return xPath;
}

function getRun(pathColor='red', pathWidth=1) {
    function drawCompute(stepList, stateRef, then, stepIndex=0) {
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
            let step = stepList[stepIndex];

            // Finish by calling then with the final result
            if (stepIndex == stepList.length) {
                stateRef.state.justFinished = true;
                then();
                return;
            }

            if (stateRef.state.xPath) stateRef.state.xPath.remove();
            if (step.currentPoint != null) {
                stateRef.state.xPath = createXPath(step.currentPoint.x, pathWidth);
            }

            if (stateRef.state.currentPoint) stateRef.state.currentPoint.remove();
            stateRef.state.currentPoint = drawPoint(step.currentPoint, new Color(0,0,1), 4);

            // Create new path object
            if (stateRef.state.path) stateRef.state.path.remove();
            stateRef.state.path = new Path();
            stateRef.state.path.strokeColor = pathColor;
            stateRef.state.path.strokeWidth = pathWidth;

            var lastPt = null;
            // draw the path between points
            step.inProgress.forEach(pt => {
                stateRef.state.path.lineTo(pt);
                stateRef.state.path.moveTo(pt);
                lastPt = pt;
            });

            if (stateRef.state.targetPath) stateRef.state.targetPath.remove();
            if (step.targetPoint != null) {
                stateRef.state.targetPath = createTargetPath(lastPt, step.targetPoint, pathWidth);
            }

            // Update the state description
            stateRef.state.highLevelStateDesc.textContent = step.highLevelState;
            iter(stateRef.state.algoStateList.children, (c,i) => {
                if (i == step.highLevelStateIndex) {
                    bold(c);
                    if (c.childElementCount > 0) {
                        iter(c.children[0].children, (cc,j) =>
                            (j == step.lowLevelStateIndex) ? bold(cc) : unbold(cc)
                        );
                    }
                } else {
                    unbold(c);
                    if (c.childElementCount > 0) {
                        iter(c.children[0].children, unbold);
                    }
                }
            });

            setTimeout(() => // take the next step
                drawCompute(stepList, stateRef, then, stepIndex+1),
                stateRef.state.steptime
            );
        }
        doStep();
    }
    // Start
    return (stepList, stateRef, then=r=>{}) => drawCompute(stepList, stateRef, then);
}