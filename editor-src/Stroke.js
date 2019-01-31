import Color from "./Color.js";
import bezier from "adaptive-bezier-curve";
import Vec from "./Vec.js";

export default class Stroke extends Array {

    constructor(strokeSpec, polygon){
        super();        
        if(Array.isArray(strokeSpec)){
            super.push(...strokeSpec);
            this[0].setAttr({head:true});
            this.last().setAttr({tail:true});
        } else{
            this.appendStrokeSeg(strokeSpec, polygon);
        }

        this.color = new Color();
        this.color.darken(0.1);

    }

    appendStrokeSeg(strokeSpec, polygon){
        let angle     = strokeSpec.angle,
            offset    = strokeSpec.offset ? strokeSpec.offset : 0,
            arcRatio  = strokeSpec.arcRatio ? strokeSpec.arcRatio: 1/6,
            arcOffset = strokeSpec.arcOffset;

        if (isNaN(offset))
            throw TypeError("addStroke: offset is not a number");
        if (offset > 0.5 || offset < -0.5)
            throw TypeError("addStroke: offset should be within [-0.5, 0.5]");
        if (isNaN(arcRatio))
            throw TypeError("addStroke: arcRatio is not a number");

        console.log(polygon);
        let {head, tail} = polygon.diameter(angle);

        head = head.mult(0.8).add(polygon.centroid);
        tail = tail.mult(0.8).add(polygon.centroid);
        head.setAttr({curveStart: true});

        let half = tail.sub(head).mult(0.5).rotate(90),
            c1 = tail.sub(head).mult(0.5-arcRatio).add(head).add(half.mult(offset)),
            c2 = tail.sub(head).mult(0.5+arcRatio).add(head).add(half.mult(offset));

        this.push(...[head, c1, c2, tail]);
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
