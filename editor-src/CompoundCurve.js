import CurveStructureBase from "./CurveStructureBase.js";

/**
 * CompoundCurve is a higher level wrapper that provides an API to locate the
 * intersection point with ratio over one Curve Segment. Typically, a CompoundCurve
 * is what we called a stroke.
 */
export default class CompoundCurve extends CurveStructureBase{

    constructor(spec) {
        super(Curve, spec);
        this.update();
    }

    at(spec){
        console.log("compound curve at:", spec.curve, this.body);
        return this.body[spec.curve].at(spec.r);
    }

}


import {range} from "./Util.js"
import Curve from "./Curve.js"

export function testCompoundCurve(ctx){

    var edges   = 30,
        edgeLen = 1.5,
        arcs    = 5;

    var spec = {
        body:range(arcs, (e) => ({                       // compound curve level
            body:range(edges+1, (e) => ({                // curve level
                len:edgeLen/Math.sin(Math.PI/(360/edges)),
                ang:(180/edges*e)
            }))
        }))
    };

    var compoundCurve = new CompoundCurve(spec);

    compoundCurve.progs = range(arcs, (e) => ({
        ith:e,
        progs:[{                                    // curve level
            progs:[{ rotate:{theta:180/arcs*e-90}}],// seg level
            rotate : {theta:180/arcs*e-90}          // seg level and can be observed that the change of angle.
        }]
    }))

    compoundCurve.modify();
    compoundCurve.transCenter();

    var box = compoundCurve.box;

    // ctx.fillStyle = "rgb(123, 123, 123, 0.5)";
    // ctx.fillRect(box.head.x, box.head.y, box.tail.x-box.head.x, box.tail.y-box.head.y);
    
    ctx.lineWidth = 30;
    ctx.strokeStyle = "rgb(0, 0, 0, 0.5)";
    compoundCurve.draw(ctx);    
}