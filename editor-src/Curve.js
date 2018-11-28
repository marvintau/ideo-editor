import Seg from "./Seg.js"
import CurveStructureBase from "./CurveStructureBase.js";
import Box from "./Box.js";

export default class Curve extends CurveStructureBase{
    constructor(spec){
        super(spec);
        this.body = spec.body.map(comp => new Seg(comp));
        this.update();
    }

    static intersect(c1, c2){
        if(c1.constructor !== c2.constructor){
            throw "intersect with different type";
        } else {
            
            for (var i = 0; i < c1.body.length; i++)
            for (var j = 0; j < c2.body.length; j++){
                var inter = Seg.intersect(c1.body[i], c2.body[j]);
                if(inter.crossing) {
                    c1.body = [].concat(c1.body.slice(0, i), inter.s1, c1.body.slice(i+1));
                    c2.body = [].concat(c2.body.slice(0, j), inter.s2, c2.body.slice(j+1));
                    break;
                }
            }
        }
    }

    at(ithRatio){

        var ratioLen = ithRatio * this.length(),
            currLen  = 0,
            currSeg  = null;

        for(var i = 0; i < this.body.length; i++){
            
            currSeg = this.body[i];
            if (currLen + currSeg.len >= ratioLen) break;
            currLen   += this.body[i].len;
        }

        return currSeg.at((ratioLen - currLen)/currSeg.len);
    }

    curl(curvature){
        var accum = 0;
        for (let i = 0; i < this.body.length; i++){
            this.body[i].ang += accum;
            accum += curvature;
        }
            
        this.update();
    }

    update(){
        for (let seg of this.body) seg.update();

        if(this.body.length > 0){
            this.box = this.body[0].box;
        }

        if(this.body.length > 1)
            for (let s = 1; s < this.body.length; s++){
                let transVec = this.body[s-1].tail.sub(this.body[s].head);
                this.body[s].trans(transVec);
                this.box.iunion(this.body[s].box);
            }        
    }

    draw(ctx, strokeWidth, scale){
        
        ctx.beginPath();
        ctx.moveToVec(this.body[0].head, scale);
        for (var currSeg = 0; currSeg < this.body.length;currSeg++) {
        
            // if (this.body.length - currSeg > 2){
            //     ctx.bezierCurveToVec(this.body.slice(currSeg, currSeg+3).map(e=>e.tail), scale);
            //     currSeg += 2;
            // } else {
                ctx.lineToVec(this.body[currSeg].tail, scale);
            // }
        }
        ctx.stroke();
        
    }
}
