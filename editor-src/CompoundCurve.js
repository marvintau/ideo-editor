import CurveStructureBase from "./CurveStructureBase.js";

/**
 * CompoundCurve is a higher level wrapper that provides an API to locate the
 * intersection point with ratio over one Curve Segment. Typically, a CompoundCurve
 * is what we called a stroke.
 */
export default class CompoundCurve extends CurveStructureBase{

    constructor(body) {
        super(body);
        this.update();
    }

    at(ithRatio, ithCurve){
        return this.body[ithCurve].at(ithRatio);
    }
}


import {range} from "./Util.js"
import Curve from "./Curve.js"

export function testCompoundCurve(){

    var edges   = 30,
        edgeLen = 1,
        arcs    = 17;

    var segSpecs = {body:range(edges+1, (e, i) => ({len:edgeLen/Math.sin(Math.PI/(360/edges)), ang:(180/edges*i)}))};

    var curves = [...Array(arcs).keys()].map((e, i) => new Curve(segSpecs));
    var compoundCurve = new CompoundCurve(curves);

    compoundCurve.progs = range(arcs, (e, i) => ({
        ith:i,
        progs:[{                            // curve level
            progs:[{                        // seg level
                rotate:{theta:360/arcs*i}
            }]
        }]
    }))
    
    compoundCurve.modify();
    compoundCurve.transCenter();

    var ctx = document.getElementById("canvas").getContext("2d");
    compoundCurve.draw(ctx);    

    var box = compoundCurve.box;
    // console.log(box);
    ctx.rect(box.head.x, box.head.y, box.tail.x-box.head.x, box.tail.y-box.head.y);
    ctx.stroke();
}