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

    draw(ctx){
        // ctx.beginPath();
        // ctx.moveTo(this.head.x, this.head.y);
        ctx.lineTo(this.tail.x, this.tail.y);
        // ctx.stroke();
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

    modify(progs){

        if(progs === undefined) progs = this.progs;

        for(let prog of progs){
            switch(Object.keys(prog)[0]){
                case "trans":
                    this.trans(prog.trans);
                    break;
                case "rotate":
                    this.rotate(prog.rotate);
                    break;
                case "stretch":
                    this.stretch(prog.scale);
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

    /**
     * sample
     * returns a list of sampled points
     * @param {number} step 
     */
    sample(step){
        var points = [],
            angVec = new Vec(this.ang);
        for(var i = 0; i < this.len; i += step){
            points.push(angVec.mult(i).add(this.head));
        }
        return points;
    }
}

import {range} from "./Util.js"
export function testSeg(ctx){

    ctx.strokeColor = "blue";

    var number = 61;
    var body = range(number, (e) => new Seg({len:10, ang:0}));
    for(let i = 0; i < number; i++){
        body[i].progs = [
            {"trans":{x:10*i, y:10*i}},
            {"rotate":{"theta":3*i}},
            {"scale":{"ratio":1+i*0.25}}
        ];
        body[i].modify();
        body[i].draw(ctx, body[i].head);
    }
    
    // console.log(body);
}