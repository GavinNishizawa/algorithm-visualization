var convexHullExamplePoints = [
[10, 4],
[7, 3],
[8, 1],
[6, -1],
[9, -2],
[11, -1],
[12, 0],
[15, 1],
[14, 3],
[13, 3],
];

let algorithmStates = {
    sorting: "Sort the points data structure by x-coordinates then y-coordinates",
    lowerHull: "Compute the lower hull of the convex hull",
    upperHull: "Compute the upper hull of the convex hull"
};

// compute the convex hull via the upper and lower hulls
function* graham_scan(points) {
    let currentState = {
        highLevelState: algorithmStates.sorting,
        inProgress: [],
    };

    function sub(p,q){
        return [q.x-p.x,q.y-p.y]
    }

    function cross_product(p,q,r){
        var pq = sub(p,q)
        var qr = sub(q,r)
        return pq[0]*qr[1] - pq[1]*qr[0];
    }

    // sort points by x-value (then y)
    points.sort(function(pt1, pt2) {
        // TODO: find better way to sort by x then y
        if ((pt1.x < pt2.x) ||
            (pt1.x == pt2.x && pt1.y < pt2.y)) {
            return -1;
        } else if (pt1.x == pt2.x && pt1.y == pt2.y) {
            return 0;
        } else {
            return 1;
        }
    });
    yield currentState;

    // compute the lower hull
    let lower = [points[0], points[1]]
    currentState.highLevelState = algorithmStates.lowerHull;
    currentState.inProgress = lower;
    yield currentState;

    for (var i = 2; i < points.length; i++) {
        var p = points[i]
        while (lower.length >= 2 &&
            cross_product(p, lower[lower.length-1], lower[lower.length-2]) >= 0
            ) {
                lower.pop()
                currentState.inProgress = lower;
                yield currentState;
            }
        lower.push(p)
        currentState.inProgress = lower;
        yield currentState;
    }

    // compute the upper hull
    let upper = [points[points.length-1], points[points.length-2]]
    currentState.highLevelState = algorithmStates.upperHull;

    for (var i = points.length - 2; i >= 0; i--) {
        var p = points[i]
        while (upper.length >= 2 &&
            cross_product(p, upper[upper.length-1], upper[upper.length-2]) >= 0
            ) {
                upper.pop()
            currentState.inProgress = lower.concat(upper);
            yield currentState;
        }
        upper.push(p)
        currentState.inProgress = lower.concat(upper);
        yield currentState;
    }

    // upper and lower should share endpoints
    upper.pop()

    // merge and return the hull results
	return lower.concat(upper);
}