
/**
 * GLOBAL RADICAL REFERENCE
 * The global data structure that holds all stroke & radical objects.
 */
var RADICAL_REFS={};

class RadicalSet{

    constructor(){
    }

    get_compound_segs(spec){

        var compound_segs = [];

        for(let simple of spec.simples){
            var segs = RADICAL_REFS[simple.stroke][0].copy().segs;
            
            if(simple.stretch) for(var i in segs) segs[i].len *= simple.stretch;
            if(simple.rotate) for (var i in segs) segs[i].ang += simple.rotate;
            
            compound_segs = compound_segs.concat(segs);
        }
 
        return compound_segs;
    }

    set_radical_ref(name, spec, radical_spec_sofar){
    
        switch(spec.type){

            case "simple":
                var stroke = new Stroke(spec.segs);
                RADICAL_REFS[name] = [stroke];
                break;

            case "compound":
                var compound_segs = this.get_compound_segs(spec);
                var stroke = new Stroke(compound_segs);
                RADICAL_REFS[name] = [stroke];
                break;

            case "radical":
                var sub_radical_set = new RadicalSet();
                sub_radical_set.init(radical_spec_sofar, spec.components);
                RADICAL_REFS[name] = sub_radical_set.strokes;
                console.log("initing radical", name, JSON.stringify(RADICAL_REFS[name].map(s => s.points[0])));
                break;
        }

    }

    init(radical_spec, radical_list){

        this.ctx = document.getElementById('canvas').getContext('2d');

        var radical_spec_sofar = {};

        for(let name in radical_spec){
            if(RADICAL_REFS.name === undefined){
                this.set_radical_ref(name, radical_spec[name], radical_spec_sofar);
            }
            radical_spec_sofar[name] = radical_spec[name];
        }

        this.strokes = [];
        for(let radical of radical_list){

            console.log(radical);
            var radicals_copy = RADICAL_REFS[radical.name].map(stroke => stroke.copy());

            this.add(radical.conds, radicals_copy); 

        }

    }

    add(conditions, radical){

        if (conditions !== undefined){
            for (let method in conditions){
                console.log("methods", method);
                radical = this[method](conditions[method], radical);
            }
        }

        console.log("prepend!", conditions);
        if (conditions && conditions.prepend){
            this.strokes = radical.concat(this.strokes);
        } else
            this.strokes = this.strokes.concat(radical);
        
        console.log("adding", JSON.stringify(radical.map(s=>s.points[0])));
    }

    box(strokes){
        var list = strokes === undefined ? this.strokes : strokes; 
        return list.map(s=>s.box()).reduce((s, b) => s.union(b))
    }

    // Do nothing but just make the condition list work smoothly.
    // apparently a bad practice.
    prepend(whatever, radical){
        return radical;
    }

    rotate(angle, radical){
        for(let s in radical)
            for (let i in radical[s].points)
                radical[s].points[i].roti(angle * Math.PI / 180);

        return radical;
    }

    scale(ratio, radical){
        for(let s in radical)
            for (let i in radical[s].points)
                radical[s].points[i].scalei(ratio);

        return radical;
    }

    stretch(ratio, vec, radical){

        if(radical === undefined){
            radical = this.strokes;
        }

        for(let s in radical)
            for (let i in radical[s].points){
                radical[s].points[i].subi(vec);
                radical[s].points[i].multi(ratio);
                radical[s].points[i].addi(vec);
            }
                
        return radical;
    }

    concat(cond, radical){

        var trans_methods = {
            "right"  : {"prev":{"ratio":new Vec(0.6, 1), "pos":"left-center"},
                        "curr":{"ratio":new Vec(0.6, 1), "pos":"right-center"}},
            "bottom" : {"prev":{"ratio":new Vec(1, 0.6), "pos":"top-center"},
                        "curr":{"ratio":new Vec(1, 0.6), "pos":"bottom-center"}}
        };

        var prev_box = this.box(),
            curr_box = this.box(radical);

        var prev_center = prev_box.center(),
            curr_center = curr_box.center();

        for(var stroke_index in radical){
            radical[stroke_index].trans(prev_center.sub(curr_center));
        }

        var unioned_box = prev_box.union(this.box(radical)),
            prev_anchor = unioned_box.get(trans_methods[cond.place].prev.pos),
            curr_anchor = unioned_box.get(trans_methods[cond.place].curr.pos);

        this.stretch(trans_methods[cond.place].prev.ratio, prev_anchor);
        this.stretch(trans_methods[cond.place].curr.ratio, curr_anchor, radical);

        console.log("stretched", this.box(), this.box(radical));

        return radical;
    }

    // when doing cross, the radical must be a single stroke radical. Add more
    // handling here.
    cross(cond, radical){

        var dest = cond.dest,
            rself = cond.rself,
            rdest = cond.rdest;

        console.log(radical);

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

        if(this.strokes.length > 0){
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
