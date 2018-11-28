import CurveStructureBase from "./CurveStructureBase.js";
import { getCore } from "./Core.js";
import Stroke from "./Stroke.js";
import Vec from "./Vec.js";

export default class Radical extends CurveStructureBase{
    
    constructor(spec) {
        super(spec);
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

    iteratePoint(func){

        for (var stroke = 0; stroke < this.body.length; stroke++){
            var currStroke = this.body[stroke];
            for (var curve = 0; curve < currStroke.body.length; curve++){
                var currCurve = currStroke.body[curve];
                for (var seg = 0; seg < currCurve.body.length; seg++){
                    var currSeg = currCurve.body[seg];
                    func(currSeg);
                }
            }
        }
    }

    draw(ctx, strokeWidth, scale){

        ctx.lineWidth = strokeWidth;
        ctx.lineCap = "square";
        ctx.lineJoin = "miter";
        ctx.miterLimit = 3;
        ctx.strokeStyle = "black";

        for (let component of this.body)
            component.draw(ctx, strokeWidth, scale);

        this.iteratePoint(function(currSeg){
            ctx.lineWidth = 1;
            ctx.strokeStyle = "red";
            if (currSeg.head.attr.intersection)
                ctx.circle(currSeg.head, 6, scale);
            ctx.lineWidth = 1;
            ctx.strokeStyle = "yellow";
            if (currSeg.head.attr.joint)
                ctx.circle(currSeg.head, 4, scale);    
        });
    
    }
}