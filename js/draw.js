function setPathStyle(path, color, width) {
    path.strokeColor = color;
    path.strokeWidth = width;
}

function makePath(color, width) {
    let path = new Path();
    setPathStyle(path, color, width);
    return path;
}

function drawPoint(point, pointColor='blue', pointSize=1) {
    let ptCircle = new Path.Circle(point, pointSize);
    ptCircle.strokeColor = pointColor;
    ptCircle.fillColor = pointColor;
    return ptCircle;
}

function movePath(path, x, y) {
    path.lineTo(x, y);
    path.moveTo(x, y);
}

function movePathToPoint(path, pt) {
    movePath(path, pt.x, pt.y);
}

function drawPoints(points, pointColor, pointSize) {
    points.forEach(pt => drawPoint(pt, pointColor, pointSize))
}

function createTargetPath(a, b, pathWidth=1) {
    let targetPath = makePath(new Color(0,0.3,0.7), pathWidth);
    movePathToPoint(targetPath, a);
    movePathToPoint(targetPath, b);
    return targetPath;
}

function createXPath(x, pathWidth=1) {
    let xPath = makePath(new Color(0.1,0.1,0.1), pathWidth);
    movePath(xPath, x, 0);
    movePath(xPath, x, 10000);
    return xPath;
}

function getDrawState(pathColor='red', pathWidth=1) {
    let drawState = {};
    function resetSet(name, value) {
        if (drawState[name]) drawState[name].remove();
        drawState[name] = value;
    }

    let updateXPath = currentPoint => resetSet("xPath",
        // Draw the current x coordinate line
        !currentPoint ? null : createXPath(currentPoint.x, pathWidth)
    );

    let updateCurrentPoint = currentPoint => resetSet("currentPoint",
        // Draw the current point
        drawPoint(currentPoint, new Color(0,0,1), 4)
    );

    function updatePath(inProgress, getPath) {
        // Create new path object
        resetSet("path", makePath(pathColor, pathWidth));
        // Draw the path between points
        inProgress.forEach(pt => movePathToPoint(getPath(), pt));
    }

    function updateTargetPath(inProgress, targetPoint) {
        // Draw the target point path
        let lastPt = inProgress.length ? inProgress[inProgress.length-1] : null;
        resetSet("targetPath",
            !targetPoint ? null : createTargetPath(lastPt, targetPoint, pathWidth)
        );
    }

    function drawStep(value, index) {
        updateXPath(value.currentPoint);
        updateCurrentPoint(value.currentPoint);
        updatePath(value.inProgress, () => drawState.path);
        updateTargetPath(value.inProgress, value.targetPoint);
    }
    return drawStep;
}
function getDrawStep(ref, pathColor='red', pathWidth=1) {
}