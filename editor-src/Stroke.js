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

    toPointList(){
        var thisPoints = [];

        for(let i = 0; i < this.body.length; i++){
            let curveBody = this.body[i].body,
                list = [curveBody[0].head];
            for (let j = 0; j < curveBody.length; j++)
                list.push(curveBody[j].tail);
            thisPoints.push(list);
        } 

        return thisPoints;
    }

}