import Vec from "./Vec.js";
import CurveStructureBase from "./CurveStructureBase.js";
import CompoundCurve from "./CompoundCurve.js";
/**
 * StrokeSet is such a structure that, it contains several strokes, including
 * their intersecting information, but not aligning. like 戈, 匕. 
 * 
 */
export default class StrokeSet extends CurveStructureBase{
    
    constructor(spec) {
        console.log("strokeset constructor", spec);
        super(CompoundCurve, spec);
        this.update();
    }

    cross(spec){

        var pointDest = this.body[spec.dest.ith].at(spec.dest),
            pointSelf = this.body[spec.self.ith].at(spec.self);

        this.body[spec.self.ith].trans(pointDest.sub(pointSelf));
        console.log("cross called", pointDest.sub(pointSelf), this.body[spec.self.ith].head);
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
                try{
                    this.body[i].update();
                    this.box = this.box.union(this.body[i].box);
                } catch(TypeError){
                    console.error("StrokeSet update", this.box);
                }
            }    
        }
    }

    stretchFull(ctx){
        var thisSize = this.box.size(),
            width = ctx.canvas.width,
            height = ctx.canvas.height;

        var ratio;
        if (Math.min(thisSize.x, thisSize.y) > Math.max(width, height)){
            ratio = Math.max( width  / thisSize.x, height / thisSize.y );
        } else {
            ratio = Math.min( width  / thisSize.x, height / thisSize.y );
        }

        for(let comp of this.body){
            comp.head = comp.head.mult(ratio);
        }

        this.scale(ratio * 0.9);
        this.update();
    }

    transCenter(){
        for (let comp of this.body){
            comp.head = comp.head.add((new Vec(300, 300)).sub(this.box.center()));
        }
        this.update();
    }

    draw(ctx){

        this.stretchFull(ctx);
        this.transCenter();

        ctx.lineWidth = 25;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "rgb(0, 0, 0, 0.5)";

        // ctx.translate(600, 30);
        for(let component of this.body){
            component.head.draw(ctx);
            ctx.beginPath();
            ctx.moveTo(component.head.x, component.head.y);
            component.draw(ctx);
            ctx.stroke();
        }

    }

    sample(step){
        this.samples = this.body.map(function(comp){
            return comp.sample(step);
        });
    }
}

export function testStrokeSet(ctx, spec){
    var strokeSet = new StrokeSet(spec);
    strokeSet.modify();
    console.log(strokeSet);

    ctx.lineWidth = 1;
    strokeSet.draw(ctx);
    strokeSet.box.draw(ctx);
    strokeSet.sample(20);

    for (let s of strokeSet.samples)
        for (let p of s)
            p.draw(ctx, 5);
 
    ctx.setLineDash([2, 15]);
    ctx.strokeStyle = 'rgb(0, 0, 0, 0.5)';
    for (let i in strokeSet.samples)
        for (let j in strokeSet.samples)
            if ( i != j)
                for (let pi of strokeSet.samples[i])
                    for (let pj of strokeSet.samples[j]){
                        ctx.beginPath();
                        ctx.moveTo(pi.x, pi.y);
                        ctx.lineTo(pj.x, pj.y);
                        ctx.stroke();
                    }
                        
}