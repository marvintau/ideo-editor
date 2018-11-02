import Vec from "./Vec.js";
import CurveStructureBase from "./CurveStructureBase.js";
import Stroke from "./Stroke.js";

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

function findIntersections(pointList){

    for ( let s = 0; s < pointList.length; s++)
        for (let t = 0; t < s; t ++){
            for (let i = 0; i < pointList[s].length-1; i++)
            for (let j = 0; j < pointList[t].length-1; j++){
                var intersect   = lineLineIntersect(pointList[s][i], pointList[s][i+1], pointList[t][j], pointList[t][j+1]),
                    p           = intersect.p,
                    q           = intersect.p.copy();
                p.intersect = true;
                q.intersect = true;

                var s_norm = intersect.s >= -0.01 && intersect.s <= 1.01,
                    t_norm = intersect.t >= -0.01 && intersect.t <= 1.01;
                   
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

function getConvexHullCentroid(pointList){
    var centroid  = new Vec(),
        totalMass = 0
    
    for (let i = 0; i < pointList.length; i++){
        var center = pointList[(i+1)%pointList.length].add(pointList[i]).mult(0.5),
            mass   = pointList[(i+1)%pointList.length].sub(pointList[i]).mag();
        centroid = centroid.add(center.mult(mass));
        totalMass += mass;
    }

    return centroid.mult(1/totalMass);
}

function getBounds(pointList){

    var interior = [],
        median   = [],
        outlier  = [];

    for (let i = 0; i < pointList.length; i++)
    for (let j = 0; j < pointList[i].length; j++){
        let l  = pointList[i][j],
            ls = [];
        if(l[0].intersect && l[l.length - 1].intersect){
            interior = interior.concat(l);
            median = median.concat(l);
        } else {
            if (l[l.length-1].intersect) l.reverse();
            for (let k = 0; k < l.length-1; k++) ls = ls.concat(l[k].sampleStepTo(l[k+1], 0.1));
            median.push(ls[Math.floor(ls.length*0.618)]);
        }
        outlier = outlier.concat(l);
    }

    var interiorConvexHull = convexHull(interior),
        medianConvexHull   = convexHull(median),
        outlierConvexHull  = convexHull(outlier);
    
    var interiorConvexHullCentroid = getConvexHullCentroid(interiorConvexHull),
        medianConvexHullCentroid   = getConvexHullCentroid(medianConvexHull),
        outlierConvexHullCentroid  = getConvexHullCentroid(outlierConvexHull);

    return {
        interior : {convexHull : interiorConvexHull, centroid: interiorConvexHullCentroid},
        median   : {convexHull : medianConvexHull,   centroid: medianConvexHullCentroid},
        outlier  : {convexHull : outlierConvexHull,  centroid: outlierConvexHullCentroid}
    };
}

/**
 * Radical is such a structure that, it contains several strokes, including
 * their intersecting information, but not aligning. like 戈, 匕. 
 * 
 */
export default class Radical extends CurveStructureBase{
    
    constructor(spec) {
        super(Stroke, spec);
        this.modify();
        this.toPointList();
    }

    cross(spec){

        var pointDest = this.body[spec.dest.ith].at(spec.dest),
            pointSelf = this.body[spec.self.ith].at(spec.self);

        this.body[spec.self.ith].trans(pointDest.sub(pointSelf));
    }

    // Stroke set contains strokes that starting from different
    // position, thus the updating is actually adding the offset
    // to components respectively, instead of conjuncting curves
    // together.

    update(){        
        // first deal with the first component. 
        if(this.body.length > 0){
            this.body[0].update();
            this.box  = this.body[0].box;
        }
        if(this.body.length > 1){
            for(let i = 1; i < this.body.length; i++){
                this.body[i].update();
                this.box = this.box.union(this.body[i].box);
            }    
        }
    }


    toPointList(){
            
        let ratio = 30;
        for(let comp of this.body) comp.head = comp.head.mult(ratio);

        this.scale(ratio);
        this.update();

        this.points = [];
        for(let component of this.body)
            this.points = this.points.concat(component.toPointList());

        this.points = findIntersections(this.points);
        this.bounds = getBounds(this.points);

        for (let i = 0; i < this.points.length; i++)
        for (let j = 0; j < this.points[i].length; j++)
        for (let k = 0; k < this.points[i][j].length; k++){
            this.points[i][j][k].isub(this.bounds.median.centroid);        
        }

        this.bounds = getBounds(this.points);
    }
}
