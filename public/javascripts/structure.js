class Vec{
    /**
     * Simple Vector class.
     * 
     * @param {number} x x coordinate. When y is undefined, x denotes the angle of the desired vector.
     * @param {number} y y coordinate.
     */
    constructor(x, y){
        if (y === undefined){
            if(x === undefined) {
                this.x = 0;
                this.y = 0;
            } else {
                this.x = Math.cos(x*Math.PI/180);
                this.y = Math.sin(x*Math.PI/180);
            }
        } else {
            this.x = x;
            this.y = y;
        }
    }

    add(vec){
        return new Vec(this.x + vec.x, this.y + vec.y);
    }

    sub(vec){
        return new Vec(this.x - vec.x, this.y - vec.y);
    }

    mult(vec){
        if(vec.x === undefined){
            return new Vec(this.x * vec, this.y * vec);
        } else {
            return new Vec(this.x * vec.x, this.y * vec.y);
        }
    }

    head(vec){
        return new Vec(Math.min(this.x, vec.x), Math.min(this.y, vec.y));
    }

    tail(vec){
        return new Vec(Math.max(this.x, vec.x), Math.max(this.y, vec.y));
    }

    copy(){
        return new Vec(this.x, this.y);
    }

}

class Box{

    /**
     * Box for representing bounding box.
     * @param {Vec} head top-left coordinate
     * @param {Vec} tail bottom-right coordinate
     */
    constructor(head, tail){
        this.head = head.copy();
        this.tail = tail.copy();
    }

    union(box){

        var head = this.head.head(box.head),
            tail = this.tail.tail(box.tail);

        return new Box(head, tail);

    }

    copy(){
        return new Box(this.head.copy(), this.tail.copy());
    }

    center(){
        return this.head.add(this.tail).mult(new Vec(0.5, 0.5));
    }
}


class CurveStructureBase{ 
    constructor(body){
        // console.log(this.constructor.name, body);
        this.body = (body === undefined) ? [] : body.map(seg => seg.copy());
        this.head = new Vec();
        this.progs = [];
        
    }

    modify(progs){
        
        if(progs === undefined) progs = this.progs;

        for (let prog of progs){

            if(prog.ith === undefined){
                this.body.forEach(c => c.modify(prog.progs));
            } else {
                this.body[prog.ith].modify(prog.progs);
            }
        }

        this.update();
    }

    update(){

        // first deal with the first component. 
        if(this.body.length > 0){
            this.body[0].head = this.head.copy();
            this.body[0].update();
            this.box = this.body[0].box;
        }
        
        if(this.body.length > 1){
            for(let i = 1; i < this.body.length; i++){
                try{
                    this.body[i].head = this.body[i-1].tail.copy();
                    this.body[i].update();
                    this.tail = this.body[i].tail;
                    this.box = this.box.union(this.body[i].box);
                } catch(TypeError){
                    console.log(this.body[i-1]);
                }
            }    
        }
    }

    translate(increment){
        this.head.x += increment.x;
        this.head.y += increment.y;
    }

    copy(){
        
        var newCurve = new this.constructor();
        newCurve.body = this.body.map(seg => seg.copy());
        newCurve.head = this.head.copy();

        return newCurve;
    }

    draw(ctx){
        
        for(let component of this.body){
            component.draw(ctx);
        }

        // ctx.fillRect(this.head.x-2, this.head.y-2, 4, 4);
        var size = this.box.tail.sub(this.box.head);
        // ctx.rect(this.box.head.x, this.box.head.y, size.x, size.y);
        // ctx.stroke();
    }

    transCenter(){
        this.head = this.head.add((new Vec(300, 300)).sub(this.box.center()));
        this.update();
    }
}

class Seg extends CurveStructureBase{

    constructor(spec){
        
        super();
        this.len = spec.len;
        this.ang = spec.ang;
        this.head = new Vec();
        this.update();
    }

    copy(){
        return new Seg({len:this.len, ang:this.ang, head:this.head});
    }

    update(){

        var angleVec = new Vec(this.ang);
        this.tail = this.head.add(angleVec.mult(this.len));

        var boxHead = this.head.head(this.tail),
            boxTail = this.tail.tail(this.head);

        this.box  = new Box(boxHead, boxTail);
    }

    draw(ctx){

        ctx.beginPath();
        ctx.moveTo(this.head.x, this.head.y);
        ctx.lineTo(this.tail.x, this.tail.y);
        ctx.stroke();

        // var size = this.box.tail.sub(this.box.head);
        // ctx.rect(this.box.head.x, this.box.head.y, size.x, size.y);
        // ctx.stroke();
    }

