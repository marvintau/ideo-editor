import Vec from "./Vec.js";
import Box from "./Box.js";
import Radical from "./Radical.js";

import {convexHull, polygonArea} from "./Core.js";

/**
 * Char 负责实现两种类型的数据，一种是Radical，一种是Char自己。
 * 如果将Radical视作部首，也就是没有组成它的部首，那么Char就是
 * 最终实现的字。
 * 
 * 需要注意的是，Char不能从CurveStructureBase继承
 */
export default class Char{
    
    constructor(spec){

        this.body = [];
        if (spec && spec.body) for (let elem of spec.body)
            if (elem.type === "Radical")
                this.body.push(new Radical(elem));
            else if (elem.type === "Char")
                this.body.push(new Char(elem));

        this.head = (spec=== undefined || spec.head === undefined) ? new Vec() : spec.head;
        this.prog = (spec=== undefined || spec.prog === undefined) ? [] : spec.prog;
        this.vars = (spec=== undefined || spec.vars === undefined) ? {} : spec.vars;
        this.box  = new Box();

        this.modify();
        this.toPointList();
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
        var selfBox = this.body[spec.self.ith].box,
            destBox = this.body[spec.dest.ith].box;
        
        var transVec = destBox.center();
        switch(spec.pos){
            case 0:
                transVec.x += selfBox.size().add(destBox.size()).mult(0.5).x;
                transVec = transVec.sub(selfBox.center());
                break;
            case 1:
                transVec.y += selfBox.size().add(destBox.size()).mult(0.5).y;
                transVec = transVec.sub(selfBox.center());
                break;
        }

        console.log(destBox.center(), selfBox.center().sub(destBox.center()),  "center");
        this.body[spec.self.ith].trans(transVec);
        this.update();
    }

    // 和CurveStrctureBase中的一样，具体看CurveStructureBase中的文档
    modify(prog, vars){

        if (vars === undefined) vars = this.vars; else vars = Object.assign(this.vars, vars);
        if (prog === undefined) prog = this.prog;

        for (let elem of this.body)
            elem.modify(undefined, vars);

        for (let instr of prog){

            for (let method in instr){
                var instance = (instr.ith === undefined) ? this : this.body[instr.ith];

                if(method != 'prog')
                    instance[method](this.getVariable(instr[method]));
                else
                    instance.modify(instr[method]);
            }
            
        }

        this.update();
    }

    /**
     * update更新每个子组件的head和tail，之所以和Radical一样的原因是，Char中的
     * 部件彼此不相接，而是通过cross和place实现的。
     */
    update(){        
        // first deal with the first component. 
        if(this.body.length > 0){
            this.body[0].update();
            this.box  = this.body[0].box;
        }
        if(this.body.length > 1){
            for(let i = 1; i < this.body.length; i++){
                this.body[i].update();
                this.box = this.box.union(this.body[i].box);
            }    
        }
    }

    getVariable(item){
        switch(typeof item){
            case "number" :
                return item;
            case "string" :
                if(item in this.vars)
                    if (typeof this.vars[item] === 'string' && this.vars[item].match(/@'\S*'/)){
                        let s = this.vars[item].replace(/@'([^']*)'/g, "this.getVariable('$1')");
                        return eval(s);    
                    } else 
                        return this.vars[item].val;
                else if(item.match(/@'\S*'/)){
                    let s = item.replace(/@'([^']*)'/g, "this.getVariable('$1')");
                    return eval(s);
                }
                else 
                    throw {
                        error: "ValueError", 
                        message: "item " + item + "is neither an existing variable or an expression" 
                    };
            case "object":
                let o = {};
                for (let key in item) o[key] = this.getVariable(item[key]);
                return o;
            default :
                console.error("Key not found", item, typeof item);
        }
    }

    /**
     * 转换为点序列，需要注意的是，Char的body可能是Radical也可能是Char，如果是
     * Radical则返回Stroke序列，Char则递归地call下一级的toPointList，因而也是
     * 一个Stroke序列。
     */
    toPointList(){

        this.points = [];
        for(let component of this.body){
            this.points = this.points.concat(component.toPointList());
        }

        this.core = {};
        let convex = [];
        for (let p of this.body) convex = convex.concat(p.core.convex);
        this.core.convex = convexHull(convex);
        this.core.area = polygonArea(this.core.convex);

        return this.points;
    }

    draw(ctx, strokeWidth, scale){
        for (let comp of this.body)
            comp.draw(ctx, strokeWidth, scale);
    }
}