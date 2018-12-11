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

function getDrawPath(pathColor='red', pathWidth=1) {
    function drawCompute(stepFn, stateRef, then, initial=false) {
        // clear old path if starting over
        if (initial) {
            if (stateRef.state.path) stateRef.state.path.remove();
            if (stateRef.state.targetPath) stateRef.state.targetPath.remove();
            if (stateRef.state.xPath) stateRef.state.xPath.remove();
            if (stateRef.state.currentPoint) stateRef.state.currentPoint.remove();
        }

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

            if (stateRef.state.xPath) stateRef.state.xPath.remove();
            if (step.value.currentPoint != null) {
                stateRef.state.xPath = new Path();
                stateRef.state.xPath.strokeColor = new Color(0.1,0.1,0.1);
                stateRef.state.xPath.strokeWidth = pathWidth;
                stateRef.state.xPath.lineTo(step.value.currentPoint.x, 0);
                stateRef.state.xPath.moveTo(step.value.currentPoint.x, 0);
                stateRef.state.xPath.lineTo(step.value.currentPoint.x, 10000);
                stateRef.state.xPath.moveTo(step.value.currentPoint.x, 10000);
            }

            if (stateRef.state.currentPoint) stateRef.state.currentPoint.remove();
            stateRef.state.currentPoint = drawPoint(step.value.currentPoint, new Color(0,0,1), 4);

            // Create new path object
            if (stateRef.state.path) stateRef.state.path.remove();
            stateRef.state.path = new Path();
            stateRef.state.path.strokeColor = pathColor;
            stateRef.state.path.strokeWidth = pathWidth;

            var lastPt = null;
            // draw the path between points
            step.value.inProgress.forEach(pt => {
                stateRef.state.path.lineTo(pt);
                stateRef.state.path.moveTo(pt);
                lastPt = pt;
            });

            if (stateRef.state.targetPath) stateRef.state.targetPath.remove();
            if (step.value.targetPoint != null) {
                stateRef.state.targetPath = new Path();
                stateRef.state.targetPath.strokeColor = new Color(0,0.3,0.7);
                stateRef.state.targetPath.strokeWidth = pathWidth;
                stateRef.state.targetPath.lineTo(lastPt);
                stateRef.state.targetPath.moveTo(lastPt);
                stateRef.state.targetPath.lineTo(step.value.targetPoint);
                stateRef.state.targetPath.moveTo(step.value.targetPoint);
            }

            // Update the state description
            stateRef.state.highLevelStateDesc.textContent = step.value.highLevelState;
            for(var i = 0; i < stateRef.state.algoStateList.children.length; i++) {
                if (i == step.value.highLevelStateIndex) {
                    if (!stateRef.state.algoStateList.children[i].classList.contains("font-weight-bold")) {
                        stateRef.state.algoStateList.children[i].classList += "font-weight-bold";
                    }
                    if (stateRef.state.algoStateList.children[i].childElementCount > 0) {
                        for(var j = 0; j < stateRef.state.algoStateList.children[i].children[0].children.length; j++) {
                            if (j == step.value.lowLevelStateIndex) {
                                if (!stateRef.state.algoStateList.children[i].children[0].children[j].classList.contains("font-weight-bold")) {
                                    stateRef.state.algoStateList.children[i].children[0].children[j].classList += "font-weight-bold";
                                }
                            } else {
                                stateRef.state.algoStateList.children[i].children[0].children[j].classList.remove("font-weight-bold");
                            }
                        }
                    }
                } else {
                    stateRef.state.algoStateList.children[i].classList.remove("font-weight-bold");
                    if (stateRef.state.algoStateList.children[i].childElementCount > 0) {
                        for(var j = 0; j < stateRef.state.algoStateList.children[i].children[0].children.length; j++) {
                            stateRef.state.algoStateList.children[i].children[0].children[j].classList.remove("font-weight-bold");
                        }
                    }
                }
            }

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