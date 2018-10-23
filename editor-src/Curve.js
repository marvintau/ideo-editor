import Seg from "./Seg.js"
import CurveStructureBase from "./CurveStructureBase.js";

export default class Curve extends CurveStructureBase{
    constructor(spec){
        super(Seg, spec);
        this.update();
    }

    at(ithRatio){

        var totalLen = this.body.reduce((sum, e) => sum + e.len, 0),
            ratioLen = ithRatio * totalLen,
            currLen  = 0,
            currSeg  = null;

        for(var i = 0; i < this.body.length; i++){
            
            currSeg = this.body[i];
            if (currLen + currSeg.len >= ratioLen) break;
            currLen   += this.body[i].len;
        }

        var segRatio = (ratioLen - currLen)/currSeg.len,
            finalSeg = currSeg.tail.sub(currSeg.head).mult(segRatio);
        
        return currSeg.head.add(finalSeg);
    }
}
