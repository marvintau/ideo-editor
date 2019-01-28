import IONEditor from "ion-editor";
import Vec from "./Vec.js";

// 程序的主入口
// Main entrance of this project

var editor = new IONEditor(document.getElementById("editor"));

let canvas = document.createElement('canvas');
canvas.width  = 400;
canvas.height = 400;
document.getElementById('canvas-container').appendChild(canvas);

function intersectSegSeg(p1, p2, p3, p4){

    let det_s =  p1.sub(p3).cross(p3.sub(p4)),
        det_t = -p1.sub(p2).cross(p1.sub(p3)),
        det   =  p1.sub(p2).cross(p3.sub(p4));

    let s = det_s/det,
        t = det_t/det,
        p = p1.add(p2.sub(p1).mult(s));

    // p: intersection
    // s: ratio on p1-p2
    // t: ratio on p3-p4
    return {
        p:p,
        s:s, t: t
    };
}
class Polygon extends Array {

    /**
     * EnclosedSpace is constructed from a series of points.
     * The points should be vectors with attributes. Polygon
     * pushes the reference of the head virtex at the end, 
     * to make it a closed curve.
     */
    constructor(args){
        super(...args);
        this.push(this[0]);
    }

    splitBy(stroke){

        let enter = undefined,
            exit = undefined;
    
        for (let j = 0; j < stroke.length - 1; j++){
    
            let sHead = stroke[j],
                sTail = stroke[j+1];

            for (let i = 0; i < this.length - 1; i++){

                let pHead = this[i],
                    pTail = this[i+1];
                
                var inter           = intersectSegSeg(sHead, sTail, pHead, pTail);
                
                let interPolyEdge   = inter.t > 0 && inter.t < 1,
                    interStrokeBody = inter.s < 1 && inter.s > 0,
                    interStrokeHead = inter.s < 1 && sHead.head,
                    interStrokeTail = inter.s > 0 && sTail.tail,
                    interStroke     = interStrokeHead || interStrokeBody || interStrokeTail;
                
                if (interPolyEdge && interStroke){
                    let summary = {inter: inter, stro:j, poly: i};
                    if (!enter) enter = summary;
                    else if (!exit) exit = summary;
                    else break;
                }
            }
    
            if (enter !== undefined && exit !== undefined) break;
        }
        
        let strokeIntersection = [enter.inter.p];

        for (let i = enter.stroke + 1; i < exit.stroke; i++)
            strokeIntersection.push(stroke[i]);
        strokeIntersection.push(exit.inter.p);

        let polyEnter, polyExit;
        if (enter.polygon < exit.polygon){
            polyEnter = enter.polygon;
            polyExit  = exit.polygon;
            strokeIntersection.reverse();
        } else {
            polyEnter = exit.polygon;
            polyExit  = enter.polygon;
        }
        
        // console.log(this.constructor.prototype);
        let points    = Array.from(this),
            innerSide = points.slice(polyEnter, polyExit),
            outerSide = points.slice(1, polyExit).concat(strokeIntersection.reverse()).concat(points.slice(polyExit));
        
        console.log(points);
        return {
            i: new Polygon(innerSide),
            o: new Polygon(outerSide),
            strokeRef: stroke
        }
    }
    
    // concat(args){
    //     throw TypeError("concat is not available in Polygon");
    // }
}

class Stroke extends Array {

    constructor(args){
        super(...args);
        this[0].setAttr({head: true});
        this[this.length-1].setAttr({tail: true});
    }


}

let root = new Polygon([
    new Vec(1, 1),
    new Vec(-1, 1),
    new Vec(-1, -1),
    new Vec(1, -1)
]);

let str = new Stroke([
    new Vec(0, 2),
    new Vec(0, -2)
]);

console.log(root.splitBy(str));

console.log(root);
document.addEventListener("interpret", function(e){
    console.log(e, "interpret");
})