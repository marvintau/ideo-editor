
class RadicalSet{

    constructor(){
        this.referred_radical = {};

    }

    init(referred_radical_json, radical_list_json){

        this.ctx = document.getElementById('canvas').getContext('2d');

        for(let name in referred_radical_json){

            var ref = referred_radical_json[name];

            switch(ref.type){
                case "simple":
                    this.referred_radical[name] = new Stroke(ref.segs);
                    break;
                case "compound":
                    var compound_segs = [];
                    for(let simple of ref.simples){
                        var segs = this.referred_radical[simple.stroke].copy().segs;
                        
                        if(simple.stretch) for(var i in segs) segs[i].len *= simple.stretch;
                        if(simple.rotate) for (var i in segs) segs[i].ang += simple.rotate;
                        
                        compound_segs = compound_segs.concat(segs);
                    }
                    this.referred_radical[name] = new Stroke(compound_segs);
                    break;
            }
        }

        this.radical_list = [];
        for(let radical of radical_list_json){
            console.log(radical);
            this.add(radical.conds, this.referred_radical[radical.stroke].copy());
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

    box(radical_list){
        var list = radical_list == undefined ? this.radical_list : radical_list; 
        return list.map(s=>s.box()).reduce((s, b) => s.union(b))
    }

    rotate(angle, next_radical){
        for (let i in next_radical.points){
            next_radical.points[i].roti(angle * Math.PI / 180);
        }
    }

    stretch(ratio, next_radical){
        for (let i in next_radical.points){
            next_radical.points[i].scalei(ratio);
        }
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

        this.ctx.clearRect(0,0,600, 600);

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
            drawp(r.points[0], this.ctx, "rgb(0, 0, 0)");
        }


        for(let radical of this.radical_list){
            radical.draw(this.ctx);
        }
    }

}

function drawp(vec, ctx, style){
    if (style===undefined){
        ctx.fillStyle = "rgb(200, 0, 0, 0.5)";
    } else {
        ctx.fillStyle = style;
    }
    ctx.fillRect(vec.x-5, vec.y-5, 10, 10);
}
