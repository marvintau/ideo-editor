import CurveStructureBase from "./CurveStructureBase.js";
import Vec from "./Vec.js";
import Box from "./Box.js";


export default class Curve extends CurveStructureBase{
    constructor(spec){
        super(spec);
        this.type = "Curve";
        
        this.body = [new Vec()];
        this.body[0].setAttr({original:true});

        if(spec){
            if (spec.body) for (let elem of spec.body){
                this.body.push(this.body.last().polar(elem));
                this.body.last().setAttr({original:true});
            } else if (Array.isArray(spec))
                this.body = spec;
        }        

        this.update();
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

    scale(ratio, from, to){

        if (to === undefined) to = this.body.length;
        if (from === undefined) from = 0;

        // let anchor = this.body[from];

        for (let i = from + 1; i < to; i++){
            let vec = this.body[i].sub(this.body[i-1]),
                inc = vec.mult(ratio).sub(vec);
            for (let j = i; j < this.body.length; j++) this.body[j].iadd(inc);
        }
        this.update();
    }

    curl(curvature){
        if(this.body.length > 1)
            for (let i = 1; i < this.body.length; i++){
                this.body[i].isub(this.body[i-1]);
                this.body[i].irotate(curvature*(i-1)*(i-1));
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
                switch(method){
                    case "scale":
                        this.scale(instr[method].ratio, instr[method].from, instr[method].to);
                }

        this.update();
    }


    update(){        
        if (this.preUpdate) this.preUpdate();

        if (this.duringUpdate) this.duringUpdate();

        if(this.body.length > 1)
            this.box = new Box(this.body[0], this.body[1]);
            for(let i = 1; i < this.body.length; i++)
                this.box.iunion(this.body[i]);

        if(this.postUpdate) this.postUpdate();
    }

    convexHull() {

        const cross = (o, a, b) => a.sub(o).cross(b.sub(o)),
              check = (prev, curr) => cross(prev[prev.length - 2], prev[prev.length - 1], curr);
    
        this.body.sort(function(a, b) {
           return a.x == b.x ? a.y - b.y : a.x - b.x;
        });
     
        var lower = [];
        for (var i = 0; i < this.body.length; i++) {
            while(lower.length >= 2 && check(lower, this.body[i]) <= 0) lower.pop();
            lower.push(this.body[i]);
        }
     
        var upper = [];
        for (var i = this.body.length - 1; i >= 0; i--) {
            while(upper.length >= 2 && check(upper, this.body[i]) <= 0) upper.pop();
            upper.push(this.body[i]);
        }
     
        upper.pop();
        lower.pop();
        this.body = lower.concat(upper);
        this.update();
    }
    
    area(){
        if(this.body.length > 3){
            var pointListCopy = this.body.concat(this.body[0].copy());
            return pointListCopy.part(2, 1).map(p => p[0].cross(p[1])/2).sum();
        } else {
            return 0;
        }
    }

    massCenter(){

        if (this.body.length > 2){
            var pointListCopy = this.body.concat(this.body[0].copy());
        
            let momentX = pointListCopy.part(2, 1).map(p => (p[0].x+p[1].x) * p[0].cross(p[1])/6).sum(),
                momentY = pointListCopy.part(2, 1).map(p => (p[0].y+p[1].y) * p[0].cross(p[1])/6).sum(),
                area = this.area();
        
            return new Vec(momentX/area, momentY/area);
        } else {
            console.error("massCenter needs at least two points over the curve");
        }

    }

    includes(p){
    
        var points = this.body.concat(this.body[0].copy());

        const cross = (p, a, b) => a.sub(p).cross(b.sub(p)),
              first = cross(p, points[0], points[1]);
        
        for (let i = 1; i < points.length-1; i++)
            if (first * cross(p, points[i], points[i+1]) <= 0)
                return false;
        
        return true;
    }

    at(ratio){

        var ratioLen   = ratio * this.length(),
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

    insertAt(ratio, attr){

        var ratioLen   = ratio * this.length(),
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

        let segRatio = (ratioLen - currLen)/currSegLen,
            point = currPoint.add(currVec.mult(segRatio));

        if (attr !== undefined) point.setAttr(attr);

        this.body.splice(i+1, 0, point);

        return point;
    }

    draw(ctx, strokeWidth, scale){
        
        let points = this.body.filter(e=>e.attr.original);

        for (var curr = 0; curr < points.length;) {
        
            if (points.length - curr > 3){
                ctx.bezierCurveToVec(points.slice(curr+1, curr+4), scale);
                curr += 4;
            } else {
                ctx.lineToVec(points[curr], scale);
                curr += 1;
            }
        }

        
    }
}
