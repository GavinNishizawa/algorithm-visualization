paper.install(window);

window.onload = () => {
    paper.setup('algo-visual');

    // Draw the convex hull example points
    drawPoints(convexHullExamplePoints, "blue", 2);

    let drawPath = getDrawPath("red", 2);

    let playConvexHullButton = document.getElementById("playConvexHull");
    let timeIntervalInput = document.getElementById("playInterval");

    let playConvexHull = () => {
        playConvexHullButton.disabled = true;
        timeIntervalInput.disabled = true;

        // Get the convex hull step generator
        var hullStep = graham_scan(convexHullExamplePoints);
        // Run the algorithm visualization
        drawPath(hullStep, timeIntervalInput.value, result => {
            console.log(result);
            playConvexHullButton.disabled = false;
            timeIntervalInput.disabled = false;
        });
    };

    // Set up play button for convex hull
    playConvexHullButton.onclick = playConvexHull;
}