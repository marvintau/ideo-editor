
import Vec from "./Vec.js"

Array.prototype.sum = function(){
    if (this.length == 0)
        return 0;
    else
        return this.reduce((s, e) => s+e);
}

Array.prototype.mean = function(){
    return this.sum() / this.length;
}

Array.prototype.min = function(){
    return Math.min.apply(null, this);
}

Array.prototype.max = function(){
    return Math.max.apply(null, this);
}

Array.prototype.last = function(){
    return this[this.length - 1];
}

/**
 * intersection of two line segments
 * https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection#Given_two_points_on_each_line
 * @param {Vec} p1 start of a
 * @param {Vec} p2 end of a
 * @param {Vec} p3 start of b
 * @param {Vec} p4 end of b
 */
function lineLineIntersect(p1, p2, p3, p4){
    var det_s =  p1.sub(p3).cross(p3.sub(p4)),
        det_t = -p1.sub(p2).cross(p1.sub(p3)),
        det   =  p1.sub(p2).cross(p3.sub(p4));

    var s = det_s/det,
        t = det_t/det;

    return {p: p1.add(p2.sub(p1).mult(s)), s:s, t:t};
}

function findIntersections(pointListOrignal){

    // deep copy the pointList array
    var pointList = pointListOrignal.map(e => e.slice(0).map(v => {
        let n = v.copy();
        if (v.intersect) n.intersect = v.intersect;
        return n;
    }));

    for ( let s = 0; s < pointList.length; s++)
        for (let t = 0; t < s; t ++){
            for (let i = 0; i < pointList[s].length-1; i++)
            for (let j = 0; j < pointList[t].length-1; j++){
                var intersect   = lineLineIntersect(pointList[s][i], pointList[s][i+1], pointList[t][j], pointList[t][j+1]),
                    p           = intersect.p,
                    q           = intersect.p.copy();
                p.intersect = true;
                q.intersect = true;

                var s_norm = intersect.s >= -0.001 && intersect.s <= 1.001,
                    t_norm = intersect.t >= -0.001 && intersect.t <= 1.001;
                   
                if(s_norm && t_norm){
                    pointList[s].splice(i+++1, 0, p);
                    pointList[t].splice(j+++1, 0, q);
                }
            }
        }

    for (let s = 0; s < pointList.length; s++){
        var segs = [[]];
        for (let i = 0; i < pointList[s].length; i++){
            segs[segs.length-1].push(pointList[s][i]);
            if(pointList[s][i].intersect){
                let p = pointList[s][i].copy();
                p.intersect = true;
                segs.push([p]);
            }
                
        }
        pointList[s] = segs;
    }

    return pointList;
}

function cross (o, a, b){
    return a.sub(o).cross(b.sub(o));
}

function check(prev, curr){
    return cross(prev[prev.length - 2], prev[prev.length - 1], curr);
}

function convexHull(points) {
    points.sort(function(a, b) {
       return a.x == b.x ? a.y - b.y : a.x - b.x;
    });
 
    var lower = [];
    for (var i = 0; i < points.length; i++) {
        while(lower.length >= 2 && check(lower, points[i]) <= 0) lower.pop();
        lower.push(points[i]);
    }
 
    var upper = [];
    for (var i = points.length - 1; i >= 0; i--) {
        while(upper.length >= 2 && check(upper, points[i]) <= 0) upper.pop();
        upper.push(points[i]);
    }
 
    upper.pop();
    lower.pop();
    return lower.concat(upper);
 }

function getCentroid(pointList){
    var centroid  = new Vec(),
        totalMass = 0;
    
    for (let i = 0; i < pointList.length; i++){
        var center = pointList[(i+1)%pointList.length].add(pointList[i]).mult(0.5),
            mass   = pointList[(i+1)%pointList.length].sub(pointList[i]).mag();
        centroid = centroid.add(center.mult(mass));
        totalMass += mass;
    }

    return centroid.mult(1/totalMass);
}

export function getBounds(pointListOriginal){

    let pointList = findIntersections(pointListOriginal);

    var interior = [],
        median   = [],
        outlier  = [];

    for (let i = 0; i < pointList.length; i++)
    for (let j = 0; j < pointList[i].length; j++){
        let l  = pointList[i][j];
        if(l[0].intersect && l[l.length - 1].intersect) interior = interior.concat(l);
        outlier = outlier.concat(l);
    }

    var interiorConvexHull = convexHull(interior),
        outlierConvexHull  = convexHull(outlier);
    
    var interiorCentroid = getCentroid(interiorConvexHull),
        outlierCentroid  = getCentroid(outlierConvexHull);

    var interiorRadii = interiorConvexHull.map(e=>e.sub(interiorCentroid).mag()),
        outlierRadii  = outlierConvexHull.map(e=>e.sub(outlierCentroid).mag());

    var interiorRadius = interiorRadii.mean(),
        outlierRadius  = outlierRadii.mean();
    
    var interiorExtrema = interiorRadii.max() - interiorRadii.min(),
        outlierExtrema  = outlierRadii.max() - outlierRadii.min();

    for (let i = 0; i < pointList.length; i++)
    for (let j = 0; j < pointList[i].length; j++){
        let l = pointList[i][j], ls = [];
        if(l[0].intersect && l[l.length - 1].intersect)
            median = median.concat(l);
        else{
            if (l[l.length-1].intersect) l.reverse();
            for (let k = 0; k < l.length-1; k++) ls = ls.concat(l[k].sampleStepTo(l[k+1], 0.1));
            median.push(ls[Math.floor(ls.length*0.618)]);
        }
    }
    
    var medianConvexHull   = convexHull(median),
        medianCentroid   = getCentroid(medianConvexHull),
        medianRadii   = medianConvexHull.map(e=>e.sub(medianCentroid).mag()),
        medianRadius   = medianRadii.mean(),
        medianExtrema   = medianRadii.max() - medianRadii.min();

    return {
        interior : {
            convexHull : interiorConvexHull,
            centroid: interiorCentroid,
            radius :interiorRadius,
            extrema : interiorExtrema
        },
        median   : {
            convexHull : medianConvexHull, 
            centroid: medianCentroid,
            radius : medianRadius,
            extrema : medianExtrema
        },
        outlier  : {
            convexHull : outlierConvexHull,
            centroid: outlierCentroid,
            radius : outlierRadius,
            extrema : outlierExtrema
        }
    };
}
