
class RadicalSet{

    constructor(){
    }

    get_compound_segs(spec, radical_refs){

        var compound_segs = [];

        for(let simple of spec.simples){
            var segs = radical_refs[simple.stroke][0].copy().segs;
            
            if(simple.stretch) for(var i in segs) segs[i].len *= simple.stretch;
            if(simple.rotate) for (var i in segs) segs[i].ang += simple.rotate;
            
            compound_segs = compound_segs.concat(segs);
        }
 
        return compound_segs;
    }

    set_radical_ref(name, spec, radical_refs, radical_spec_sofar){
    
        switch(spec.type){

            case "simple":
                var stroke = new Stroke(spec.segs);
                radical_refs[name] = [stroke];
                break;

            case "compound":
                var compound_segs = this.get_compound_segs(spec, radical_refs);
                var stroke = new Stroke(compound_segs);
                radical_refs[name] = [stroke];
                break;

            case "radical":
                var sub_radical_set = new RadicalSet();
                sub_radical_set.init(radical_spec_sofar, spec.components);
                radical_refs[name] = sub_radical_set.strokes;
                console.log("initing radical", name, JSON.stringify(radical_refs[name].map(s => s.points[0])));
                break;
        }

    }

    init(radical_spec, radical_list){

        this.ctx = document.getElementById('canvas').getContext('2d');

        var radical_spec_sofar = {},
            radical_refs = {};

        for(let name in radical_spec){
            this.set_radical_ref(name, radical_spec[name], radical_refs, radical_spec_sofar);
            radical_spec_sofar[name] = radical_spec[name];
        }

        this.strokes = [];
        for(let radical of radical_list){

            console.log(radical_refs, radical);
            var radicals_copy = radical_refs[radical.name].map(stroke => stroke.copy());

            this.add(radical.conds, radicals_copy); 

        }

    }

    // note that the radical contains a list of strokes only. thus we merely change push into concat
    // so that to make add accept list of stroke instead of single object. for detailed operation over
    // list will be specified on cond methods.
    add(conditions, radical){


        if (conditions !== undefined){
            for (let cond of conditions){
                var method = Object.keys(cond)[0];
                radical = this[method](cond[method], radical);
            }
        }

        for(let stroke of radical){
            this.strokes.push(stroke);
        }
        
        console.log("adding", JSON.stringify(radical.map(s=>s.points[0])));
    }

    box(strokes){
        var list = strokes === undefined ? this.strokes : strokes; 
        return list.map(s=>s.box()).reduce((s, b) => s.union(b))
    }

    rotate(angle, radical){
        for(let s in radical)
            for (let i in radical[s].points)
                radical[s].points[i].roti(angle * Math.PI / 180);

        return radical;
    }

    stretch(ratio, radical){
        for(let s in radical)
            for (let i in radical[s].points)
                radical[s].points[i].scalei(ratio);

        return radical;
    }

    concat(cond, radical){

        var list_box = this.box(),
            new_box  = this.box(radical);

        var list_size = list_box.size(),
            new_size  = new_box.size();

        var place = {
            "left"   : new_size.hori().neg(),
            "right"  : list_size.hori(),
            "top"    : new_size.vert().neg(),
            "bottom" : list_size.vert()
        };
    }

    // when doing cross, the radical must be a single stroke radical. Add more
    // handling here.
    cross(cond, radical){

        var dest = cond.dest,
            rself = cond.rself,
            rdest = cond.rdest;

        var dest_point = this.strokes[dest].getPointAt(rdest),
            self_point = radical[0].getPointAt(rself);

        for(let s in radical){
            radical[s].trans(dest_point.sub(self_point));
        }

        console.log("cross", JSON.stringify(radical.map(s=>s.points[0])))
        return radical;
    }

    draw(){

        this.ctx.clearRect(0,0,600, 600);

        if(this.strokes.length > 1){
            var this_box = this.box(),
                this_size = this_box.size(),
                this_center = this_box.center(),
                scale = HEIGHT / (Math.max(this_size.x, this_size.y) + 1),
                scale_vec = new Vec(scale, scale);

            console.log("size", this_size, this_center, scale);

            for(let i in this.strokes){
                this.strokes[i].trans(this_center.neg());
                this.strokes[i].scale(scale_vec);
                this.strokes[i].trans(new Vec(300, 300));
            }
        }

        for(let r of this.strokes){
            for (let p of r.points){
                drawp(p, this.ctx);
            }
            drawp(r.points[0], this.ctx, "rgb(0, 0, 0)");
        }


        for(let radical of this.strokes){
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
