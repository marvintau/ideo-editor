import CurveStructureBase from "./CurveStructureBase.js";
import Curve from "./Curve.js"

/**
 * Stroke is a higher level wrapper that provides an API to locate the
 * intersection point with ratio over one Curve Segment. Typically, a Stroke
 * is what we called a stroke.
 */
export default class Stroke extends CurveStructureBase{

    constructor(spec) {
        super(Curve, spec);
        this.update();
    }

    curl(angle){
        if(this.body.length == 1){
            this.body[0].curl(angle);
        }
    }

    at(spec){
        return this.body[spec.curve].at(spec.r);
    }

    toPointList(){

        var thisPoints = [this.body[0].body[0].head];

        for(let i = 0; i < this.body.length; i++){
            var curveBody = this.body[i].body;
            for (let j = 1; j < curveBody.length; j++)
                thisPoints.push(curveBody[j].head);
            
            if(i != this.body.length - 1)
                curveBody[curveBody.length - 1].tail.attr.intersect = true;
            thisPoints.push(curveBody[curveBody.length - 1].tail);
        } 

        return [thisPoints];
    }

    draw(ctx, strokeWidth, scale){

        ctx.lineWidth = strokeWidth;
        ctx.lineCap = "square";
        ctx.lineJoin = "miter";
        ctx.miterLimit = 3;
        ctx.strokeStyle = "black";

        ctx.beginPath();
        for (let curve of this.body)
            curve.draw(ctx, strokeWidth, scale);
        ctx.stroke();
    }

}