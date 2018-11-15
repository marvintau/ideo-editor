import Vec from "./Vec.js";
import CurveStructureBase from "./CurveStructureBase.js";
import Stroke from "./Stroke.js";
/**
 * Radical is such a structure that, it contains several strokes, including
 * their intersecting information, but not aligning. like 戈, 匕. 
 * 
 */
export default class Radical extends CurveStructureBase{
    
    constructor(spec) {
        super(Stroke, spec);

        this.modify();
        this.toPointList();
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
            this.body[0].update();
            this.box  = this.body[0].box;
        }
        if(this.body.length > 1){
            for(let i = 1; i < this.body.length; i++){
                this.body[i].update();
                this.box = this.box.union(this.body[i].box);
            }    
        }
    }


    toPointList(){
            
        let ratio = 16;
        for(let comp of this.body) comp.head = comp.head.mult(ratio);

        this.scale(ratio);
        this.trans(this.box.center().neg());

        this.points = [];
        for(let component of this.body)
            this.points = this.points.concat(component.toPointList());            
    }
}
