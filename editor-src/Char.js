import Radical from "./Radical.js";
import CurveStructureBase from "./CurveStructureBase.js";
import Vec from "./Vec.js";
import Curve from "./Curve.js";

function wrap(inner, outerType){
    return {type:outerType, body:[inner], vars:{}, prog:[]};
}

/**
 * Char is resposible for two types of data, Radical and Char itself.
 * Considering Radical as undivisible component of character, char is
 * the character composed by Radicals.
 *
 * Char shares most common functions with CurveStructureBase, however
 * Char cannot get extended from CurveStructureBase because of its
 * recursive structure.
 */
export default class Char extends CurveStructureBase{
    
    constructor(spec){

        super(spec);

        this.body = [];

        if (spec && spec.body) for (let elem of spec.body){
            let finalElem = elem;

            if (finalElem.type === "Curve")
                finalElem = wrap(finalElem, "Stroke");

            if (finalElem.type === "Stroke") 
                finalElem = wrap(finalElem, "Radical");

            if (finalElem.type === "Radical") 
                this.body.push(new Radical(finalElem));

            if (finalElem.type === "Char")
                this.body.push(new Char(finalElem));
        }
        if (spec.type == "Curve")
            this.body.push(new Radical(wrap(wrap(spec, "Stroke"), "Radical")))

        this.type = "Char";
    }

    /**
     * 这里的cross和Radical中的基本一样，不同的是通过笔画的相对位置确定两个
     * 组件（而不是笔画）的相对位置。这个不同是通过Radical中的
     */
    splice(spec){

        if (spec.self && spec.dest){

            console.log(this.body[spec.dest.ith], this.body[spec.self.ith], "splice");

            var pointDest = this.body[spec.dest.ith].at(spec.dest),
                pointSelf = this.body[spec.self.ith].at(spec.self);

            this.body[spec.self.ith].trans(pointDest.sub(pointSelf));
         }
    }

    place(spec){

        if (spec.self && spec.dest){
            var self = this.body[spec.self.ith],
                dest = this.body[spec.dest.ith],
                selfr = spec.self.r ? spec.self.r : 0.68,
                destr = spec.dest.r ? spec.dest.r : 0.58,
                selfCoreArea = self.corebound? self.corebound.area() : self.outline.area(),
                destCoreArea = dest.corebound? dest.corebound.area() : dest.outline.area(),
                spacing =   spec.spacing + this.vars.globalStrokeWidth.val*0.02,
                outlying =  this.vars.outlying  ? this.vars.outlying.val  : 1.5,
                shrinking = this.vars.shrinking ? this.vars.shrinking.val : 0.5,
                maxRatio = Math.max(selfr, destr) / Math.min(selfr, destr);
            
            console.log(spec.spacing, "placing spec spacing");

            var transVec = dest.massCenter;
            switch(spec.pos){
                case 0:
                    self.stretch(new Vec(selfr, 1));
                    dest.stretch(new Vec(destr, 1));
                    
                    for (let k in self.outliers)
                        for (let curve of self.outliers[k]){
                            if (k == "r") curve.scale(outlying);
                        }

                    for (let k in dest.outliers)
                        for (let curve of dest.outliers[k]){
                            if (k == "r") curve.scale(shrinking);
                        }
                        
                    console.log(dest, "place");
                    transVec.x += self.corebound.box.size().add(dest.corebound.box.size()).mult(spacing).x;
                    transVec = transVec.sub(self.massCenter);
                    break;
                case 1:
                    self.stretch(new Vec(1, selfr));
                    dest.stretch(new Vec(1, destr));
                    
                    for (let k in self.outliers)
                        for (let curve of self.outliers[k]){
                            if (k == "r") curve.scale(outlying);
                        }

                    for (let k in dest.outliers)
                        for (let curve of dest.outliers[k]){
                            if (k == "r") curve.scale(shrinking);
                        }
                                
                    transVec.y += self.corebound.box.size().add(dest.corebound.box.size()).mult(spacing).y;
                    transVec = transVec.sub(self.massCenter);
                    break;
            }

            this.body[spec.self.ith].trans(transVec);
        }
    }

    postUpdate(){

        let coreboundPoints = [].concat(...this.body.map(elem => elem.corebound ? elem.corebound.body : elem.outline.body));
        this.corebound = new Curve(coreboundPoints);
        if (coreboundPoints.some(e => isNaN(e.x)))
            console.log(coreboundPoints, "NaN found corebound in Char postUpdate");
        this.corebound.convexHull();
        this.massCenter = this.corebound.massCenter();

        let outlinePoints = [].concat(...this.body.map(elem => elem.outline.body));
        this.outline = new Curve(outlinePoints);
        this.outline.convexHull();
        this.geomCenter = this.outline.massCenter();

        console.log(this.corebound.box, "postUpdate");
    }

    flattenToRadical(){
        let radical = new Radical({});
        radical.body = this.body.flatten(e=>e.type != "Stroke", e=>e.body);
        radical.update();
        return radical;
    }
    

    draw(ctx, spec){
        if(spec.drawingAdditional){
            if(this.corebound && this.corebound.body.length > 0){
                ctx.fillStyle = "rgb(128, 64, 0, 0.3)";
                ctx.beginPath();
                ctx.moveToVec(this.corebound.body[0], spec.scale);
                for (let point of this.corebound.body)
                    ctx.lineToVec(point, spec.scale);
                ctx.fill();    
            }

            if (this.massCenter){
                ctx.strokeStyle = "black";
                ctx.circle(this.massCenter.mult(spec.scale), 5, true);
            }

        }

        for (let comp of this.body)
            comp.draw(ctx, spec);
    }
}
