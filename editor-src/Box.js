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

    /**
     * find the union box of the two boxes.
     * @param {Box} box another box
     * @returns {Box}
     */
    union(next){

        var head, tail;
        
        if (next.x){
            head = next;
            tail = next;
        } else {
            head = next.head;
            tail = next.tail;
        }

        head = this.head.head(head);
        tail = this.tail.tail(tail);

        return new Box(head, tail);

    }

    iunion(next){

        var head, tail;
        if (next.x){
            head = next;
            tail = next;
        } else {
            head = next.head;
            tail = next.tail;
        }

        this.head = this.head.head(head);
        this.tail = this.tail.tail(tail);
    }

    /**
     * copy: duplicate this object instance
     * @returns {Box}
     */
    copy(){
        return new Box(this.head.copy(), this.tail.copy());
    }

    /**
     * returns the center of this box.
     * @returns {Vec}
     */
    center(){
        return this.head.add(this.tail).mult(new Vec(0.5, 0.5));
    }

    /**
     * returns the size of this box.
     * @returns {Vec}
     * @returns {Vec}
     */
    size(){
        return this.tail.sub(this.head);
    }

    /**
     * test if a vec is included in this box;
     * @param {Vec} vec the vec to be tested
     * @returns {boolean}
     */
    includeQ(vec){
        return (vec.isTailerTo(this.head) && vec.isHeaderTo(this.tail));
    }

    /**
     * translate box to a new position by reset head, keeping size unchanged.
     * @param {Vec} vec new head
     * @returns {Box}
     */
    moveWithHead(vec){
        var size = this.size();
        return new Box(vec, vec.add(size));
    }

    /**
     * 
     * @param {number} x headx
     * @param {number} y heady
     * @param {number} w width
     * @param {number} h height
     */
    set(x, y, w, h){
        this.head.x = x;
        this.head.y = y;
        this.tail.x = x+w;
        this.tail.y = y+h;
    }

    draw(ctx){
        var size = this.size();
        // ctx.strokeStyle = "rgb(0, 0, 0, 0)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(this.head.x, this.head.y, size.x, size.y);
        ctx.stroke();
    }
}

export function testBox(){
    
}