function scaleExamplePoint(pt){
    var scaleFactor = 16, xOffset = 0, yOffset=8*scaleFactor;
    return new Point(scaleFactor*pt[0]+xOffset, -scaleFactor*pt[1]+yOffset);
}

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
    var ptCircle = new Path.Circle(point, pointSize);
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

function getDrawStep(stateRef, pathColor='red', pathWidth=1) {
    function drawStep(value, index) {

        if (stateRef.state.xPath) stateRef.state.xPath.remove();
        if (value.currentPoint != null) {
            stateRef.state.xPath = createXPath(value.currentPoint.x, pathWidth);
        }

        if (stateRef.state.currentPoint) stateRef.state.currentPoint.remove();
        stateRef.state.currentPoint = drawPoint(value.currentPoint, new Color(0,0,1), 4);

        // Create new path object
        if (stateRef.state.path) stateRef.state.path.remove();
        stateRef.state.path = makePath(pathColor, pathWidth);

        // draw the path between points
        value.inProgress.forEach(pt => movePathToPoint(stateRef.state.path, pt));
        var lastPt = value.inProgress.length ? value.inProgress[value.inProgress.length-1] : null;

        if (stateRef.state.targetPath) stateRef.state.targetPath.remove();
        if (value.targetPoint != null) {
            stateRef.state.targetPath = createTargetPath(lastPt, value.targetPoint, pathWidth);
        }

        // Update the state description
        stateRef.state.highLevelStateDesc.textContent = algorithmStateText[value.highLevelState];
        iter(stateRef.state.algoStateList.children, (c,i) => {
            if (i == value.highLevelStateIndex) {
                bold(c);
                if (c.childElementCount > 0) {
                    iter(c.children[0].children, (cc,j) =>
                        (j == value.lowLevelStateIndex) ? bold(cc) : unbold(cc)
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
    return drawStep;
}