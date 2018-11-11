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
]

// compute the convex hull via the upper and lower hulls
function* graham_scan(points) {

    function sub(p,q){
        return [q[0]-p[0],q[1]-p[1]]
    }

    function cross_product(p,q,r){
        var pq = sub(p,q)
        var qr = sub(q,r)
        return pq[0]*qr[1] - pq[1]*qr[0]
    }

    // sort points by x-value (then y)
    points.sort(function(pt1, pt2) {
        // TODO: find better way to sort by x then y
        if ((pt1[0] < pt2[0]) ||
            (pt1[0] == pt2[0] && pt1[1] < pt2[1])) {
            return -1;
        } else if (pt1[0] == pt2[0] && pt1[1] == pt2[1]) {
            return 0;
        } else {
            return 1;
        }
    })

    // compute the upper hull
    let upper = [points[points.length-1], points[points.length-2]]

    for (var i = points.length - 2; i >= 0; i--) {
        var p = points[i]
        while (upper.length >= 2 &&
            cross_product(p, upper[upper.length-1], upper[upper.length-2]) >= 0
            ) {
                upper.pop()
                yield upper;
        }
        upper.push(p)
        yield upper;
    }

    // compute the lower hull
    let lower = [points[0], points[1]]

    for (var i = 2; i < points.length; i++) {
        var p = points[i]
        while (lower.length >= 2 &&
            cross_product(p, lower[lower.length-1], lower[lower.length-2]) >= 0
            ) {
                lower.pop()
                yield upper.concat(lower);
            }
        lower.push(p)
        yield upper.concat(lower);
    }

    // upper and lower should share endpoints
    lower.pop()

    // merge and return the hull results
	return upper.concat(lower);
}