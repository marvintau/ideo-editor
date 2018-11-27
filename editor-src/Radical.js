import CurveStructureBase from "./CurveStructureBase.js";
import { getCore } from "./Core.js";
import Stroke from "./Stroke.js";
import Vec from "./Vec.js";

export default class Radical extends CurveStructureBase{
    
    constructor(spec) {
        super(Stroke, spec);
    }

    at(spec){
        this.body[spec.stroke].at(spec);
    }

    cross(spec){

        var pointDest = this.body[spec.dest.ith].at(spec.dest),
            pointSelf = this.body[spec.self.ith].at(spec.self);

        this.body[spec.self.ith].trans(pointDest.sub(pointSelf));
    }

    // Stroke set contains strokes that starting from different
    // position, thus the updating is actually adding the offset
    // to components respectively, instead of conjuncting curves
    // together.

    update(){        
        // first deal with the first component. 
        if(this.body.length > 0){
            this.body[0].head.iadd(this.head);
            this.body[0].update();
            this.box  = this.body[0].box;
        }
        if(this.body.length > 1){
            for(let i = 1; i < this.body.length; i++){
                this.body[i].head.iadd(this.head);
                this.body[i].update();
                this.box = this.box.union(this.body[i].box);
            }    
        }

        this.head = new Vec();
    }

    toPointList(){

        this.points = [];
        for(let component of this.body)
            this.points = this.points.concat(component.toPointList());        
        
        this.core = getCore(this.points);

        return this.points;
    }

    draw(ctx, strokeWidth, scale){
        for (let component of this.body)
            component.draw(ctx, strokeWidth, scale);
    }
}