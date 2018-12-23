const highLevelStates = {
    sorting: 0,
    lowerHull: 1,
    upperHull: 2,
};
const lowLevelStates = {
    checkAngle: 0,
    pop: 1,
    push: 2,
};

const algorithmStateText = [
    "Sort the points data structure by x value then y value",
    "Compute the lower hull of the convex hull",
    "Compute the upper hull of the convex hull"
];

// compute the convex hull via the upper and lower hulls
function graham_scan(points) {
    let stateList = [];
    let state = {};
    state.current = {
        highLevelState: highLevelStates.sorting,
        lowLevelState: lowLevelStates.checkAngle,
        inProgress: [],
        targetPoint: null,
    };
    let recordState = () => stateList.push(
        {...state.current, inProgress: [...state.current.inProgress]}
    );
    recordState();

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
    for (var i = 0; i < points.length; i++){
        // show sorted points
        state.current.currentPoint = points[i];
        recordState();
    }

    // compute the lower hull ("upper" in this visualization since higher y-values are "lower")
    let upper = [points[0], points[1]]
    state.current.highLevelState = highLevelStates.lowerHull;
    state.current.inProgress = upper;
    state.current.targetPoint = upper.length > 2 ? upper[2] : null;
    state.current.currentPoint = upper[upper.length - 1];

    for (var i = 2; i < points.length; i++) {
        var p = points[i];
        state.current.currentPoint = p;
        while (upper.length >= 2 &&
            cross_product(p, upper[upper.length-1], upper[upper.length-2]) >= 0
        ) {
            state.current.targetPoint = p;
            state.current.lowLevelState = lowLevelStates.checkAngle;
            recordState();
            state.current.targetPoint = null;
            state.current.lowLevelState = lowLevelStates.pop;
            upper.pop()
            state.current.inProgress = upper;
            recordState();
        }
        state.current.targetPoint = p;
        state.current.lowLevelState = lowLevelStates.checkAngle;
        recordState();
        upper.push(p)
        state.current.inProgress = upper;
        state.current.targetPoint = null;
        state.current.lowLevelState = lowLevelStates.push;
        recordState();
    }

    // compute the upper hull ("lower" in this visualization since higher y-values are "lower")
    let lower = [points[points.length-1], points[points.length-2]]
    state.current.highLevelState = highLevelStates.upperHull;

    for (var i = points.length - 2; i >= 0; i--) {
        var p = points[i];
        state.current.currentPoint = p;
        while (lower.length >= 2 &&
            cross_product(p, lower[lower.length-1], lower[lower.length-2]) >= 0
        ) {
            state.current.targetPoint = p;
            state.current.lowLevelState = lowLevelStates.checkAngle;
            recordState();
            state.current.targetPoint = null;
            state.current.lowLevelState = lowLevelStates.pop;
            lower.pop()
            state.current.inProgress = upper.concat(lower);
            recordState();
        }
        state.current.targetPoint = p;
        state.current.lowLevelState = lowLevelStates.checkAngle;
        recordState();
        lower.push(p)
        state.current.inProgress = upper.concat(lower);
        state.current.targetPoint = null;
        state.current.lowLevelState = lowLevelStates.push;
        recordState();
    }

    // upper and lower should share endpoints
    upper.pop()
    lower.pop()

    // merge and return the hull results
    // return upper.concat(lower);
    return stateList;
}