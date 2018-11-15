import Vec from "./Vec.js";
import Box from "./Box.js";
import CurveStructureBase from "./CurveStructureBase.js";

export default class Seg extends CurveStructureBase{

    constructor(spec){
        
        super();
        
        this.len  = spec.len;
        this.ang  = spec.ang;
        this.head = new Vec();
        this.tail = new Vec();
        this.box  = new Box();

        this.head.w = (spec.weight === undefined) ? 1: spec.weight[0];
        this.tail.w = (spec.weight === undefined) ? 1: spec.weight[1];
        this.update();
    }

    copy(){
        return new Seg({len:this.len, ang:this.ang, head:this.head});
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
