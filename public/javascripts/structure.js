class Box{
    constructor(x, y, h, w){
        this.x = x;
        this.y = y;
        this.h = h;
        this.w = w;
    }

    union(box){

        var x = Math.min(this.x, box.x),
            y = Math.min(this.y, box.y),
            w = Math.max(this.x + this.w, box.x + box.w) - x,
            h = Math.max(this.y + this.h, box.y + box.h) - y;
        
        return new Box(x, y, w, h);
    }

    copy(){
        return new Box(this.x, this.y, this.h, this.w);
    }
}

class Seg{
    constructor(len, angle, anchor){
        
        this.len = len;
        this.ang = angle;

        this.anchor = (anchor != undefined) ? anchor : {x:0, y:0};

    }

    copy(){
        return new Seg(this.len, this.ang, this.anchor);
    }

    vec(){
        return {
            x: this.len*Math.cos(this.ang*Math.PI/180),
            y: this.len*Math.sin(this.ang*Math.PI/180)
        }
    }

    end(){
        var vec = this.vec();

        return {
            x: this.anchor.x + vec.x,
            y: this.anchor.y + vec.y
        }
    }

    box(){
        var end = this.end();

        var minx = Math.min(this.x, end.x),
            miny = Math.min(this.y, end.y),
            maxx = Math.max(this.x, end.x),
            maxy = Math.max(this.y, end.y);

        return new Box(minx, miny, maxx, maxx - minx, maxy-miny);
    }

    draw(ctx, anchor){

        var width  = ctx.canvas.width,
            height = ctx.canvas.height,
            vec    = this.vec();

        var endx = anchor.x + vec.x,
            endy = anchor.y + vec.y;

        ctx.beginPath();
        ctx.moveTo(anchor.x * width, anchor.y * height);
        ctx.lineTo(endx * width, endy * height);
        ctx.stroke();
        return {x:endx, y:endy}

    }
}

class CurveStructureBase { 
    constructor(sub_level_constructor, segs, anchor, spec){
        this.components = (segs === undefined) ? [] : segs.map(seg => seg.copy(spec));
        this.anchor = (anchor === undefined) ? {x:0, y:0} : anchor;
        
        // this.canvas = document.getElementById("canvas")
        // this.ctx = this.canvas.getContext("2d")
    }

    translate(increment){
        this.anchor.x += increment.x;
        this.anchor.y += increment.y;
    }

    copy(spec){
        
        var newCurve = new this.constructor();
        newCurve.components = this.components.map(seg => seg.copy());
        newCurve.anchor = {x:this.anchor.x, y:this.anchor.y};

        return newCurve;
    }

    draw(ctx, startPoint){

        if(startPoint === undefined) startPoint = this.anchor;
        
        for(let component of this.components){
            startPoint = component.draw(ctx, startPoint);
        }
        return startPoint;
    }

    box(){
        var box = this.components[0].box().copy();
        for(let i = 1; i < this.components.length; i++){
            box = box.union(this.components[i].box());
        }
        return box;
    }
}

class Curve extends CurveStructureBase{
    constructor(spec){
        var segs = (spec != undefined) ? spec.segs.map(seg => new Seg(seg.len, seg.ang)) : [],
            anchor = {x:0, y:0};

        for(let i = 1; i < segs.length; i++){
            var vec = segs[i-1].vec();
            segs[i].anchor = {
                x:segs[i-1].anchor.x + vec.x,
                y:segs[i-1].anchor.y + vec.y
            }
        }
        super(Seg, segs, anchor, spec);
    }

    at(ithRatio, ithSeg){
        
        var point = {x:0, y:0};
        point.x = this.anchor.x;
        point.y = this.anchor.y;

        var currSeg;
        if(ithSeg === undefined){

            var totalLen = this.components.reduce((sum, e) => sum + e.len, 0), 
                ratioLen = ithRatio * totalLen,
                currLen  = 0;

            for(let i = 0; i < this.components.length-1; i++){

                currSeg =  this.components[i];
                currLen += this.components[i].len;
                point.x += currSeg.len * Math.cos(currSeg.ang*Math.PI/180);
                point.y += currSeg.len * Math.sin(currSeg.ang*Math.PI/180);

                if (this.components[i+1].len + currLen > ratioLen) break;
            }
    
            point.x += (ratioLen - currLen) * Math.cos(currSeg.ang*Math.PI/180);
            point.y += (ratioLen - currLen) * Math.sin(currSeg.ang*Math.PI/180);            

        } else {

            // typically not going to use ithSeg (this) routine

            for(let i = 0; i < ithSeg; i++){
                currSeg = this.components[i];
                ithStartPoint.x += currSeg.len * Math.cos(currSeg.ang*Math.PI/180);
                ithStartPoint.y += currSeg.len * Math.sin(currSeg.ang*Math.PI/180);
            }

            point.x += ithRatio * currSeg.len * Math.cos(currSeg.ang*Math.PI/180);
            point.y += ithRatio * currSeg.len * Math.sin(currSeg.ang*Math.PI/180);            
        }

        return point;
    }
}

