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
                this.x = 0;
                this.y = 0;
            } else {
                this.x = Math.cos(x*Math.PI/180);
                this.y = Math.sin(x*Math.PI/180);
            }
        } else {
            this.x = x;
            this.y = y;
        }
    }

    add(vec){
        return new Vec(this.x + vec.x, this.y + vec.y);
    }

    sub(vec){
        return new Vec(this.x - vec.x, this.y - vec.y);
    }

    mult(vec){
        if(vec.x === undefined){
            return new Vec(this.x * vec, this.y * vec);
        } else {
            return new Vec(this.x * vec.x, this.y * vec.y);
        }
    }

    head(vec){
        return new Vec(Math.min(this.x, vec.x), Math.min(this.y, vec.y));
    }

    tail(vec){
        return new Vec(Math.max(this.x, vec.x), Math.max(this.y, vec.y));
    }

    copy(){
        return new Vec(this.x, this.y);
    }

}

export function testVec(){

}