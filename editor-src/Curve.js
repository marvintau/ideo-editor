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

        return currSeg.at((ratioLen - currLen)/currSeg.len);
    }

    /**
     * different version of splitSegAt, but accepts ratio of length.
     */
    splitSegAt(ratio){
        let totalLen = this.body.reduce((sum, e) => sum + e.len, 0);
        return this.splitSegAtLength(ratio * totalLen);
    }

    /**
     * splitSegAt doesn't produce more Curves, but make another Seg at 
     * the length ratio.
     * 
     * WARNING: IN-PLACE OPERATION
     */
    splitSegAtLength(len){
        var cumuLength = 0,
            i = 0;

        for (; i < this.body.length; i++){
            if (cumuLength + this.body[i].len > len){
                this.body = [].concat(
                    this.body.slice(0, i-1),
                    this.body[i].splitAtLength(len - cumuLength),
                    this.body.slice(i+1));
                break;
            }
            cumuLength += this.body[i].len;
        }

        return i;
    }

    /**
     * merge the ith seg and ith+1 seg into one.
     */
    mergeSegAt(){

    }

    curl(curvature){
        var accum = 0;
        for (let i = 0; i < this.body.length; i++){
            this.body[i].ang += accum;
            accum += curvature;
        }
            
        this.update();
    }

    draw(ctx, strokeWidth, scale){
        
        ctx.moveToVec(this.body[0].head, scale);
        for (var currSeg = 0; currSeg < this.body.length;currSeg++) {
        
            if (this.body.length - currSeg > 2){
                ctx.bezierCurveToVec(this.body.slice(currSeg, currSeg+3).map(e=>e.tail), scale);
                currSeg += 2;
            } else {
                ctx.lineToVec(this.body[currSeg].tail, scale);
                currSeg += 1;
            }
        }
    }
}
