import Vec from "./Vec.js";
import Box from "./Box.js";

export default class CurveStructureBase{ 
    constructor(body){
        // console.log(this.constructor.name, body);
        this.body = (body === undefined) ? [] : body.map(seg => seg.copy());
        this.head = new Vec();
        this.box  = new Box();
        this.progs = [];
        
    }

    modify(progs){
        
        if(progs === undefined) progs = this.progs;

        for (let prog of progs){

            // **VERY IMPORTANT**
            // Explain: if the member in prog is not ith or
            // progs, it is a method that will be applied over
            // the object. The method should be defined in the 
            // class.
            // Notably, the sequence of calling the method is
            // not always in order, so the sequential operation
            // should not be specified in same prog, but should
            // be separated into different prog.

            for (let method in prog){
                if (method !== "ith" && method !== "progs"){
                    this[method](prog[method]);
                }
            }

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
                    // console.error("update", this.box);
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
    }

    transCenter(){
        try{
            this.head = this.head.add((new Vec(300, 300)).sub(this.box.center()));
        } catch(TypeError){
            console.error("transCenter", this.box);
        }
        
        this.update();
    }
}