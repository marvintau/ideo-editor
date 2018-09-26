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

class CurveStructureBase { 
    constructor(sub_level_constructor,segs, anchor, spec){
        this.components = (segs === undefined) ? [] : segs.map(seg => seg.copy(spec));
        this.anchor = (anchor === undefined) ? {x:0, y:0} : anchor;
    }

    modify(spec){
        if (spec.stretch) this.stretch(spec.stretch);
        if (spec.rotate)  this.rotate(spec.rotate);
    }

    stretch(ratio, ith){
        if(ith != undefined){
            this.components[ith].stretch(ratio);
        } else for(let i in this.components){
            this.components[i].stretch(ratio);
        }
    }

    rotate(angle, ith){
        if(ith != undefined){
            this.components[ith].rotate(angle);    
        }else for(let i in this.components){
            this.components[i].rotate(angle);
        }
    }

    translate(increment){
        this.anchor.x += increment.x;
        this.anchor.y += increment.y;
    }

    copy(spec){
        
        var newCurve = new this.constructor();
        newCurve.components = this.components.map(seg => seg.copy());
        newCurve.anchor = {x:this.anchor.x, y:this.anchor.y};

        if(spec != undefined){
            newCurve.modify(spec);
        }
        return newCurve;
    }
}

class Curve extends CurveStructureBase{
    constructor(spec){
        var segs = (spec != undefined) ? spec.segs.map(seg => new Seg(seg.len, seg.ang)) : [],
            anchor = {x:0, y:0};
        super(Seg, segs, anchor, spec);
    }

    getPointAt(ithRatio, ithSeg){
        
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
                point.x += currSeg.len * Math.cos(currSeg.ang/180*Math.PI);
                point.y += currSeg.len * Math.sin(currSeg.ang/180*Math.PI);

                if (this.components[i+1].len + currLen > ratioLen) break;
            }
    
            point.x += (totalLen - currLen) * Math.cos(currSeg.ang/180*Math.PI);
            point.y += (totalLen - currLen) * Math.sin(currSeg.ang/180*Math.PI);            

        } else {

            // typically not going to use ithSeg (this) routine

            for(let i = 0; i < ithSeg; i++){
                currSeg = this.components[i];
                ithStartPoint.x += currSeg.len * Math.cos(currSeg.ang/180*Math.PI);
                ithStartPoint.y += currSeg.len * Math.sin(currSeg.ang/180*Math.PI);
            }

            point.x += ithRatio * currSeg.len * Math.cos(currSeg.ang/180*Math.PI);
            point.y += ithRatio * currSeg.len * Math.sin(currSeg.ang/180*Math.PI);            
        }

        return point;
    }
}


class CompoundCurve extends CurveStructureBase{

    constructor(segs, anchor, spec) {
        super(Curve, segs, anchor, spec);
    }

    modify(spec){

        if(spec.stretch)
            if(spec.stretch.constructor===Array) for (let i of spec.stretch)
                this.stretch(spec.stretch[i][0], spec.stretch[i][1]);
            else
                this.stretch(spec.stretch);

        if(spec.rotate)
            if(spec.rotate.constructor===Array) for (let i of spec.rotate)
                this.rotate(spec.rotate[i][0], spec.rotate[i][1]);
            else
                this.stretch(spec.rotate);
    }

    getPointAt(ithRatio, ithCurve){
        return this.components[ithCurve].getPointAt(ithRatio);
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

            if(curve.constructor === Curve){
                compound_curve.components.push(curve);
            } else if (curve.constructor === CompoundCurve){
                compound_curve.components = compound_curve.components.concat(curve.components);
            }
            
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
                this.grand_radical_ref[name] = new Curve(spec);
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

        // if (conditions !== undefined){
        //     for (let method in conditions){
        //         console.log("methods", method);
        //         radical = this[method](conditions[method], radical);
        //     }
        // }

        this.components = this.components.concat(radical.strokes);
    }

}
