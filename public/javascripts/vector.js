/*
 *  Simple Vector Operations
 *  Marvin Tao
 *  2018-5-25
 */

var WIDTH = 600,
    HEIGHT = 600;

class Vec {
    constructor(x, y, w){
        if( typeof(x) === "string"){
            let [x_str, y_str] = x.trim().split(" ");
            this.x = parseFloat(x_str) * WIDTH;
            this.y = parseFloat(y_str) * HEIGHT;
        } else  {
            this.x = x;
            this.y = y;
            this.w = w == undefined ? 1 : w;
        }
    }

    /**
     * length of a vector, or distance between two points
     */
    dist(v){
        if (v == undefined) {
            return Math.hypot(this.x, this.y);
        } else {
            var diff = this.sub(v);
            return Math.hypot(diff.x, diff.y);
        }
    }

    /**
     * subtract a vector
     * returns a new Vec
     * @param {Vec} v 
     */
    sub(v){
        return new Vec(this.x - v.x, this.y - v.y, this.w);
    }
    subi(v){
        this.x -= v.x;
        this.y -= v.y;
    }

    /**
     * add a vector
     * returns a new Vec
     * @param {Vec} v 
     */
    add(v){
        return new Vec(this.x + v.x, this.y + v.y, this.w);
    }
    addi(v){
        this.x += v.x;
        this.y += v.y;
    }

    /**
     * counter-clockwise perpendicular vector, or rotate 90 deg ccw
     * and then scalar-multiply with n
     * returns a new Vec 
     * @param {number} n 
     */
    perp_ccw(n){
        return new Vec(-this.y * n, this.x * n, this.w);
    }
    perp_ccwi(n){
        var new_x = -this.y * n,
            new_y = this.x * n;
        this.x = new_x;
        this.y = new_y;
    }
    /**
     * clockwise perpendicular vector, or rotate 90 degree cw
     * then scalar-multiply with n
     * returns a new Vec
     * @param {number} n 
     */
    perp_cw(n){
        return new Vec(this.y * n, -this.x * n, this.w);
    }
    perp_cwi(n){
        var new_x = this.y * n,
            new_y = -this.x * n;
        this.x = new_x;
        this.y = new_y;
    }

    /**
     * rotate point around origin
     * @param {float} theta 
     */
    rot(theta){
        return new Vec (this.x*Math.cos(theta) - this.y*Math.sin(theta), this.x*Math.sin(theta) + this.y*Math.cos(theta), this.w);
    }
    roti(theta){
        var new_x = this.x*Math.cos(theta) - this.y*Math.sin(theta),
            new_y = this.x*Math.sin(theta) + this.y*Math.cos(theta);
        this.x = new_x;
        this.y = new_y;
    }

    /**
     * rotate vector around given vector point
     * @param {float} theta 
     * @param {Vec} trans_vec 
     */
    rot_about(theta, trans_vec){
        return this.sub(trans_vec).rot(theta).add(trans_vec)
    }
    rot_abouti(theta, trans_vec){
        this.subi(trans_vec);
        this.roti(theta);
        this.addi(trans_vec);
    }

    /**
     * multiply with another vec in tensor multiplication manner
     * @param {Vec} tensor 
     */
    mult(tensor){
        return new Vec(this.x * tensor.x, this.y * tensor.y, this.w);
    }
    multi(tensor){
        this.x *= tensor.x;
        this.y *= tensor.y;
    }

    /**
     *  vector division / ratio between two vector. Typically used when
     *  the current vector instance denotes a size of rectangle area, and
     *  this function can be used to find the scaling/translating factor.
     *  @param {Vec} vec
     */
    ratio(vec){
        return new Vec(this.x / vec.x, this.y / vec.y);
    }
    ratioi(vec){
        this.x /= vec.x;
        this.y /= vec.y;
    }

    /**
     * line interpolation between this and v
     */
    lerp(v, r){
        return v.sub(this).mult(new Vec(r, r)).add(this);
    }

    /**
     * duplicate this vector
     */
    copy(){
        return new Vec(this.x, this.y, this.w);
    }

    move(ctx){
        ctx.moveTo(this.x, this.y);
    }

    line(ctx){
        ctx.lineTo(this.x, this.y);
    }

    hori(){
        return new Vec(this.x, 0);
    }

    vert(){
        return new Vec(0, this.y);
    }

    neg(){
        return new Vec(-this.x, -this.y);
    }
}


var det = function(a, b, c, d){
    return a*d - b*c;
}

class Box{
    constructor(lt, rb){
        this.lt = lt;
        this.rb = rb;
    }

    union(box){
        return new Box(new Vec(Math.min(this.lt.x, box.lt.x), Math.min(this.lt.y, box.lt.y)),
                       new Vec(Math.max(this.rb.x, box.rb.x), Math.max(this.rb.y, box.rb.y)));
    }

    size(){
        return this.rb.sub(this.lt);
    }

    center(){
        return this.rb.add(this.lt).mult(new Vec(0.5, 0.5));
    }
}


