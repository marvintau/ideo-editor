import Color from "./Color.js";

export default class Stroke extends Array {

    constructor(args){
        super(...args);
        this[0].setAttr({head: true});
        this[this.length-1].setAttr({tail: true});
        this.color = new Color();
        this.color.darken(0.3);

        this.type = "Stroke";
    }

    scale(ratio){
        for (let i = 0; i < this.length; i++) this[i].imult(ratio);
    }

    draw(ctx){
        ctx.strokeStyle = this.color.toString();
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(this[0].x, this[0].y);
        for (let i = 0; i < this.length; i++) ctx.lineTo(this[i].x, this[i].y);
        ctx.stroke();
    }

    bezierize(){
        
    }

    copy(){

        let pointList = Array.from(this).map(p => p.copy()),
            newStroke = new Stroke(pointList);
        newStroke.color = this.color.copy();

        return newStroke;
    }

}
