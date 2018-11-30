import CurveStructureBase from "./CurveStructureBase.js";
import Vec from "./Vec.js";
import Box from "./Box.js";

function intersect(p1, p2, p3, p4){

    const e = 0.00000001;

    var det_s =  p1.sub(p3).cross(p3.sub(p4)),
        det_t = -p1.sub(p2).cross(p1.sub(p3)),
        det   =  p1.sub(p2).cross(p3.sub(p4));

    var s = det_s/det,
        t = det_t/det,
        p = p1.add(p2.sub(p1).mult(s)),
        q = p.copy();

    p.setAttr({intersection:true});
    q.setAttr({intersection:true});

    return {
        isCrossing: s > e && s < 1 - e && t > e && t < 1 - e,
        p:p, q: q,
        s:s, t: t,
        e:e
    };

}

function polygonArea(pointList){
    
    // 复制一个Array并且把第一个点追加至末尾使之成为闭合多边形
    var pointListCopy = pointList.slice(0).concat(pointList[0]);

    var area = 0;
    for (let i = 0; i < pointListCopy.length-1; i++)
        area += pointListCopy[i].cross(pointListCopy[i+1])/2;

    return Math.abs(area);
}

export default class Curve extends CurveStructureBase{
    constructor(spec){
        super(spec);
        this.type = "Curve";
        
        this.body = [new Vec()];
        for (let elem of spec.body){
            this.body.push(this.body.last().polar(elem));
        }

        this.update();
    }

    static intersect(c1, c2){
            
        for (var i = 0; i < c1.body.length-1; i++)
        for (var j = 0; j < c2.body.length-1; j++){
            var inter = intersect(c1.body[i], c1.body[i+1], c2.body[j], c2.body[j+1]);
            if(inter.isCrossing) {
                c1.body.splice(i+1, 0, inter.p)
                c2.body.splice(j+1, 0, inter.q);
                return;
            } else {
                if (i == 0 && inter.s < inter.e && inter.s > -inter.e ) c1.body[i].setAttr({intersection:true});
                if (i == c1.body.length-2 && inter.s < 1+inter.e && inter.s > 1-inter.e ) c1.body[i+1].setAttr({intersection:true});
                
                if (j == 0 && inter.t < inter.t && inter.t > -inter.t ) c2.body[j].setAttr({intersection:true});
                if (j == c2.body.length-2 && inter.t > 1+inter.t && inter.t > 1-inter.t ) c2.body[j+1].setAttr({intersection:true});
                
            }
        }
    }

    deintersect(){

        // 头尾因为相接而标注为intersection的直接抹去
        if(this.body.length > 0){
            this.body[0].attr.intersection = undefined;
            this.body.last().attr.intersection = undefined;
        }

        // 中间因为交叉而插入的intersection点在这里被移除
        if (this.body.length > 1)
            for (let i = 1; i < this.body.length-1; i++){

                if (this.body[i].attr.intersection){
                    this.body.splice(i, 1);
                    i--;
                }
            }
    }

    head(){
        return this.body[0];
    }

    tail(){
        return this.body.last();
    }

    trans(vec){
        for (let elem of this.body) elem.iadd(vec);
        this.update();
    }

    rotate(angle){
        for (let i = 1; i < this.body.length; i++){
            this.body[i].isub(this.body[0]);
            this.body[i].irotate(angle);
            this.body[i].iadd(this.body[0]);
        }
        this.update();
    }

    scale(ratio){
        for (let elem of this.body){
            let vec = elem.sub(this.body[0]);
            elem.isub(vec);
            elem.iadd(vec.mult(ratio));
        }
        this.update();
    }

    curl(curvature){
        if(this.body.length > 1)
            for (let i = 1; i < this.body.length; i++){
                this.body[i].isub(this.body[i-1]);
                this.body[i].irotate(curvature*(i-1));
                this.body[i].iadd(this.body[i-1]);
            }
        this.update();
    }

    length(){
        let mag = 0;
        for (let i = 1; i < this.body.length; i++)
            mag += this.body[i].sub(this.body[i-1]).mag();
        return mag;
    }

    modify(prog){

        if (prog === undefined) prog = this.prog;

        for (let instr of prog)
            for (let method in instr)
                instance[method](this.getVariable(instr[method]));

        this.update();
    }


    update(){        
        // console.log(this.postUpdate, this.type);
        if (this.preUpdate) this.preUpdate();

        if (this.duringUpdate) this.duringUpdate();

        if(this.body.length > 1)
            this.box = new Box(this.body[0], this.body[1]);
            for(let i = 1; i < this.body.length; i++)
                this.box.iunion(this.body[i]);

        if(this.postUpdate) this.postUpdate();
    }


    at(ithRatio){

        var ratioLen   = ithRatio * this.length(),
            currLen    = 0,
            currPoint  = null,
            currVec    = null,
            currSegLen = 0;

        for(var i = 0; i < this.body.length-1; i++){
            
            currPoint  = this.body[i],
            currVec    = this.body[i+1].sub(currPoint),
            currSegLen = currVec.mag();

            if (currLen + currSegLen >= ratioLen) break;
            currLen += currSegLen;
        }

        let segRatio = (ratioLen - currLen)/currSegLen;
        return currPoint.add(currVec.mult(segRatio));
    }

    draw(ctx, strokeWidth, scale){
        
        ctx.beginPath();
        ctx.moveToVec(this.body[0], scale);
        for (var curr = 0; curr < this.body.length; curr++) {
        
            // if (this.body.length - currSeg > 2){
            //     ctx.bezierCurveToVec(this.body.slice(currSeg, currSeg+3).map(e=>e.tail), scale);
            //     currSeg += 2;
            // } else {
                ctx.lineToVec(this.body[curr], scale);
            // }
        }
        ctx.stroke();
        
    }
}
