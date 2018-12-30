export default class Vec{
    /**
     * Simple Vector class.
     * 
     * @param {any} x 
     * @param {any} y 
     */
    constructor(x, y, attr){
        if(attr === undefined){
            this.attr = {};

            if (y === undefined){
                if(x === undefined) {

                    // For nothing given, new vec created
                    
                    this.x = 0;
                    this.y = 0;
                } else if (x.x !== undefined && x.y !== undefined){

                    // if argument given as {x:1, y:1}
                    
                    this.x = x.x;
                    this.y = x.y;
                } else if (x.len !== undefined && x.ang !== undefined){

                    // if argument given as {len: 1, ang: 0}

                    this.x = x.len * Math.cos(x.ang*Math.PI/180);
                    this.y = x.len * Math.sin(x.ang*Math.PI/180);
                } else if (typeof x === 'number'){

                    // if x is a number 

                    this.x = Math.cos(x*Math.PI/180);
                    this.y = Math.sin(x*Math.PI/180);
                }
            } else {
                this.x = x;
                this.y = y;
            }
        } else {
            this.attr = attr;
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

    /**
     * transform point in polar manner. returns a new vector relative
     * to this one.
     * @param {number} len length
     * @param {number} ang angle in degree
     */
    polar(vec){
        return new Vec(
            this.x + vec.len * Math.cos(vec.ang * Math.PI/180),
            this.y + vec.len * Math.sin(vec.ang * Math.PI/180)
        )
    };

    ipolar(vec){
        this.x += vec.len * Math.cos(vec.ang * Math.PI/180);
        this.y += vec.len * Math.sin(vec.ang * Math.PI/180);
    }

    iscale(ratio, about){
        // console.log(this, ratio, about, "iscale");
        this.isub(about);
        this.imult(ratio);
        this.iadd(about);
    }

        /**
     * rotate
     * @param {number} theta angle to rotate in degree.
     */
    rotate(theta){
        let rad = theta / 180 * Math.PI,
            sin = Math.sin(rad),
            cos = Math.cos(rad);

        return new Vec(
            this.x * cos - this.y * sin,
            this.x * sin + this.y * cos
        )
    }

    irotate(theta){
        let vec = this.rotate(theta);
        this.x = vec.x;
        this.y = vec.y;
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

 
    mag(){
        return Math.hypot(this.x, this.y);
    }

    norm(){
        return this.mult(1/this.mag())
    }

    angle(){
        return Math.atan2(this.y, this.x) / Math.PI * 180;
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

    addAttr(attr){
        this.attr.push(attr);
    }

    /**
     * Set attribute to Vector. overwrite existing attributes.
     * @param {object} attrObject 
     */
    setAttr(attrObject){
        return Object.assign(this.attr, attrObject);
    }

    removeAttr(attrKey){
        this.attr[attrKey] = undefined;
    }

    /**
     * copy: duplicate an object instance of this.
     * @returns {Vec}
     */
    copy(){
        return new Vec(this.x, this.y, JSON.parse(JSON.stringify(this.attr)));
    }

}