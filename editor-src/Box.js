import Vec from "./Vec.js";

export default class Box{

    /**
     * Box for representing bounding box.
     * @param {Vec} head top-left coordinate
     * @param {Vec} tail bottom-right coordinate
     */
    constructor(head, tail){

        if(tail === undefined) tail = new Vec();
        if(head === undefined) head = new Vec();
        
        this.head = head.copy();
        this.tail = tail.copy();
    }

    union(box){

        var head = this.head.head(box.head),
            tail = this.tail.tail(box.tail);

        return new Box(head, tail);

    }

    copy(){
        return new Box(this.head.copy(), this.tail.copy());
    }

    center(){
        return this.head.add(this.tail).mult(new Vec(0.5, 0.5));
    }

    size(){
        return this.tail.sub(this.head);
    }

    draw(ctx){
        var size = this.size();
        ctx.lineWidth = 0.8;
        ctx.rect(this.head.x, this.head.y, size.x, size.y);
        ctx.stroke();
    }
}

export function testBox(){
    
}