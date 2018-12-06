import CurveStructureBase from "./CurveStructureBase.js";
import Curve from "./Curve.js"

/**
 * Stroke is a higher level wrapper that provides an API to locate the
 * intersection point with ratio over one Curve Segment. Typically, a Stroke
 * is what we called a stroke.
 */
export default class Stroke extends CurveStructureBase{

    constructor(spec) {
        super(spec);
        this.type = "Stroke";
        this.body = spec.body.map(comp => new Curve(comp));
        this.update();
    }

    rotate(angle){
        for(let elem of this.body){
            elem.rotate(angle);
        }
    
        this.update();
    }

    curl(angle){
        if(this.body.length == 1){
            this.body[0].curl(angle);
        }
    }

    at(spec){
        return this.body[spec.curve].at(spec.r);
    }

    insertAt(spec, attr){
        return this.body[spec.curve].insertAt(spec.r, attr);
    }

    remove(func){
        for (let curve of this.body){
            for (let i = 0; i < curve.body.length;){
                if (func(curve.body[i])){
                    curve.body.splice(i, 1);
                } else
                    i += 1;
            }
        }
    }

    duringUpdate(){
        if (this.body.length > 1)
            for(let i = 1; i < this.body.length; i++){
                if(this.body[i].body.length > 1 && this.body[i-1].body.length){
                    let last = this.body[i-1],
                        tail = last.body.last(),
                        curr = this.body[i],
                        head = curr.body[0];

                    curr.trans(tail.sub(head));

                    tail.setAttr({joint: true});
                    head.setAttr({joint: true});    
                }
                
            }
    }

    draw(ctx, strokeWidth, scale){

        ctx.beginPath();
        ctx.moveToVec(this.body[0].body[0], scale);

        for (let curve of this.body)
            curve.draw(ctx, strokeWidth, scale);

        ctx.stroke();
    }

}