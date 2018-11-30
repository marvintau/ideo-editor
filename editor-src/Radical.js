import CurveStructureBase from "./CurveStructureBase.js";
import Stroke from "./Stroke.js";
import Vec from "./Vec.js";

function convexHull(points) {

    const cross = (o, a, b) => a.sub(o).cross(b.sub(o)),
          check = (prev, curr) => cross(prev[prev.length - 2], prev[prev.length - 1], curr);

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

function insidePolygon(p, points){
    
    const cross = (p, a, b) => a.sub(p).cross(b.sub(p)),
          first = cross(p, points[0], points[1]);
    
    for (let i = 1; i < points.length-1; i++)
        if (first * cross(p, points[i], points[i+1]) < 0)
            return false;
    
    return true;
}

export default class Radical extends CurveStructureBase{
    
    constructor(spec) {
        super(spec);
        this.type = "Radical";
        this.body = spec.body.map(comp => new Stroke(comp));

    }

    at(spec){
        this.body[spec.stroke].at(spec);
    }

    cross(spec){

        var pointDest = this.body[spec.dest.ith].at(spec.dest),
            pointSelf = this.body[spec.self.ith].at(spec.self);

        this.body[spec.self.ith].trans(pointDest.sub(pointSelf));
    }

    intersect(){
        for (let i = 0; i < this.body.length; i++)
        for (let j = 0; j < i; j++)
            Stroke.intersect(this.body[i], this.body[j]);
    }

    deintersect(){
        for (let stroke of this.body) stroke.deintersect();
    }

    postUpdate(){
        this.intersect();

        // convex hull method to get mass entroid
        let points = this.body
            .map(stroke => stroke.flatten())
            .map(stroke => {
                let isJoint = e=>e.attr.intersection || e.attr.joint,
                    firstJoint = stroke.findIndex(isJoint),
                    strokeRev = stroke.reverse(),
                    strokeLen = stroke.length,
                    lastJoint  = (strokeLen-1) - strokeRev.findIndex(isJoint);
                
                // reverse applies to original array, thus need to be recovered
                // before further calculation.
                stroke.reverse();

                let res = [
                    stroke.slice(0, firstJoint),
                    stroke.slice(firstJoint, lastJoint+1),
                    stroke.slice(lastJoint+1)
                ];

                // console.log(strokeLen, firstJoint, lastJoint, res.map(s=>s.map(isJoint)));
                return res;
            });
            
        this.outliers = [].concat(...points.map(stroke=>[stroke[0], stroke[2].reverse()]));

        this.innerCore = convexHull([].concat(...points.map(stroke=>stroke[1])));

        // for (let i = 0; i < this.outliers.length; i++){
        //     if (this.outliers[i].last())
        // }

        this.deintersect();
    }

    draw(ctx, strokeWidth, scale){

        ctx.lineWidth = strokeWidth;
        ctx.lineCap = "square";
        ctx.lineJoin = "miter";
        ctx.miterLimit = 3;
        ctx.strokeStyle = "black";

        for (let component of this.body)
            component.draw(ctx, strokeWidth, scale);

        let points = this.flatten();
        // console.log(this.body.map(s => s.flatten().map(e=>[e.x, e.y, e.attr.intersection])));
        for (let p of points){
            ctx.lineWidth = 2;
            ctx.strokeStyle = "red";
            if (p.attr.intersection) ctx.circle(p, 7, scale);
            
            ctx.lineWidth = 1;
            ctx.strokeStyle = "yellow";
            ctx.fillStyle = "yellow"
            if (p.attr.joint) ctx.circle(p, 4, scale, true);    
        };
    
        ctx.strokeStyle = "white";
        for (let outlier of this.outliers)
            for (let point of outlier)
                ctx.circle(point, 3, scale);
        
        ctx.fillStyle = "rgb(128, 64, 0, 0.5)";
        ctx.beginPath();
        ctx.moveToVec(this.innerCore[0], scale);
        for (let point of this.innerCore)
            ctx.lineToVec(point, scale);
        ctx.fill();

    }
}