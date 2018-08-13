
class RadicalSet{

    constructor(){
        this.radical_list = [];
        this.char_set = {};

        this.init();
    }

    init(){

        this.ctx = document.getElementById('canvas').getContext('2d');

        this.char_set = JSON.parse(document.getElementById("stroke-spec").value);

        for(let name in this.char_set){
            if ("stroke" in this.char_set[name]){
                this.char_set[name].stroke = new Stroke(this.char_set[name].stroke);
            }
        }

        var radical_list_json = JSON.parse(document.getElementById("stroke-list").value);

        for(let radical of radical_list_json){
            this.add(radical.conds, this.char_set[radical.name].stroke.copy());
        }

    }

    add(conditions, next_radical){

        if (conditions !== undefined){
            for (let cond of conditions){
                var method = Object.keys(cond)[0];
                this[method](cond[method], next_radical);
            }
        }

        console.log("add box", next_radical.box());
        this.radical_list.push(next_radical);

       
    }

    applyCond(cond, next_radical){
        this.concat(cond, next_radical);
    }


    box(radical_list){
        var list = radical_list == undefined ? this.radical_list : radical_list; 
        return list.map(s=>s.box()).reduce((s, b) => s.union(b))
    }

    rotate(cond, next_radical){
        console.log("rotate", cond);
        next_radical.rotate(cond.angle);
    }

    stretch(cond, next_radical){
        console.log("stretch", cond);
        next_radical.stretch(cond.ratio);
    }

    concat(cond, next_radical){

        var list_box = this.box(),
            new_box  = next_radical.box();

        var list_size = list_box.size(),
            new_size  = new_box.size();

        var place = {
            "left"   : new_size.hori().neg(),
            "right"  : list_size.hori(),
            "top"    : new_size.vert().neg(),
            "bottom" : list_size.vert()
        };

        console.log(place[cond]);
        next_radical.trans(place[cond]);

        return next_radical;
    }

    cross(cond, next_radical){
        var dest = cond.dest,
            rself = cond.rself,
            rdest = cond.rdest;

        var dest_point = this.radical_list[dest].getPointAt(rdest),
            self_point = next_radical.getPointAt(rself);

        next_radical.trans(dest_point.sub(self_point));
        return next_radical;
    }

    draw(){

        if(this.radical_list.length > 1){
            var this_box = this.box(),
                this_size = this_box.size(),
                this_center = this_box.center(),
                scale = HEIGHT / (Math.max(this_size.x, this_size.y) + 1),
                scale_vec = new Vec(scale, scale);

            console.log("size", this_size, this_center, scale);

            for(let i in this.radical_list){
                this.radical_list[i].trans(this_center.neg());
                this.radical_list[i].scale(scale_vec);
                this.radical_list[i].trans(new Vec(300, 300));
            }
        }

        for(let r of this.radical_list){
            for (let p of r.points){
                drawp(p, this.ctx);
            }
        }


        for(let radical of this.radical_list){
            radical.draw(this.ctx);
        }
    }

}

function drawp(vec, ctx){
    ctx.fillStyle = "rgb(200, 0, 0, 0.5)";
    ctx.fillRect(vec.x-5, vec.y-5, 10, 10);
}
