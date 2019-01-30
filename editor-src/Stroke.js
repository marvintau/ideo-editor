import Color from "./Color.js";
import bezier from "adaptive-bezier-curve";
import Vec from "./Vec.js";

export default class Stroke extends Array {

    constructor(args){
        super(...args);
        this[0].setAttr({head: true});
        this[this.length-1].setAttr({tail: true});
        this.color = new Color();
        this.color.darken(0.1);

        this.type = "Stroke";
    }

    scale(ratio){
        for (let i = 0; i < this.length; i++) this[i].imult(ratio);
    }

    draw(ctx){
        ctx.strokeStyle = this.color.toString();
        // ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(this[0].x, this[0].y);
        for (let i = 0; i < this.length; i++) ctx.lineTo(this[i].x, this[i].y);
        ctx.stroke();

        ctx.fillStyle = "rgb(0, 0, 0, 0.5)";
        for (let i = 0; i < this.length; i++)
            ctx.fillRect(this[i].x - 2, this[i].y - 2, 4, 4);

    }

    bezierize(level){
        
        let subdivided = [];
        for (let i = 0; i < this.length;){
            if (this[i].attr.curveStart && i + 3 < this.length) {
                let bPart = Array.from(this).slice(i, i+4).map(p => p.toArray());
                bPart = bezier(...bPart, level);
                bPart = bPart.map(p => new Vec(p[0], p[1]));
                subdivided = subdivided.concat(bPart);
                i+=4;
            } else {
                subdivided.push(this[i]);
                i+=1;
            }
        }
        this.length = 0;
        for (let i = 0; i < subdivided.length; i++) this.push(subdivided[i]);
        this[0].setAttr({head:true});
        this[this.length-1].setAttr({tail:true});
    }

    copy(){

        let pointList = Array.from(this).map(p => p.copy()),
            newStroke = new Stroke(pointList);
        newStroke.color = this.color.copy();

        return newStroke;
    }

}
