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
        
        this.update();
    }

    copy(){
        return new Seg({len:this.len, ang:this.ang, head:this.head});
    }

    update(){

        var angleVec = new Vec(this.ang);
        this.tail = this.head.add(angleVec.mult(this.len));

        var boxHead = this.head.head(this.tail),
            boxTail = this.tail.tail(this.head);

        this.box  = new Box(boxHead, boxTail);
    }

    draw(ctx){
        ctx.beginPath();
        ctx.moveTo(this.head.x, this.head.y);
        ctx.lineTo(this.tail.x, this.tail.y);
        ctx.stroke();
    }

    modify(progs){

        if(progs === undefined) progs = this.progs;

        for(let prog of progs){
            switch(Object.keys(prog)[0]){
                case "trans":
                    this.head.x += prog.trans.x;
                    this.head.y += prog.trans.y;    
                    break;
                case "rotate":
                    this.ang += prog.rotate.theta;
                    break;
                case "stretch":
                    this.len *= prog.stretch.ratio;
                    break;
            }    
        }

        this.update();
    }
}

import {range} from "./Util.js"
export function testSeg(ctx){

    var number = 20;
    var body = range(number, (e, i) => new Seg({len:10, ang:0}));
    for(let i = 0; i < number; i++){
        body[i].progs = [
            {"trans":{x:10*i, y:10*i}},
            {"rotate":{"theta":2*i}},
            {"stretch":{"ratio":i}}
        ];
        body[i].modify();
        body[i].draw(ctx, body[i].head);
    }
    
    // console.log(body);
}