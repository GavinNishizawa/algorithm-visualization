const Graham = (() => {
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

    function sub(p, q){
        return [q.x-p.x, q.y-p.y]
    }

    function cross_product(p,q,r){
        const pq = sub(p, q);
        const qr = sub(q, r);
        return pq[0]*qr[1] - pq[1]*qr[0];
    }

    function checkAngle(p, stack) {
    // Return true iff the angle between p and the last 2 points is < 180
        const getLast = (list, i) => list[list.length - i];
        return cross_product(p, getLast(stack, 1), getLast(stack, 2)) >= 0;
    }

    function scan(points) {
    // Compute the convex hull via the upper and lower hulls
        const stateList = [];
        const state = {};
        state.current = {
            highLevelState: highLevelStates.sorting,
            lowLevelState: lowLevelStates.checkAngle,
            inProgress: [],
            targetPoint: null,
        };
        const copyState = s => ({...s, inProgress: [...s.inProgress]});
        const recordState = () => stateList.push(copyState(state.current));

        recordState(); // Record initial state

        function isCheckAngleState(p) {
            state.current.targetPoint = p;
            state.current.lowLevelState = lowLevelStates.checkAngle;
            recordState();
        }

        function updateInProgress(inProgress) {
            state.current.targetPoint = null;
            state.current.inProgress = inProgress;
            recordState();
        }

        function isPushState(inProgress) {
            state.current.lowLevelState = lowLevelStates.push;
            updateInProgress(inProgress);
        }

        function isPopState(inProgress) {
            state.current.lowLevelState = lowLevelStates.pop;
            updateInProgress(inProgress);
        }

        points.sort((pt1, pt2) => {
        // Sort points by x-value (then y-value for equal x-values)
            const dx = pt1.x - pt2.x;
            const dy = pt1.y - pt2.y;
            return (dx < 0 || !dx && dy < 0) ? -1 : (!dx && !dy) ? 0 : 1;
        });

        for (let i = 0; i < points.length; i++){
            // Show sorted points
            state.current.currentPoint = points[i];
            recordState();
        }

        // Compute the lower hull ("upper" in this visualization since higher y-values are "lower")
        const upper = [points[0], points[1]];
        state.current.highLevelState = highLevelStates.lowerHull;
        state.current.inProgress = upper;
        state.current.targetPoint = upper.length > 2 ? upper[2] : null;
        state.current.currentPoint = upper[upper.length - 1];

        function processPoint(p, stack, getInProgress) {
        // Process a target point with the point stack
        // saves the inprogress hull with getInProgress()
            state.current.currentPoint = p;
            while (stack.length >= 2 && checkAngle(p, stack)) {
                // CHECK ANGLE state
                isCheckAngleState(p);

                // POP state
                stack.pop();
                isPopState(getInProgress());
            }
            // CHECK ANGLE state
            isCheckAngleState(p);

            // PUSH state
            stack.push(p);
            isPushState(getInProgress());
        }

        for (let i = 2; i < points.length; i++) {
            processPoint(points[i], upper, () => upper);
        }

        // Compute the upper hull ("lower" in this visualization since higher y-values are "lower")
        const lower = [points[points.length-1], points[points.length-2]]
        state.current.highLevelState = highLevelStates.upperHull;

        for (let i = points.length - 2; i >= 0; i--) {
            processPoint(points[i], lower, () => upper.concat(lower));
        }

        // Use to return the list of points on the hull
        // // Upper and lower should share endpoints
        // upper.pop();
        // lower.pop();
        // // Merge and return the hull results
        // return upper.concat(lower);

        // Return the list of states
        return stateList;
    }

    return {
        algorithmStateText,
        scan,
    };
})();