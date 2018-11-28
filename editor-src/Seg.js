import Vec from "./Vec.js";
import Box from "./Box.js";
import CurveStructureBase from "./CurveStructureBase.js";

export default class Seg extends CurveStructureBase{

    constructor(spec){
        
        super();
        
        this.len  = (spec && spec.len) ? spec.len : 0;
        this.ang  = (spec && spec.ang) ? spec.ang : 0;
        this.head = new Vec();
        this.tail = new Vec();
        this.box  = new Box();

        this.update();
    }

    /**
     * intersect
     * @param {Seg} s1 first seg
     * @param {Seg} s2 second seg
     * 
     * @returns the p and q are the intersection point, but they are identical.
     */
    static intersect(s1, s2){

        if(s1.constructor.name !== s2.constructor.name) throw {name:"intersect with Segs only"};
        var p1 = s1.head,
            p2 = s1.tail,
            p3 = s2.head,
            p4 = s2.tail;

        var det_s =  p1.sub(p3).cross(p3.sub(p4)),
            det_t = -p1.sub(p2).cross(p1.sub(p3)),
            det   =  p1.sub(p2).cross(p3.sub(p4));

        var s = det_s/det,
            t = det_t/det,
            p = p1.add(p2.sub(p1).mult(s));
        
        return {
            p: p,
            crossing: s > -0.0001 && s < 1.0001 && t > -0.0001 && t < 1.0001,
            s1: s1.splitAt(s, {intersection: true}),
            s2: s2.splitAt(t, {intersection: true}),
        };

    }

    copy(){
        return new Seg({len:this.len, ang:this.ang, head:this.head});
    }

    at(ratio){
        return this.head.add(this.tail.sub(this.head).mult(ratio));
    }

    splitAt(ratio, midAttr){
        if (ratio < 0 || ratio > 1){
            return [this];
        } else if (ratio == 0){
            this.head.setAttr(midAttr);
            return [this];
        } else if (ratio == 1){
            this.tail.setAttr(midAttr);
            return [this];
        } else {
            var segs = [new Seg(), new Seg()],
                mid  = this.at(ratio);
            
            mid.setAttr(midAttr);
    
            segs[0].head = this.head;
            segs[0].tail = segs[1].head = mid;
            segs[1].tail = this.tail;
            
            segs[0].updateByPoints();
            segs[1].updateByPoints();
    
            return segs;
        }
    }

    /**
     * rotate the line segment
     * @param {number} angle angle to be rotated with
     */
    rotate(angle){
        this.ang += angle;
        this.update();
    }

    /**
     * translate
     * translate不会改变len和angle，因此凡是和trans有关的操作其实都不需要
     * update。
     * @param {Vec} vec vector to be translated with
     */
    trans(trans){
        this.head.iadd(trans);
        this.tail.iadd(trans);
    }
    
    /**
     * stretch
     * @param {number} ratio ratio to stretch with
     */
    scale(ratio){
        this.len *= ratio;
        this.update();
    }

    length(){
        return this.len;
    }

    modify(prog){

        if(prog === undefined) prog = this.prog; else prog = this.prog.concat(prog);

        for(let instr of prog){
            switch(Object.keys(instr)[0]){
                case "trans":
                    this.trans(instr.trans);
                    break;
                case "rotate":
                    this.rotate(instr.rotate);
                    break;
                case "stretch":
                    this.stretch(instr.scale);
                    break;
            }    
        }

        this.update();
    }

    update(){

        var angleVec = new Vec(this.ang);
        this.tail = this.head.add(angleVec.mult(this.len));

        var boxHead = this.head.head(this.tail),
            boxTail = this.tail.tail(this.head);

        this.box  = new Box(boxHead, boxTail);
    }


    updateByPoints(){
        var dir = this.tail.sub(this.head);
        this.len = dir.mag();
        this.ang = dir.angle();

        var boxHead = this.head.head(this.tail),
            boxTail = this.tail.tail(this.head);

        this.box  = new Box(boxHead, boxTail);
    }
}