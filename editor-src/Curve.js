import Seg from "./Seg.js"
import CurveStructureBase from "./CurveStructureBase.js";

/**
 * Test if a given ratio is our interested one.
 * 
 * if a < 0 && b < 0, then Math.max(a, b)
 * if a > 1 && b > 1, then Math.min(a, b)
 * 
 * if a < 0 && b > 1, or a > 1 && b < 0, this case is impossible
 * because the curve is always continous. and not overlapping with
 * itself.
 * 
 * if 0 < a < 1, then always return a. 
 * 
 * 
 * @param {number} a value
 * @param {number} b value
 */
function interested(a, b){
}

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

    /**
     * cross:
     * calculate the intersecting condition with another curve.
     * In our very scenario, we assume that the curve can have only one
     * intersection with another curve, which means our curve are rather
     * "flat".
     * 
     * When curve are intersecting together, only one seg from ecah curve
     * is intersecting. which means only one seg will have s with 0 < s < 1
     * and t as well.
     * 
     * 
     * @param {Curve} that another curve
     */

    cross(that){

        var thisLen = 0, thatLen = 0;
        var curveS, curveT;
        var curveI, curveJ;
        for (let i = 0; i < this.body.length; i++){
            for (let j = 0; j < that.body.length; j++){
                var int = this.body[i].cross(that.body[j]);
                
                if (curveS === undefined) curveS = int.s;
                else if( curveS < 0 && int.s < 0) {curveS = Math.max(curveS, int.s); curveI = i;}
                else if( curveS > 1 && int.s > 1) {curveS = Math.min(curveS, int.s); curveI = i;}
                else if( int.s > 0 && int.s < 1)  {curveS = int.s; curveI = i;} // this should occur only once.

                if (curveJ === undefined) curveJ = int.t;
                else if( curveT < 0 && int.t < 0) {curveT = Math.max(curveT, int.t); curveJ = j;}
                else if( curveT > 1 && int.t > 1) {curveT = Math.min(curveT, int.t); curveJ = j;}
                else if( int.t > 0 && int.t < 1)  {curveT = int.t; curveJ = j;}

            }
        }

        for(let i = 0; i < this.body.length; i++) thisLen += this.body[i].len;
        for(let i = 0; i < that.body.length; i++) thatLen += that.body[i].len;

        console.log(that.body, curveJ, that.body[curveJ]);
        curveS = this.body[curveI].len * curveS;
        curveT = that.body[curveJ].len * curveT;

        for (let i = 0; i < curveI; i++) curveS += this.body[i].len;
        for (let j = 0; j < curveJ; j++) curveT += that.body[j].len;

        return {s : curveS / thisLen, t:curveT / thatLen};

    }

    len(){
        return this.body.reduce((l, e) => l + e.len, 0);
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