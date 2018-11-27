
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
        t = det_t/det,
        p = p1.add(p2.sub(p1).mult(s)),
        q = p1.add(p2.sub(p1).mult(s));

    p.setAttr({intersect : true});
    q.setAttr({intersect : true});
    
    return {p: p, q: q, s:s, t:t};
}

function linesIntersect(list, s, t, i, j){
    return lineLineIntersect(list[s][i], list[s][i+1], list[t][j], list[t][j+1]);
}

function insertIntersection(pointList){

    for ( let s = 0; s < pointList.length; s++)
    for (let t = 0; t < s; t ++){
        for (let i = 0; i < pointList[s].length-1; i++)
        for (let j = 0; j < pointList[t].length-1; j++){
            var lliRes   = linesIntersect(pointList, s, t, i, j);

            var s_norm = lliRes.s > 0 && lliRes.s < 1,
                t_norm = lliRes.t > 0 && lliRes.t < 1;
               
            if(s_norm && t_norm){
                pointList[s].splice(i+++1, 0, lliRes.p);
                pointList[t].splice(j+++1, 0, lliRes.q);
            }
        }
    }

    return pointList;
}

function splitByIntersection(pointList){

    for (let s = 0; s < pointList.length; s++){
        var segs = [[]];
        for (let i = 0; i < pointList[s].length; i++){
            segs.last().push(pointList[s][i]);
            if(pointList[s][i].attr.intersect) segs.push([pointList[s][i].copy()]);
        }
        pointList[s] = segs;
    }
    return pointList;
}

function findIntersections(pointListOrignal){

    // deep copy the pointList array
    var pointList = pointListOrignal.map(e => e.slice(0).map(v => v.copy()));

    var intersectedPointList = insertIntersection(pointList),
        splittedPointList    = splitByIntersection(intersectedPointList);
    
    return splittedPointList;
}

function cross (o, a, b){
    return a.sub(o).cross(b.sub(o));
}

function check(prev, curr){
    return cross(prev[prev.length - 2], prev[prev.length - 1], curr);
}

export function convexHull(points) {
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

export function polygonArea(pointList){
    
    // 复制一个Array并且把第一个点追加至末尾使之成为闭合多边形
    var pointListCopy = pointList.slice(0).concat(pointList[0]);

    var area = 0;
    for (let i = 0; i < pointListCopy.length-1; i++)
        area += pointListCopy[i].cross(pointListCopy[i+1])/2;

    return Math.abs(area);
}

export function getCore(pointListOriginal){

    let pointList = findIntersections(pointListOriginal);

    var core = [],
        circum = [],
        outliers = [];

    for (let i = 0; i < pointList.length; i++)
    for (let j = 0; j < pointList[i].length; j++){
        let l = pointList[i][j];
        if(l[0].attr.intersect && l.last().attr.intersect) core = core.concat(l);
        circum = circum.concat(l);
    }
    
    let convex = convexHull(circum),
        area = polygonArea(convex),
        radius = Math.sqrt(2 * area / Math.PI);

    let rs = []
    for (let i = 0; i < pointList.length; i++)
    for (let j = 0; j < pointList[i].length; j++){
        let l = pointList[i][j];
        // let l = pointList[i][j], ls = [];
        if (!(l[0].attr.intersect && l.last().attr.intersect)) {
        //     if (l.last().intersect) l.reverse();
        //     for (let k = 0; k < l.length-1; k++) ls = ls.concat(l[k].sampleStepTo(l[k+1], 0.1));
        //     core.push(ls[Math.floor(ls.length*0.618)]);
        //     // outliers.push(ls.slice())
            var lin = 0;
            for (let k = 0; k < l.length-1; k++) lin += l[k].sub(l[k+1]).mag();
            rs.push(lin);
        }
    }
    // console.log(rs);
    
    return {
        convex: convex,
        area : area
    };
}
