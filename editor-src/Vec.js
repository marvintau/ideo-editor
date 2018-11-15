export default class Vec{
    /**
     * Simple Vector class.
     * 
     * @param {number} x x coordinate. When y is undefined, x denotes the angle of the desired vector.
     * @param {number} y y coordinate.
     */
    constructor(x, y){
        if (y === undefined){
            if(x === undefined) {
                // for nothing given.
                this.x = 0;
                this.y = 0;
            } else if (x.x !== undefined && x.y !== undefined){
                // if x is something like {x:1, y:1}
                this.x = x.x;
                this.y = x.y;
            } else if (typeof x === 'number'){
                // if x is a number
                this.x = Math.cos(x*Math.PI/180);
                this.y = Math.sin(x*Math.PI/180);
            }
        } else {
            this.x = x;
            this.y = y;
        }
    }

    /**
     * 
     * @param {Vec} vec another vec to be added
     * @returns {Vec}
     */
    add(vec){
        return new Vec(this.x + vec.x, this.y + vec.y);
    }

    iadd(vec){
        this.x += vec.x;
        this.y += vec.y;
    }
    /**
     * 
     * @param {Vec} vec another vec to be subtracted
     * @returns {Vec}
     */
    sub(vec){
        return new Vec(this.x - vec.x, this.y - vec.y);
    }

    isub(vec){
        this.x -= vec.x;
        this.y -= vec.y;
    }

    /**
     * 
     * @param {Vec, number} vec can be either a vec or a scalar. If it's a scalar,
     *                          then times it both to x and y.
     * @returns {Vec}
     */
    mult(vec){
        if(vec.x === undefined){
            return new Vec(this.x * vec, this.y * vec);
        } else {
            return new Vec(this.x * vec.x, this.y * vec.y);
        }
    }

    imult(vec){
        if(vec.x === undefined){
            this.y *= vec;
            this.x *= vec;
        } else {
            this.x *= vec.x;
            this.y *= vec.y;
        }
    }

    neg(){
        return new Vec(-this.x, -this.y);
    }

    /**
     * returns the cross product between this and vec.
     * also is the result of det
     * 
     * |this.x   that.x|
     * |               |
     * |this.y   that.y|
     * 
     * @param {Vec} that another vector
     */
    cross(that){
        return this.x * that.y - that.x * this.y;
    }

    /**
     * head: returns the most left-top vector between two.
     * @param {Vec} vec another vector
     * @returns {Vec}
     */
    head(vec){
        return new Vec(Math.min(this.x, vec.x), Math.min(this.y, vec.y));
    }

    /**
     * isHeaderTo: compare which vector should be the head between two
     * @param {Vec} vec another vector
     * @returns {boolean}
     */
    isHeaderTo(vec){
        return (this.x < vec.x) && (this.y < vec.y);
    }

    /**
     * tail: returns the most right-bottom vector between two.
     * @param {Vec} vec another vector
     * @returns {Vec}
     */
    tail(vec){
        return new Vec(Math.max(this.x, vec.x), Math.max(this.y, vec.y));
    }

    /**
     * isHeaderTo: compare which vector should be the tail between two.
     * @param {Vec} vec another vector
     * @returns {boolean}
     */
    isTailerTo(vec){
        return this.x > vec.x && this.y > vec.y;
    }

    /**
     * copy: duplicate an object instance of this.
     * @returns {Vec}
     */
    copy(){
        return new Vec(this.x, this.y);
    }

    mag(){
        return Math.hypot(this.x, this.y);
    }

    sampleTo(vec, resolution){
        var lis = [],
            off = vec.sub(this);

        for (let i = 0; i < resolution; i++){
            lis.push(this.add(off.mult((i+0.5)/resolution)));
        }
        return lis;
    }

    sampleStepTo(vec, step){
        var lis = [],
            off = vec.sub(this),
            dis = off.mag();

        for (let i = 0; i < dis; i+= step){
            lis.push(this.add(off.mult(i/dis)));
        }
        lis.push(vec);
        return lis;
    }

    isNaN(){
        return (isNaN(this.x) || isNaN(this.y));
    }
}