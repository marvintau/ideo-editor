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
                        name: "ValueError", 
                        message: "item " + item + "is neither an existing variable or an expression" 
                    };
            case "object":

                if (Array.isArray(item)){
                    return item.map(function(e){return this.getVariable(e)}.bind(this));
                }
                else {
                    let o = {};
                    for (let key in item) o[key] = this.getVariable(item[key]);
                    return o;    
                }

            default :
                throw {name: "NotFound", message: "获取变量时遇到了一个不合适的值："+item}
        }
    }

    /**
     * modify: Interprets and executes the program in the char spec.
     * 
     * @param {Array} prog the programmes to be applied over different level of curve structure.
     * @param {Array} vars  variables referred in prog
     */
    modify(prog, vars){

        // Modify使用外部的variables，如果存在重名的情况则本实例中的
        // vars中的同名变量会被覆盖掉。
        if (vars === undefined) vars = this.vars; else vars = Object.assign(this.vars, vars);
        if (prog === undefined) prog = this.prog;

        /**
         * Run the program of the children of the current object.
         *
         * Note: flattenToRadical is a special process for Char. Since
         *       its recursive structure, the method like splice doesn't
         *       work with inner Char. thus we have to reform it into
         *       Radical, so that to do further modification.
         *
         *       There is no need to generalize this part, like traits
         *       or hook or postprocess or something, because only Char
         *       need this.
         */
        for (let i =0; i < this.body.length; i++) {
            this.body[i].modify(undefined, vars);
            if (this.body[i].type == "Char")
                this.body[i] = this.body[i].flattenToRadical();
            
        }

        /**
         * Run the program of the current object. Make sure that all 
         * the children has been modified at this point.
         */
        for (let instr of prog){

            for (let method in instr){

                /**
                 * If ith is specified in the instruction, then the 
                 * instance to deal with is this, otherwise the ith
                 * child.
                 */
                var instance = (instr.ith === undefined) ? this : this.body[instr.ith];

                /**
                 * Here we encounter a problem: for the method in the
                 * class that extended from CurveStructureBase, modify
                 * is unable to 
                 */
                if(method != 'prog'){
                    try{
                        instance[method](this.getVariable(instr[method]));
                    } catch (e){
                        console.error(e, ith, method);
                    }
                }else
                    instance.modify(instr[method]);
            }
            
        }

        this.update();

        if (this.flatten().some(e => isNaN(e.x)))
            console.error(method, this, "NaN found after modification");
    }


    ith() {/*dummy*/}

    update(){        
        if(this.body.length > 0) this.box  = this.body[0].box;
        if(this.body.length > 1)
            for(let i = 1; i < this.body.length; i++)
                this.box.iunion(this.body[i].box);

        if(this.postUpdate) this.postUpdate();
    }

    flatten(){
        return this.body.flatten(next=>next.body, next=>next.body);
    }
}
