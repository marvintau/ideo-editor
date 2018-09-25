class Seg{
    constructor(len, angle){
        this.len = len;
        this.ang = angle;
    }

    stretch(ratio){
        this.len *= ratio;
    }

    rotate(angle){
        this.ang += angle;
    }

    strotate(ratio, angle){
        this.len *= ratio;
        this.ang += angle;
    }

    copy(){
        return new Seg(this.len, this.ang);
    }
}

class Curve{
    constructor(segs, anchor, spec){
        this.segs = (segs === undefined) ? [] : segs.map(seg => new Seg(seg.len, seg.ang));
        this.anchor = (anchor === undefined) ? {x:0, y:0} : anchor;

        if(!(spec === undefined)) {
            if (spec.stretch) this.stretchAll(spec.stretch);
            if (spec.rotate)  this.rotateAll(spec.rotate);
        }
    }

    modify(spec){
        if (spec.stretch) this.stretchAll(spec.stretch);
        if (spec.rotate)  this.rotateAll(spec.rotate);
    }

    stretchAll(ratio){
        for(let i in this.segs){
            this.segs[i].stretch(ratio);
        }
    }

    stretch(ith, ratio){
        this.segs[ith].stretch(ratio);
    }

    rotateAll(angle){
        for(let i in this.segs){
            this.segs[i].rotate(angle);
        }
    }

    rotate(ith, angle){
        this.segs[ith].rotate(angle);
    }

    translate(increment){
        this.anchor.x += increment.x;
        this.anchor.y += increment.y;
    }

    getPointAt(ithRatio, ithSeg){
        
        var point = {x:0, y:0};
        point.x = this.anchor.x;
        point.y = this.anchor.y;

        var currSeg;
        if(ithSeg === undefined){

            var totalLen = this.segs.reduce((sum, e) => sum + e.len, 0), 
                ratioLen = ithRatio * totalLen,
                currLen  = 0;

            for(let i = 0; i < this.segs.length-1; i++){

                currSeg =  this.segs[i];
                currLen += this.segs[i].len;
                point.x += currSeg.len * Math.cos(currSeg.ang/180*Math.PI);
                point.y += currSeg.len * Math.sin(currSeg.ang/180*Math.PI);

                if (this.segs[i+1].len + currLen > ratioLen) break;
            }
    
            point.x += (totalLen - currLen) * Math.cos(currSeg.ang/180*Math.PI);
            point.y += (totalLen - currLen) * Math.sin(currSeg.ang/180*Math.PI);            

        } else {

            // typically not going to use ithSeg (this) routine

            for(let i = 0; i < ithSeg; i++){
                currSeg = this.segs[i];
                ithStartPoint.x += currSeg.len * Math.cos(currSeg.ang/180*Math.PI);
                ithStartPoint.y += currSeg.len * Math.sin(currSeg.ang/180*Math.PI);
            }

            point.x += ithRatio * currSeg.len * Math.cos(currSeg.ang/180*Math.PI);
            point.y += ithRatio * currSeg.len * Math.sin(currSeg.ang/180*Math.PI);            
        }

        return point;
    }

    copy(){
        var newCurve = new Curve();
        newCurve.segs = this.segs.map(seg => seg.copy());
        newCurve.anchor = {x:this.anchor.x, y:this.anchor.y};
        return newCurve;
    }
}


class CompoundCurve{

    constructor(curves, anchor, spec) {
        this.curves = (curves === undefined) ? [] : curves.map(curve => curve.copy());
        this.anchor = (anchor === undefined) ? {x:0, y:0} : anchor;

        if(!(spec === undefined)) {
            if (spec.stretch) this.stretchAll(spec.stretch);
            if (spec.rotate)  this.rotateAll(spec.rotate);
        }
    }

    modify(spec){

        if(spec.stretch)
            if(spec.stretch.constructor===Array) for (let i of spec.stretch)
                this.stretch(spec.stretch[i][0], spec.stretch[i][1]);
            else
                this.stretchAll(spec.stretch);

        if(spec.rotate)
            if(spec.rotate.constructor===Array) for (let i of spec.rotate)
                this.rotate(spec.rotate[i][0], spec.rotate[i][1]);
            else
                this.stretchAll(spec.rotate);
    }

    stretchAll(ratio){
        for(let i in this.segs){
            this.curves[i].stretch(ratio);
        }
    }

    stretch(ith, ratio){
        this.curves[ith].stretch(ratio);
    }

    rotateAll(angle){
        for(let i in this.segs){
            this.curves[i].rotate(angle);
        }
    }

    rotate(ith, angle){
        this.curves[ith].rotate(angle);
    }

    getPointAt(ithRatio, ithCurve){
        return this.curves[ithCurve].getPointAt(ithRatio);
    }

    copy(){
        var newCompoundCurve = new CompoundCurve();
        newCompoundCurve.curves = this.curves.map(curve => curve.copy());
        return newCompoundCurve;
    }
}

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
                this.set_radical_ref(name, radical_spec[name], radical_spec_sofar);
            }
            radical_spec_sofar[name] = radical_spec[name];
        }

        this.strokes = [];
        for(let radical of radical_list){

            var radical_ref = this.grand_radical_ref[radical.name];
            this.strokes = this.strokes.concat(radical_ref);
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

            var curve = this.grand_radical_ref[component_spec.stroke].copy();
            curve.modify(component_spec);

            if(curve.constructor === Curve){
                compound_curve.curves.push(curve);
            } else if (curve.constructor === CompoundCurve){
                compound_curve.curves = compound_curve.curves.concat(curve.curves);
            }
            
        }
 
        return compound_curve;
    }


    /**
     * set_radical_ref 设置笔画对象的引用
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
    set_radical_ref(name, spec, radical_spec_sofar){
    
        switch(spec.type){

            case "simple":
                this.grand_radical_ref[name] = new Curve(spec.segs);
                break;

            case "compound":
                this.grand_radical_ref[name] = this.get_compound_curve(spec);
                break;

            case "radical":
                var sub_radical_set= new Radical(radical_spec_sofar, spec.components, this.grand_radical_ref);
                this.grand_radical_ref[name] = sub_radical_set.strokes;
                break;
        }

    }

    add(radical){

        // if (conditions !== undefined){
        //     for (let method in conditions){
        //         console.log("methods", method);
        //         radical = this[method](conditions[method], radical);
        //     }
        // }

        this.strokes = this.strokes.concat(radical);
        
    }

}
