import Seg from "./Seg.js"
import CurveStructureBase from "./CurveStructureBase.js";

export default class Curve extends CurveStructureBase{
    constructor(spec){
        var body = (spec != undefined) ? spec.body.map(seg => new Seg(seg)) : [];

        super(body);

        this.update();
    }

    at(ithRatio){
        
        var point = this.head.copy();

        var currSeg;
        
        var totalLen = this.body.reduce((sum, e) => sum + e.len, 0), 
            ratioLen = ithRatio * totalLen,
            currLen  = 0;

        for(let i = 0; i < this.body.length-1; i++){

            currSeg =  this.body[i];
            currLen += this.body[i].len;
            point = point.add((new Vec(currSeg.ang)).mult(currSeg.len));

            if (this.body[i+1].len + currLen > ratioLen) break;
        }

        point = point.add((new Vec(currSeg.ang)).mult(ratioLen - currLen));

        return point;
    }
}

export function testCurve(){
    
}