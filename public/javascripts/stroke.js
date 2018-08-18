
class Stroke {

    constructor(segs){
        this.segs = segs;
        this.init_points(segs);
    }

    init_points(segs){
        this.points = [new Vec(0, 0)];

        for(let seg of segs){
            var last = this.points[this.points.length-1],
                nvec = new Vec(Math.cos(2*Math.PI * seg.ang / 360), Math.sin(2*Math.PI * seg.ang / 360)),
                mult = new Vec(seg.len, seg.len);
            this.points.push(last.add(nvec.mult(mult)));
        }

        this.r = [0];

        for(let i = 0; i < this.points.length-1; i++){
            this.r.push(this.r[i] + segs[i].len);
        }
        for(let i = 0; i < this.r.length; i++){
            this.r[i] /= this.r[this.r.length-1];
        }
 
    }

    /**
     *  Find point over stroke curve with ratio, similar to finding
     *  t over a bezier curve;
     */
    getPointAt(ratio){

        var point;

        if(ratio >= 1){
            var last = this.points.length - 1,
                seg_ratio = (this.r[last]-ratio)/(this.r[last]-this.r[last-1]);
            point = this.points[last].lerp(this.points[last-1], seg_ratio);
            return point;
        }
        if(ratio < 0){
            var seg_ratio = (this.r[1]-ratio)/(this.r[1]-this.r[0]);
            point = this.points[1].lerp(this.points[0], seg_ratio);
            return point;
        }

        for(var i in this.r){
            if(ratio < this.r[i]){

                var seg_ratio = (ratio-this.r[i-1])/(this.r[i]-this.r[i-1]);
                return this.points[i-1].lerp(this.points[i], seg_ratio);
            }
        }

    }

    trans(vec){
        for(let i=0; i < this.points.length; i++){
            this.points[i].addi(vec);
        }
    }

    scale(ratio){
        for(let i=0; i < this.points.length; i++){
            this.points[i].multi(ratio);
        }
    }

    box(){
        var box = new Box(new Vec(0, 0), new Vec(0, 0));
        for(let p of this.points){
            box.lt.x = Math.min(box.lt.x, p.x);
            box.lt.y = Math.min(box.lt.y, p.y);
            box.rb.x = Math.max(box.rb.x, p.x);
            box.rb.y = Math.max(box.rb.y, p.y);
        }
        return box;
    }

    draw(ctx){
        ctx.beginPath()
        this.points[0].move(ctx);
        for(let point of this.points) point.line(ctx);
        ctx.stroke();
    }

    copy(){
        var new_stroke = new Stroke(JSON.parse(JSON.stringify(this.segs)));
        new_stroke.points = this.points.map(p=>p.copy());
        new_stroke.r = this.r;
        return new_stroke;
    }
}


