import Radical from "./Radical.js";
import CurveStructureBase from "./CurveStructureBase.js";
import Vec from "./Vec.js";
import Curve from "./Curve.js";

/**
 * Char 负责实现两种类型的数据，一种是Radical，一种是Char自己。
 * 如果将Radical视作部首，也就是没有组成它的部首，那么Char就是
 * 最终实现的字。
 * 
 * 需要注意的是，Char不能从CurveStructureBase继承
 */
export default class Char extends CurveStructureBase{
    
    constructor(spec){

        super(spec);

        this.body = [];
        if (spec && spec.body) for (let elem of spec.body)
            if (elem.type === "Radical")
                this.body.push(new Radical(elem));
            else if (elem.type === "Char")
                this.body.push(new Char(elem));

        this.type = "Char";
        this.modify();
    }

    /**
     * 这里的cross和Radical中的基本一样，不同的是通过笔画的相对位置确定两个
     * 组件（而不是笔画）的相对位置。这个不同是通过Radical中的
     */
    cross(spec){

        var pointDest = this.body[spec.dest.ith].at(spec.dest),
            pointSelf = this.body[spec.self.ith].at(spec.self);

        this.body[spec.self.ith].trans(pointDest.sub(pointSelf));
    }

    place(spec){

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

    intersect(){
        for (let elem of this.body) elem.intersect();
    }

    deintersect(){
        for (let elem of this.body) elem.deintersect();
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
        if(this.corebound){
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