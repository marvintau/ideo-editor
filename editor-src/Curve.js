import Seg from "./Seg.js"
import CurveStructureBase from "./CurveStructureBase.js";

export default class Curve extends CurveStructureBase{
    constructor(spec){
        super(Seg, spec);
        this.update();
    }

    at(ithRatio){
        
        var point = this.head.copy();

        var currSeg;
        
        var totalLen = this.body.reduce((sum, e) => sum + e.len, 0), 
            ratioLen = ithRatio * totalLen,
            currSeg  = this.body[0],
            currLen  = 0;

        for(let i = 0; i < this.body.length-1; i++){

            if (currSeg.len + currLen > ratioLen) break;

            currSeg  = this.body[i];
            point    = currSeg.tail;
            currLen += currSeg.len;

        }

        point = point.add((new Vec(currSeg.ang)).mult(ratioLen - currLen));

        return point;
    }

}

import {range} from "./Util.js"
import Vec from "./Vec.js"

export function testCurve(ctx){
    var specs = range(60, (e) => ({
            body:range(e+1, (se) => ({
                len:(se+1) * 0.1,
                ang:se * 3.1 + e * 3 - 180
            })),
            head: new Vec(
                e*10, e*10)
        }));
    
    var curves = specs.map(spec => new Curve(spec));

    ctx.strokeStyle = "red";
    curves.forEach(curve => curve.draw(ctx));
}