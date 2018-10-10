import Vec from "./Vec.js";
import CurveStructureBase from "./CurveStructureBase.js";
import CompoundCurve from "./CompoundCurve.js";

import {flatten, findMinMax} from "./Util.js";
import Box from "./Box.js";

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
        this.samples = this.body.reduce(function(list, comp){
            return list.concat(comp.sample(step));
        }, []);
    }
}

function findCentroid(ctx, pointSet, threshold){
        // ctx.setLineDash([1, 50]);
    ctx.lineWidth = 1;
    for (let i in pointSet) for (let j in pointSet) if (i < j)
        for (let pi of pointSet[i])
            for (let pj of pointSet[j])
                if (pi.sub(pj).mag() < threshold){
                    var weight = pi.sub(pj).mag()/threshold;
                    ctx.strokeStyle = 'rgb(0, 0, 0, '+0.2*weight+')';
                    ctx.beginPath();
                    ctx.moveTo(pi.x, pi.y);
                    ctx.lineTo(pj.x, pj.y);
                    ctx.stroke();    
                }

    var flattenPoints = flatten(pointSet),
        centroid = new Vec();
    for (let p of flattenPoints){
        centroid = centroid.add(p);
    }
    centroid = centroid.mult(1/flattenPoints.length);
    centroid.draw(ctx, 10, "red");
}

function findCenterRect(ctx, pointSet, step){
    var points = flatten(pointSet);

    var width = ctx.canvas.width,
        height = ctx.canvas.height;

    var maxRange = 0,
        maxRangeMaxBox = new Box();
    
    var nums, mean, dev;

    // enumerate all possible sizes of box rectangle

    // any criteria for the shape of box can be specified here.
    for (let h = 20*step; h <= height; h += step)
        for (let w = step; w <= h; w += step) {

            // for all positions
            var pointNum = [];
            for(let x = 0; x + w <= width; x += step)
                for(let y = 0; y + h <= height; y += step){
                    var box = new Box(new Vec(x, y), new Vec(x+w, y+h));
                    pointNum.push({
                        p:points.filter( point => box.include(point)).length,
                        b:box.copy()
                    });
                }


            var res = findMinMax(pointNum, e => e.p);
            var range = (pointNum.length != 0) ? pointNum[res.max].p - pointNum[res.min].p : 0;
            
            if (range > maxRange) {
                maxRange = range;
                maxRangeMaxBox = pointNum[res.max].b.copy();

                nums = pointNum.map(e => e.p),
                mean = nums.reduce((s, e) => s+e) / nums.length,
                dev  = nums.map(e => Math.abs(e - mean)).reduce((s, e) => s+e) / nums.length;
            }
        }

    maxRangeMaxBox.draw(ctx);
    points
        .filter( point => maxRangeMaxBox.include(point))
        .forEach(p => p.draw(ctx, 7, "rgb(192, 0, 0, 1)"));

    return maxRangeMaxBox;
}


export function testStrokeSet(ctx, spec){
    var strokeSet = new StrokeSet(spec);
    strokeSet.modify();
    console.log(strokeSet);

    ctx.lineWidth = 1;
    strokeSet.draw(ctx);
    // strokeSet.box.draw(ctx);
    strokeSet.sample(20);

    for (let s of strokeSet.samples)
        for (let p of s)
            p.draw(ctx, 5);
 
    findCenterRect(ctx, strokeSet.samples, 20);
    findCentroid(ctx, strokeSet.samples, 150);
}