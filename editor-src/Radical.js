import CurveStructureBase from "./CurveStructureBase.js";
import Stroke from "./Stroke.js";
import Curve from "./Curve.js";

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

    core(spec){

        let points = spec.map(s => this.body[s.ith].insertAt(s, {corebound: true}));
        this.corebound = new Curve(points);
        this.corebound.convexHull();

        points = this.body
            .map(stroke => stroke.flatten())
            .map(stroke => {
                let isCore = e=>e.attr.corebound,
                    firstJoint = stroke.findIndex(isCore),
                    strokeRev = stroke.reverse(),
                    strokeLen = stroke.length,
                    lastJoint  = (strokeLen-1) - strokeRev.findIndex(isCore);
                
                // reverse applies to original array, thus need to be recovered
                // before further calculation.
                stroke.reverse();

                let res = [
                    stroke.slice(0, firstJoint+1),
                    stroke.slice(firstJoint, lastJoint+1),
                    stroke.slice(lastJoint)
                ];

                return res;
            });

        let outlierPoints = [].concat(...points.map(stroke=>[stroke[0], stroke[2].reverse()]))
                            // .map(points => points.filter(point => this.corebound.includes(point)))
                            .map(outlier => new Curve(outlier.reverse()))
                            .filter(outCurve => outCurve.length() > 0.01);

        this.outliers = {l:[], r:[], t:[], b:[]};
        for (let outlierCurve of outlierPoints){
            if (outlierCurve.body.length >= 2){
                let p1 = outlierCurve.body[0],
                    p2 = outlierCurve.body[1],
                    angle = p2.sub(p1).angle();
                if (45 > angle && angle >= -45)   this.outliers.r.push(outlierCurve);
                if (135 > angle && angle >= 45)   this.outliers.b.push(outlierCurve);
                if (angle >= 135 || angle < -135) this.outliers.l.push(outlierCurve);
                if (-45 > angle && angle >= -135)  this.outliers.t.push(outlierCurve);
            }
        }

        this.massCenter = this.corebound.massCenter();

        this.outline = new Curve(this.flatten());
        this.outline.convexHull();
        this.geomCenter = this.outline.massCenter();

    }

    draw(ctx, strokeWidth, scale){

        ctx.lineWidth = strokeWidth;
        ctx.lineCap = "square";
        ctx.lineJoin = "miter";
        ctx.miterLimit = 3;
        ctx.strokeStyle = "black";

        for (let component of this.body)
            component.draw(ctx, strokeWidth, scale);

        if(this.outline){
            ctx.lineWidth = 1;
            ctx.strokeStyle = "black";
            ctx.moveToVec(this.outline.body[0], scale);
            for (let p of this.outline.body){
                ctx.lineToVec(p, scale);
            }
            ctx.closePath();
            ctx.stroke();
        }

        if(this.outliers){
            let color = {
                r : ["red", "右"],
                l : ["green", "左"],
                t : ["blue", "上"],
                b : ["yellow", "下"]
            };
            for (let t in this.outliers){
                ctx.strokeStyle = "black";
                ctx.fillStyle = "white";
                ctx.font = "bold 20px Helvetica";
                for (let curve of this.outliers[t]){
                    ctx.circle(curve.body[0].mult(scale), 5, true);
                    for (let point of curve.body){
                        ctx.fillText(color[t][1],   point.x * scale - 10, point.y * scale + 10);
                        ctx.strokeText(color[t][1], point.x * scale - 10, point.y * scale + 10);
                    }
                }
                
            }
        }
        
        if(this.corebound){
            ctx.fillStyle = "rgb(128, 64, 0, 0.5)";
            ctx.beginPath();
            ctx.moveToVec(this.corebound.body[0], scale);
            for (let point of this.corebound.body)
                ctx.lineToVec(point, scale);
            ctx.fill();    
        }

        if (this.massCenter){
            ctx.strokeStyle = "black";
            ctx.fillStyle = "black";
            let boxCenter = this.box.center();
            ctx.circle(this.massCenter.mult(scale), 5, true);
            ctx.circle(boxCenter.mult(scale), 5, true);
            console.log(boxCenter, this.massCenter);
        }

    }
}
