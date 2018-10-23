import Vec from "./Vec.js";
import CurveStructureBase from "./CurveStructureBase.js";
import CompoundCurve from "./CompoundCurve.js";
// import Raster from "./Raster.js";

import {flatten} from "./Util.js";
import Box from "./Box.js";


function pixelDensity(imageData){
    var width   = imageData.width * 4,
        height  = imageData.height,
        data    = imageData.data,
        centerX = 0,
        centerY = 0,
        sum     = 0;
    for (let row = 0; row < height; row ++)
    for (let col = 0; col < width;  col += 4){
        if(data[row * width + col] > 0){
            centerX += col;
            centerY += row;
            sum += 1;
        }
    }
    return {
        density: sum / Math.pow(Math.hypot(width, height), 1.125),
        centroid: new Vec(centerX/4/sum, centerY/sum)
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
        console.log(spec.vars);
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

        this.scale(ratio);
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
        
        ctx.fillStyle = "black";
        ctx.fillRect(-100, -100, ctx.canvas.width+200, ctx.canvas.height+200);
        ctx.setTransform(1,0,0,1,0,0);   // reset matrix
        ctx.translate(ctx.canvas.width*0.05, ctx.canvas.height*0.05)
        ctx.scale(0.9, 0.9);
        
        ctx.lineWidth = 2;
        ctx.lineCap = "square";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "rgb(255, 255, 255, 1)";

        // ctx.translate(600, 30);
        for(let component of this.body){
            ctx.beginPath();
            ctx.moveTo(component.head.x, component.head.y);
            component.draw(ctx);
            ctx.stroke();
        }

    }

    findSubdivision(ctx){

    }

    findCenterRect(ctx){

        var ss = performance.now();
        var width  = ctx.canvas.width,
            height = ctx.canvas.height,
            canvasData = ctx.getImageData(0, 0, width, height),
            canvasDensity = pixelDensity(canvasData),
            canvasCentroid = canvasDensity.centroid;

        var data, result, resultMax = {density: 0};
        for (let r = 0.02; r < 1; r += 0.02){
            var sx = canvasCentroid.x * (1-r),
                sy = canvasCentroid.y * (1-r),
                sw = width * r,
                sh = height * r;

            data = ctx.getImageData( sx, sy, sw, sh);
            result = pixelDensity(data);
            if(result.density > resultMax.density){
                resultMax = result;
                resultMax.r = r;
            }
            result.centroid.add(new Vec(sx, sy)).draw(ctx);
        }

        resultMax.centroid = resultMax.centroid.add(new Vec(sx, sy));
        ctx.fillStyle = "rgb(255, 255, 255, 0.5)";
        ctx.fillRect( canvasCentroid.x * (1-resultMax.r), canvasCentroid.y * (1-resultMax.r), width * resultMax.r, height * resultMax.r);

        var tt = performance.now();
        return resultMax;
    }
}