// var ctx = document.getElementById("canvas").getContext("2d");
// var seg_spec = {segs:[...Array(20).keys()].map((e, i) => ({len:0.02, ang:i*8}))};
// var curve = new Curve(seg_spec);
// curve.draw(ctx);


class CompoundCurve extends CurveStructureBase{

    constructor(curves, anchor, spec) {
        super(Curve, curves, anchor, spec);
    }

    at(ithRatio, ithCurve){
        return this.components[ithCurve].at(ithRatio);
    }
}

// var seg_spec = {segs:[...Array(20).keys()].map((e, i) => ({len:0.01, ang:i*8}))};
// var curves = [new Curve(seg_spec), new Curve(seg_spec), new Curve(seg_spec)];
// var comp_curve = new CompoundCurve(curves);

// var ctx = document.getElementById("canvas").getContext("2d");
// comp_curve.draw(ctx);

class Radical{

    /**
     * init 初始化部首
     * 
     * 在这里比较tricky的部分是radical_spec_sofar。完整的radical_spec
     * 是一个体积巨大的JSON对象，将它遍历一遍会非常耗时。在递归的部首查询中，
     * 如果每次都从这个表中查询当前部首引用其他部首的情况就会非常的慢，所以我
     * 们通过创建radical_spec_sofar，使得在递归调用中仅查询被当前部首所引
     * 用的一切笔画或部首，就可以大大减少遍历表的时间。
     * 
     * @param {object} radical_spec 部首的描述，包括部首的名称等
     * @param {list} radical_list 部首列表
     */

     constructor(radical_spec, radical_list, grand_radical_ref){

        this.grand_radical_ref = grand_radical_ref;

        var radical_spec_sofar = {};

        // 对于所有出现在引用名单里的
        
        for(let name in radical_spec){
            if(this.grand_radical_ref[name] === undefined){
                this.register_radical(name, radical_spec[name], radical_spec_sofar);
            }
            radical_spec_sofar[name] = radical_spec[name];
        }

        this.components = [];
        for(let radical of radical_list){

            var radical_ref = this.grand_radical_ref[radical.name];
        }
    }


    /**
     * get_compound_segs 得到复合笔画的线段
     * 
     * 这是一个辅助函数，因为复合笔画中并不直接描述笔画的线段，而是引用了简单笔画的
     * 名称。需要通过名称来找到简单笔画的线段，再拼接成由线段构成的复合笔画。也就是
     * 说，无论是简单笔画，还是复合笔画。经过这步操作后的复合笔画会表示为：
     * 
     * [[seg1, seg2, seg3, ...], ..., [seg4, seg5, seg6], ...]
     * 
     * 的形式，其中seg为
     * 
     * {len:xxx, ang:xxx}
     * 
     * @param {object}} spec 描述复合笔画specification
     */
    get_compound_curve(spec){

        var compound_curve = new CompoundCurve();

        for(let component_spec of spec.components){

            var curve = this.grand_radical_ref[component_spec.stroke].copy(component_spec);
            compound_curve.components = compound_curve.components.concat(curve.components);
            
        }
 
        return compound_curve;
    }


    /**
     * register_radical 设置笔画对象的引用
     * 
     * 这个函数是在初始化部首列表时引用的。
     * 
     * 在形成文字之前，需要先把所有的笔画，无论是简单笔画还是复合笔画都化为
     * 平面上的点序列。对于简单笔画，点序列将直接由radical_spec获得，对于
     * 复合笔画，则需要从RADICAL_REF，也就是已经形成的引用辞典中获取简单笔
     * 画。而对于这个部首列表所引用的其它部首，则需要递归地进入到部首内的部
     * 首列表，再重复本次过程。
     * 
     * 需要说明的是，RADICAL_REF是一个全局变量，如果一个部首没有在RADICAL_REF
     * 上登记，那么作为副作用，会将这个部首登记上去。
     * 
     * @param {string} name 笔画名称
     * @param {object} spec 笔画描述
     * @param {object}} radical_spec_sofar 到现在为止已有的笔画
     */
    register_radical(name, spec, radical_spec_sofar){
    
        switch(spec.type){

            case "simple":
                this.grand_radical_ref[name] = new CompoundCurve([new Curve(spec)]);
                break;

            case "compound":
                this.grand_radical_ref[name] = this.get_compound_curve(spec);
                break;

            case "radical":
                this.grand_radical_ref[name] = new Radical(radical_spec_sofar, spec.components, this.grand_radical_ref);
                break;
        }

    }

    add(radical){

        if (conditions !== undefined){
            for (let method in conditions){
                console.log("methods", method);
                // radical = this[method](conditions[method], radical);
            }
        }

        this.components = this.components.concat(radical.strokes);
    }

}
