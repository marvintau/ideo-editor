import Vec from "./Vec.js";
import Box from "./Box.js";

export default class CurveStructureBase{ 

    /**
     * CurveStructureBase
     * A fundamental class to describe the curve and operations applied to it. Not supposed
     * to be used directly, should be extended instead.
     * 
     * @param {Class} Constructor The constructor that instantiates the elements in the body
     * @param {Object} spec the JSON Object specifies this curve structure.
     */
    constructor(spec){

        // console.log("CurveStructureBase", spec);
        this.type = "CurveStructureBase";
        this.prog = (spec=== undefined || spec.prog === undefined) ? [] : spec.prog;
        this.vars = (spec=== undefined || spec.vars === undefined) ? {} : spec.vars;
        this.box  = new Box();

    }
    getInnerRatio(ratio){

        if(this.body.length < 1) throw "empty structure has no inner ratio";

        var total = ratio * this.len(),
            curr  = 0,
            index = 0;

        if(ratio < 0) return {
            index: 0,
            ratio: total / this.body[0].len()
        };
        
        for (; index < this.body.length; index++)
            if (curr + this.body[index].len() > total) break;
            else curr += this.body[index].len();

        return {
            index : index,
            ratio: (total - curr) / this.body[index].len()
        };
    }

    /**
     * 
     * @param {number} ratio ratio to scale
     */
    scale(ratio){
        for (let elem of this.body) elem.scale(ratio);
        this.update();
    }

    /**
     * trans
     * @param {Vec} vec vector to translate.
     */
    trans(vec){
        for (let elem of this.body) elem.trans(vec);
        this.update();
    }

    length(){
        return this.body.reduce((l, e) => l + e.length(), 0);
    }

    stretch(ratioVec){

        let center = this.box.center(),
            points = this.flatten();
        
            
        for (let p of points){
            p.iscale(ratioVec, center);
            p.iscale(ratioVec, center);
        }
        
        this.update();
    }


    /**
     * get variable from variable table.
     * if the parameter is a number, then just return itself.
     * if the parameter is a string, then first treat it as a
     * key of variable table and find its value. If it's not
     * a number, then evaluate it until a number is get.
     * 
     * @param {oject} item item can be either form of number, string and object.
     */
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
     * modify: operate the curve object with given instructions.
     * 
     * 
     * @param {Array} prog the programmes to be applied over different level of curve structure.
     * @param {Array} vars  variables referred in prog
     */
    modify(prog, vars){

        // Modify使用外部的variables，如果存在重名的情况则本实例中的
        // vars中的同名变量会被覆盖掉。
        if (vars === undefined) vars = this.vars; else vars = Object.assign(this.vars, vars);
        if (prog === undefined) prog = this.prog;

        // 先对本实例所有的组件应用modify操作，就是说如果组件本身含有prog会
        // 先被执行。
        for (let elem of this.body) elem.modify(undefined, vars);

        // 然后再执行本实例的prog
        for (let instr of prog){

            // 执行instr中的每个method，如果method中包含ith，则所有的操作将应用于它的第ith个组件。
            for (let method in instr){
                var instance = (instr.ith === undefined) ? this : this.body[instr.ith];

                if(method != 'prog'){
                    // console.log(instance, method, instance[method], "modify");
                    instance[method](this.getVariable(instr[method]));
                }else
                    instance.modify(instr[method]);
            }
            
        }

        this.update();
    }


    ith() {/*dummy*/}

    update(){        
        // console.log(this.postUpdate, this.type);
        if (this.preUpdate) this.preUpdate();
        for (let elem of this.body)
            elem.update();

        if (this.duringUpdate) this.duringUpdate();
        
        if(this.body.length > 0) this.box  = this.body[0].box;
        if(this.body.length > 1)
            for(let i = 1; i < this.body.length; i++)
                this.box.iunion(this.body[i].box);

        if(this.postUpdate) this.postUpdate();
    }

    flatten(){
        const stack = [...this.body];
        const res = [];

        while (stack.length) {
            const next = stack.pop();
            if (next.body)
                stack.push(...next.body);
            else
                res.push(next);
        }
        return res.reverse();
    }
}