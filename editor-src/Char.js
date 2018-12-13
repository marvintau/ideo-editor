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
        this.modify();
    }

    /**
     * 这里的cross和Radical中的基本一样，不同的是通过笔画的相对位置确定两个
     * 组件（而不是笔画）的相对位置。这个不同是通过Radical中的
     */
    splice(spec){

        if (spec.self && spec.dest){
            var pointDest = this.body[spec.dest.ith].at(spec.dest),
                pointSelf = this.body[spec.self.ith].at(spec.self);

            console.log(this.body[spec.dest.ith].at(spec.dest), "splice");
            this.body[spec.self.ith].trans(pointDest.sub(pointSelf));
         }
    }

    place(spec){

        if (spec.self && spec.dest){
            var self = this.body[spec.self.ith],
                dest = this.body[spec.dest.ith],
                selfCoreArea = self.corebound.area(),
                destCoreArea = dest.corebound.area(),
                // selfRatio = Math.sqrt(selfCoreArea / destCoreArea),
                // destRatio = Math.sqrt(destCoreArea / selfCoreArea),
                // maxRatio = Math.max(selfRatio, destRatio);
                maxRatio = 1.2;
            
            console.log(selfCoreArea, destCoreArea, "area");

            var transVec = dest.massCenter;
            switch(spec.pos){
                case 0:
                    self.stretch(new Vec(0.65, 1));
                    dest.stretch(new Vec(0.65, 1));
                    
                    for (let k in self.outliers)
                        for (let curve of self.outliers[k]){
                            if (k == "r") curve.scale(maxRatio);
                            if (k == "l") curve.scale(1/maxRatio/maxRatio);
                        }

                    for (let k in dest.outliers)
                        for (let curve of dest.outliers[k]){
                            if (k == "l") curve.scale(maxRatio);
                            if (k == "r") curve.scale(1/maxRatio/maxRatio);
                        }
                                

                    transVec.x += self.corebound.box.size().add(dest.corebound.box.size()).mult(0.5).x-2.5;
                    transVec = transVec.sub(self.massCenter);
                    break;
                case 1:
                    self.stretch(new Vec(1, 0.65));
                    dest.stretch(new Vec(1, 0.65));
                    transVec.y += self.box.size().add(dest.box.size()).mult(0.5).y;
                    transVec = transVec.sub(self.massCenter);
                    break;
            }

            this.body[spec.self.ith].trans(transVec);
        }
    }

    postUpdate(){
        if(!this.body.some(e => e.corebound === undefined)){
            let coreboundPoints = [].concat(...this.body.map(elem => elem.corebound.body));
            this.corebound = new Curve(coreboundPoints);
            this.corebound.convexHull();
            this.massCenter = this.corebound.massCenter();
    
            let outlinePoints = [].concat(...this.body.map(elem => elem.outline.body));
            this.outline = new Curve(outlinePoints);
            this.outline.convexHull();
            this.geomCenter = this.outline.massCenter();
        }
    }

    draw(ctx, strokeWidth, scale){
        if(this.corebound && this.corebound.body.length > 0){
            ctx.fillStyle = "rgb(128, 64, 0, 0.3)";
            ctx.beginPath();
            ctx.moveToVec(this.corebound.body[0], scale);
            for (let point of this.corebound.body)
                ctx.lineToVec(point, scale);
            ctx.fill();    
        }

        if (this.massCenter){
            ctx.strokeStyle = "black";
            ctx.circle(this.massCenter.mult(scale), 5, true);
        }

        for (let comp of this.body)
            comp.draw(ctx, strokeWidth, scale);

    }
}
