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

    at(spec){
        return this.body[spec.curve].at(spec.r);
    }

    toPointList(points){
        var thisPoints = [];

        thisPoints.push(this.body[0].body[0].head);

        for(let i = 0; i < this.body.length; i++){
            let curveBody = this.body[i].body;
            for (let j = 0; j < curveBody.length; j++)
                thisPoints.push(curveBody[j].tail);
        } 

        return points.concat(thisPoints);
    }

}