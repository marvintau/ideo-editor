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
        this.body = spec.body.map(comp => new Curve(comp));
        this.update();
    }

    static intersect(s1, s2){
        for (let i = 0; i < s1.body.length; i++)
        for (let j = 0; j < s2.body.length; j++)
            Curve.intersect(s1.body[i], s2.body[j]);
    }

    curl(angle){
        if(this.body.length == 1){
            this.body[0].curl(angle);
        }
    }

    at(spec){
        return this.body[spec.curve].at(spec.r);
    }


    update(){
        
        for (let curve of this.body) curve.update();
        
        if(this.body.length > 0){
            this.box  = this.body[0].box;
        }

        if(this.body.length > 1){
            for(let i = 1; i < this.body.length; i++){
                let head = this.body[i].body[0].head,
                    tail = this.body[i-1].body.last().tail,
                    transVec = tail.sub(head);
                
                this.body[i].trans(transVec);
                head.setAttr({joint: true});

                this.box.iunion(this.body[i].box);
            }    
        }
    }

    draw(ctx, strokeWidth, scale){

        for (let curve of this.body)
            curve.draw(ctx, strokeWidth, scale);
    }

}