    modify(progs){

        if(progs === undefined) progs = this.progs;

        for(let prog of progs){
            switch(Object.keys(prog)[0]){
                case "trans":
                    this.head.x += prog.trans.x;
                    this.head.y += prog.trans.y;    
                    break;
                case "rotate":
                    this.ang += prog.rotate.theta;
                    break;
                case "stretch":
                    this.len *= prog.stretch.ratio;
                    break;
            }    
        }

        this.update();
    }
}

function testSeg(){
    var ctx = document.getElementById("canvas").getContext("2d");
    var body = [...Array(20).keys()].map((e) => new Seg({len:10, ang:0}));
    for(let i = 0; i < 20; i++){
        body[i].progs = [
            {"trans":{x:10*i, y:10*i}},
            {"rotate":{"theta":2*i}},
            {"stretch":{"ratio":i}}
        ];
        body[i].modify();
        body[i].draw(ctx, body[i].head);
    }
    
    console.log(body);
}

class Curve extends CurveStructureBase{
    constructor(spec){
        var body = (spec != undefined) ? spec.body.map(seg => new Seg(seg)) : [];

        super(body);

        this.update();
        // console.log(this.body);
    }

    at(ithRatio){
        
        var point = this.head.copy();

        var currSeg;
        
        var totalLen = this.body.reduce((sum, e) => sum + e.len, 0), 
            ratioLen = ithRatio * totalLen,
            currLen  = 0;

        for(let i = 0; i < this.body.length-1; i++){

            currSeg =  this.body[i];
            currLen += this.body[i].len;
            point = point.add((new Vec(currSeg.ang)).mult(currSeg.len));

            if (this.body[i+1].len + currLen > ratioLen) break;
        }

        point = point.add((new Vec(currSeg.ang)).mult(ratioLen - currLen));

        return point;
    }
}

/**
 * CompoundCurve is a higher level wrapper that provides an API to locate the
 * intersection point with ratio over one Curve Segment. Typically, a CompoundCurve
 * is what we called a stroke.
 */
class CompoundCurve extends CurveStructureBase{

    constructor(body) {
        super(body);
        this.update();
    }

    at(ithRatio, ithCurve){
        return this.body[ithCurve].at(ithRatio);
    }
}

function testCompoundCurve(){

    var edges = 30,
        edgeLen = 2,
        arcs = 5;

    var segSpecs = {body:[...Array(edges+1).keys()].map((e, i) => ({len:edgeLen/Math.sin(Math.PI/(360/edges)), ang:(180/edges*i)}))};
    // var segSpecs = {body:[...Array(edges+1).keys()].map((e, i) => ({len:100, ang:(180/edges*i)}))};

    var curves = [...Array(arcs).keys()].map((e, i) => new Curve(segSpecs));
    var compoundCurve = new CompoundCurve(curves);
    console.log(compoundCurve);
    compoundCurve.progs = [...Array(arcs).keys()].map((e, i) => ({
        ith:i,
        progs:[{ // curve level
            progs:[{ // seg level
                rotate:{theta:360/arcs*i}
            }]
        }]
    }))
    
    compoundCurve.modify();
    compoundCurve.transCenter();

    var ctx = document.getElementById("canvas").getContext("2d");
    // ctx.translate(300, 300);
    compoundCurve.draw(ctx);    

    var box = compoundCurve.box;
    // console.log(box);
    ctx.rect(box.head.x, box.head.y, box.tail.x-box.head.x, box.tail.y-box.head.y);
    ctx.stroke();
}

/**
 * CrossedStrokeSet is such a structure that, it contains several strokes, including
 * their intersecting information, but not aligning. like 戈, 匕. 
 * 
 */
class CrossedStrokeSet extends CurveStructureBase{
    constructor(strokes, head, spec) {
        super(CompoundCurve, strokes, head, spec);

    }
}

class Radical{

    /**
     * 初期化
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

        this.body = [];
        for(let radical of radical_list) this.add(radical);
    }


    /**
     * get_compound_body 得到复合笔画的线段
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

        for(let component_spec of spec.body){

            var curve = this.grand_radical_ref[component_spec.stroke].copy(component_spec);

            Array.prototype.push(compound_curve.body, curve.body);
            
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
                this.grand_radical_ref[name] = new Radical(radical_spec_sofar, spec.body, this.grand_radical_ref);
                break;
        }
    }

    draw(){
        
        var ctx = document.getElementById("canvas").getContext("2d");
        
        for(let component of this.body){
            console.log(component);
            component.draw(ctx);
        }
    }

    add(radical_desc){

        // supposed to create an instance, rather than directly refer it.
        var radical = this.grand_radical_ref[radical_desc.name];

        if (radical_desc.conds !== undefined){
            for (let method in radical_desc.conds){
                // console.log("methods", method);
                // radical = this[method](conditions[method], radical);
            }
        }

        this.body = this.body.concat(radical.body);
    }


}
