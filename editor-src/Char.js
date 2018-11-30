import Radical from "./Radical.js";
import CurveStructureBase from "./CurveStructureBase.js";
import Vec from "./Vec.js";

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
            dest = this.body[spec.dest.ith];
        
        var transVec = dest.box.center();
        switch(spec.pos){
            case 0:
                self.stretch(new Vec(0.7, 1));
                dest.stretch(new Vec(0.7, 1));
                transVec.x += self.box.size().add(dest.box.size()).mult(0.55).x;
                transVec = transVec.sub(self.box.center());
                break;
            case 1:
                self.stretch(new Vec(1, 0.6));
                dest.stretch(new Vec(1, 0.6));
                transVec.y += self.box.size().add(dest.box.size()).mult(0.5).y;
                transVec = transVec.sub(self.box.center());
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

    draw(ctx, strokeWidth, scale){
        for (let comp of this.body)
            comp.draw(ctx, strokeWidth, scale);
    }
}