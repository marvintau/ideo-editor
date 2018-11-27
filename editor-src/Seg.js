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

        // this.head.w = (spec.weight === undefined) ? 1: spec.weight[0];
        // this.tail.w = (spec.weight === undefined) ? 1: spec.weight[1];
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
            s: s, t: t,
            s1: s1.splitAt(s),
            s2: s2.splitAt(t),
        };

    }

    copy(){
        return new Seg({len:this.len, ang:this.ang, head:this.head});
    }

    at(ratio){
        return this.head.add(this.tail.sub(this.head).mult(ratio));
    }

    setLenAngFromEnds(){
        var dir = this.tail.sub(this.head);
        this.len = dir.mag();
        this.ang = dir.angle();
    }

    splitAt(ratio){
        var segs = [new Seg(), new Seg()],
            mid  = this.splitAt(ratio);
        
        segs[0].head = this.head;
        segs[0].tail = segs[1].head = mid;
        segs[1].tail = this.tail;
        
        segs[0].setLenAngFromEnds();
        segs[1].setLenAngFromEnds();

        return segs;
    }

    splitAtLength(len){
        return this.splitAt(this.len/len);
    }

    /**
     * rotate the line segment
     * @param {number} rotate angle to be rotated with
     */
    rotate(rotate){
        this.ang += rotate;
        this.update();
    }

    /**
     * translate
     * @param {Vec} vec vector to be translated with
     */
    trans(trans){
        this.head = this.head.add(new Vec(trans));
        this.update();
    }
    
    /**
     * stretch
     * @param {number} ratio ratio to stretch with
     */
    scale(scale){
        this.len *= scale;
        this.update();
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

}


// function test(){
//     var seg1 = new Seg(),
//         seg2 = new Seg();
    
//     seg1.head = new Vec(0, 0);
//     seg1.tail = new Vec(10, 10);
//     seg2.head = new Vec(10, 0);
//     seg2.tail = new Vec(0, 10);
//     seg1.setLenAngFromEnds();
//     seg2.setLenAngFromEnds();

//     var inter = Seg.intersect(seg1, seg2);
//     console.log(inter);
// }
// test();