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
    function drawCompute(stepFn, waittime, then, initial=false) {
        if (initial && path) path.remove();

        setTimeout(() => {
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

            // take the next step
            drawCompute(stepFn, waittime, then);
        }, waittime);
    }
    // Start
    return (stepFn, interval, then=r=>{}) => drawCompute(stepFn, interval, then, true);
}