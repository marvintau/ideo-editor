import Vec from "./Vec.js";
import CurveStructureBase from "./CurveStructureBase.js";
import CompoundCurve from "./CompoundCurve.js";
// import Raster from "./Raster.js";

import {flatten} from "./Util.js";
import Box from "./Box.js";

// only for saving indentation 
function forAllKernelSize(width, height, step, func){
    for (let h = step; h <= height; h += step)
        for (let w = 0.5*h; w <= 0.66*h; w += step) 
            func(w, h);
}

function findMinMax(data, func){
    var min =  10000,
        max = -10000,
        minIndex = 0,
        maxIndex = 0;

    var p = (func === undefined) ? data : data.map(func);
    for (let i in p)
        if(p[i] > max) {
            max = p[i]; maxIndex = i;
        } else if (p[i] < min) {
            min = p[i]; minIndex = i;
        }

    return {
        max : parseInt(maxIndex),
        min : parseInt(minIndex)
    };
}

/**
 * StrokeSet is such a structure that, it contains several strokes, including
 * their intersecting information, but not aligning. like 戈, 匕. 
 * 
 */
export default class StrokeSet extends CurveStructureBase{
    
    constructor(spec) {
        super(CompoundCurve, spec);
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

    transCenter(ctx){
        var centerX = ctx.canvas.width/2,
            centerY = ctx.canvas.height/2;
        for (let comp of this.body){
            comp.head = comp.head.add((new Vec(centerX, centerY)).sub(this.box.center()));
        }
        this.update();
    }

    draw(ctx){

        this.stretchFull(ctx);
        this.transCenter(ctx);
        
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.lineWidth = 25;
        ctx.lineCap = "square";
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
        return this.body.reduce(function(list, comp){
            return list.concat(comp.sample(step));
        }, []);
    }

    findCentroid(ctx){

        var pointSet = this.sample(25);
        var flattenPoints = flatten(pointSet),
            centroid = new Vec();
        for (let p of flattenPoints){
            centroid = centroid.add(p);
        }
        centroid = centroid.mult(1/flattenPoints.length);
        console.log("centroid: ", centroid);
        centroid.draw(ctx, 10, "red");
    }

    findCenterRect(ctx, step){
        var points = flatten(this.sample(25));
        var width = ctx.canvas.width,
            height = ctx.canvas.height;
    
        var maxRange = 0,
            box = new Box(),
            maxRangeMaxBox = new Box();
        
        // var nums, mean, dev;
        
        // enumerate all possible sizes of box rectangle
    
        var ts = performance.now();
        // any criteria for the shape of box can be specified here.
        forAllKernelSize(width, height, step, function(w, h){
            // for all positions
            var pointNum = [];
            for(let x = 0; x + w <= width; x += step)
                for(let y = 0; y + h <= height; y += step){
                    box.set(x, y, w, h);
                    pointNum.push(points.filter( point => box.include(point)).length);
                }

            var res = findMinMax(pointNum);
            var range = (pointNum.length != 0) ? pointNum[res.max] - pointNum[res.min] : 0;
            
            if (range >= maxRange) {
                maxRange = range;

                var hstep = (height-h)/step,
                    maxX = Math.ceil(res.max/hstep),
                    maxY = maxX*hstep - res.max;
                
                maxRangeMaxBox.set((maxX-2)*step, (maxY)*step, w, h);

                // maxRangeMaxBox.draw(ctx);
                // nums = pointNum.map(e => e.p),
                // mean = nums.reduce((s, e) => s+e) / nums.length,
                // dev  = nums.map(e => Math.abs(e - mean)).reduce((s, e) => s+e) / nums.length;
            }
        })
    
        maxRangeMaxBox.draw(ctx);
        console.log("finding rect takes: ", (performance.now() - ts)*0.001 , "secs");
        console.log("rect ", maxRangeMaxBox);
        return maxRangeMaxBox;
    }
}


export function testStrokeSet(ctx, spec){
    var strokeSet = new StrokeSet(spec);
    console.log(strokeSet);

    ctx.lineWidth = 1;
    strokeSet.draw(ctx);
    strokeSet.sample(15);

    for (let s of strokeSet.samples)
        for (let p of s)
            p.draw(ctx, 5);
 
    var t1 = performance.now()
    findCenterRect(ctx, strokeSet.samples, 20);
    console.log("centerrect found in:", (performance.now() - t1)*0.001, "secs") ;

    findCentroid(ctx, strokeSet.samples, 150);
}