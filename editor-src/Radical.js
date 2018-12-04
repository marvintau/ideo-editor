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

        this.outliers = [].concat(...points.map(stroke=>[stroke[0], stroke[2].reverse()]))
                        .map(outlier => new Curve(outlier));

        // for (let stroke of this.body){
        //     stroke.remove(e=>e.attr.corebound);
        // }

        this.massCenter = this.corebound.massCenter();

        console.log(this.outliers.map(e => e.body));
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

        let outline = new Curve(points);
        outline.convexHull();

        ctx.strokeStyle = "black";
        ctx.moveToVec(outline.body[0], scale);
        for (let p of outline.body){
            ctx.lineToVec(p, scale);
        }
        ctx.closePath();
        ctx.stroke();

        if(this.outliers){
            ctx.strokeStyle = "white";
            for (let outlier of this.outliers)
                for (let point of outlier.body)
                    ctx.circle(point, 3, scale);
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
            ctx.circle(this.massCenter.mult(scale), 25, true);
            ctx.circle(boxCenter.mult(scale), 25, true);
            console.log(boxCenter, this.massCenter);
        }

    }
}