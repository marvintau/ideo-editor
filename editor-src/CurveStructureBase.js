import Vec from "./Vec.js";
import Box from "./Box.js";
import Raster from "./Raster.js";

export default class CurveStructureBase{ 

    /**
     * CurveStructureBase
     * A fundamental class to describe the curve and operations applied to it. Not supposed
     * to be used directly, should be extended instead.
     * 
     * @param {Class} Constructor The constructor that instantiates the elements in the body
     * @param {Object} spec the JSON Object specifies this curve structure.
     */
    constructor(Constructor, spec){

        // console.log("CurveStructureBase", spec);
        this.body  = (spec=== undefined || spec.body  === undefined) ? [] : spec.body.map(comp => new Constructor(comp));
        this.head  = (spec=== undefined || spec.head  === undefined) ? new Vec() : spec.head;
        this.progs = (spec=== undefined || spec.progs === undefined) ? [] : spec.progs;
        this.vars = (spec=== undefined || spec.vars === undefined) ? {} : spec.vars;
        this.box   = new Box();
    }

    /**
     * rotate
     * @param {number} theta angle to rotate.
     */
    rotate(theta){
        this.body.forEach(elem => elem.rotate(theta));
        this.update();
    }

    /**
     * 
     * @param {number} ratio ratio to scale
     */
    scale(ratio){
        this.body.forEach(elem => elem.scale(ratio));
        this.update();
    }

    /**
     * trans
     * @param {Vec} vec vector to translate.
     */
    trans(vec){
        this.head = this.head.add(vec);
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
        console.log("get variable: ", item, typeof item);
        switch(typeof item){
            case "number" :
                return item;
            case "string" :
                switch(typeof this.vars[item].val){
                    case "number":
                        return this.vars[item].val;
                    case "string":
                        return eval(this.vars[item].val.replace(/@'(.*)'/, "this.getVariable('$1')"));
                }
            case "object":
                for (let key in item) item[key] = this.getVariable(item[key]);
                return item;
            default :
                console.error("Key not found", item, typeof item);
        }
    }


    /**
     * modify: operate the curve object with given instructions.
     * 
     * 
     * @param {Array} progs the programmes to be applied over different level of curve structure.
     * @param {Array} vars  variables referred in progs
     */
    modify(progs, vars){

        // modify uses program and variables from external, but
        // if they are not given, the program and variables in
        // itself will be used.
        if (vars === undefined) vars = this.vars;
        if (progs === undefined) progs = this.progs;

        // Typically the component curve object contains program
        // when instantiating. So now we apply the programs like
        // initialization. According to this order of calling.
        // The lowest component will be applied operations first. 
        for (let elem of this.body) elem.modify();

        // Then apply the programs in current level.
        // the rule is, if prog.ith is specified, other methods
        // that will be executed at same level will not be
        // executed, except what specified in its progs, and vice
        // versa.

        console.log(progs);
        for (let instr of progs){

            // apply all operations at this level. this can be
            // considered as a short hand of specifying things
            // in progs list. saves some typing.
            for (let method in instr){
                var instance = (instr.ith === undefined) ? this : this.body[instr.ith];

                if(method != 'progs')
                    instance[method](this.getVariable(instr[method]));
                else
                    instance.modify(instr[method]);
            }
            
        }

        this.update();
    }

    ith() {/*dummy*/}

    update(){
        
        // first deal with the first component. 
        if(this.body.length > 0){
            this.body[0].head = this.head.copy();
            this.body[0].update();

            this.box  = this.body[0].box;
            this.tail = this.body[0].tail;
        }

        if(this.body.length > 1){
            for(let i = 1; i < this.body.length; i++){
                try{
                    this.body[i].head = this.body[i-1].tail.copy();
                    this.body[i].update();
                    this.tail = this.body[i].tail;
                    this.box = this.box.union(this.body[i].box);
                } catch(TypeError){
                    // console.error("update", this.box);
                }
            }    
        }
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
    }

    sample(step){
        var self = this;

        return this.body.reduce(function(list, comp){
            // console.error(this);
            return list.concat(comp.sample(step));
        }, []);
    }

    rasterize(raster){
        if (raster === undefined){
            var canvas = document.getElementById("canvas").getContext("2d"),
                height = canvas.height,
                width  = canvas.width;

            raster = new Raster(width, height);
        }
        
        for(let elem of this.body){
            raster = elem.rasterize(raster);
        }

        return raster;
    }
}