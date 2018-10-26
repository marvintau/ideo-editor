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

    stretchFull(size, limit){
        var thisSize = this.box.size(),
            width    = size.width  * limit,
            height   = size.height * limit;

        var ratio;
        if (Math.min(thisSize.x, thisSize.y) > Math.max(width, height)){
            ratio = Math.max( width  / thisSize.x, height / thisSize.y );
        } else {
            ratio = Math.min( width  / thisSize.x, height / thisSize.y );
        }

        for(let comp of this.body){
            comp.head = comp.head.mult(ratio);
        }

        this.scale(ratio);
        this.update();
    }

    transCenter(){
        for (let comp of this.body){
            comp.head = comp.head.add((new Vec()).sub(this.box.center()));
        }
        this.update();
    }

    toPointList(size, ratio){

        this.stretchFull(size, ratio);
        this.transCenter();
            
        var points = [];
        for(let component of this.body) points.push(component.toPointList([]));
        return points;
    }
}
