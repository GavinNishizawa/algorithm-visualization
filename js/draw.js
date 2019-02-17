const Draw = (() => {
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
        let targetPath = makePath(new Color(0, 0.3, 0.7), pathWidth);
        movePathToPoint(targetPath, a);
        movePathToPoint(targetPath, b);
        return targetPath;
    }

    function createXPath(x, pathWidth=1) {
        let xPath = makePath(new Color(0.1, 0.1, 0.1), pathWidth);
        movePath(xPath, x, 0);
        movePath(xPath, x, 10000);
        return xPath;
    }

    function createAngleArc(a, b, c, pathWidth=1, isGreen=false) {
        let arcPath = new Path.Arc(a, b, c)
        let color = isGreen ? new Color(0, 0.7, 0.3) : new Color(0, 0, 0);
        setPathStyle(arcPath, color, pathWidth);
        return arcPath;
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

        function updateAngleArc(inProgress, targetPoint) {
            // Draw the angle arc
            let lastPt = inProgress.length ? inProgress[inProgress.length-1] : null;
            let prevPt = (inProgress.length > 1) ? inProgress[inProgress.length-2] : null;
            let valid = targetPoint && prevPt && lastPt

            const getMid = (...pts) => new Point(
                sum(pts.map(p => p.x))/pts.length,
                sum(pts.map(p => p.y))/pts.length);

            const distance = (a, b) => Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));

            const getPointAlong = (a, b, l=0.5) => new Point(
                (1 - l) * a.x + l * b.x,
                (1 - l) * a.y + l * b.y);

            if (!valid) {
                resetSet("angleArc", null);
                return
            }

            // Compute lengths to determine which midpoint to use
            let distPL = distance(prevPt, lastPt);
            let distLT = distance(lastPt, targetPoint);
            let shorterPL = (distPL <= distLT);

            // Compute anchor position along each line
            let ratioPL = (!shorterPL && distPL) ? 0.5 * (distLT / distPL) : 0.5;
            let ratioLT = (shorterPL && distLT) ? 0.5 * (distPL / distLT) : 0.5;

            // Compute left and right anchor points
            let lpMid = getPointAlong(lastPt, prevPt, ratioPL);
            let ltMid = getPointAlong(lastPt, targetPoint, ratioLT);

            const sub = (p, q) => [q.x-p.x, q.y-p.y];

            const cross_product = (p, q, r) => {
                const pq = sub(p, q);
                const qr = sub(q, r);
                return pq[0] * qr[1] - pq[1] * qr[0];
            }

            // Compute center anchor point
            let lpltMid = getMid(lpMid, ltMid);
            let centerDist = distance(lastPt, lpltMid);
            let avgDist = (ratioPL * distPL + ratioLT * distLT) / 2;
            let ratioMid = centerDist ? avgDist / centerDist : 0.5
            let angleReflect = (cross_product(prevPt, lastPt, targetPoint) >= 0) ? 1 : -1;
            let mid = getPointAlong(lastPt, lpltMid, angleReflect * ratioMid);

            // Draw the arc through the anchor points
            resetSet("angleArc", createAngleArc(lpMid, mid, ltMid, pathWidth, angleReflect === 1));
        }

        function drawStep(value, index) {
            updateXPath(value.currentPoint);
            updateCurrentPoint(value.currentPoint);
            updatePath(value.inProgress, () => drawState.path);
            updateTargetPath(value.inProgress, value.targetPoint);
            updateAngleArc(value.inProgress, value.targetPoint);
        }
        return drawStep;
    }
    return {
        drawPoint,
        getDrawState,
    };
})();