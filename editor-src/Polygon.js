import Color from "./Color.js";
import {intersectSegSeg, area, centroid, include} from "./Geom.js";
import {forSucc} from "./Supp.js";
import Stroke from "./Stroke.js";
import Vec from "./Vec.js";


function splitStrokeIntersection(polygon, stroke){

    let enter = undefined,
        exit = undefined;

    forSucc(stroke, function(s, sHead, sTail){
        forSucc(polygon, function(p, pHead, pTail){
            var inter           = intersectSegSeg(sHead, sTail, pHead, pTail);
            
            let interPolyEdge   = inter.t >= 0 && inter.t < 1,
                interStrokeBody = inter.s >= 0 && inter.s < 1,
                interStrokeHead = inter.s <= 1 && sHead.attr.head,
                interStrokeTail = inter.s >= 0 && sTail.attr.tail,
                interStroke     = interStrokeHead || interStrokeBody || interStrokeTail;
            
            if (interPolyEdge && interStroke){
                let summary = {inter: inter, stroEdge:s, polyEdge: p};
                if (!enter) enter = summary;
                else if (!exit) exit = summary;
                else return;
            }
        })

        if (enter && exit) return;
    })
    
    if(enter === undefined && exit === undefined){
        throw TypeError("splitStrokeIntersection: Stroke doesn't intersect with polygon.");
    }

    let strokeIntersection = [];

    if (enter !== undefined && exit !== undefined){
        strokeIntersection.push(enter.inter.p);
        for (let i = enter.stroEdge + 1; i <= exit.stroEdge; i++)
            strokeIntersection.push(stroke[i]);
        strokeIntersection.push(exit.inter.p);
    }

    return { enter, exit, strokeIntersection};
}

// Works to be done:
// 1. the diameter with angle given. very important
// 2. draw a stroke and split a polygon 

export default class Polygon extends Array {

    constructor(args){
        super(...args);
        this.push(this[0]);
        this.color = new Color();

        this.area = area(this);
        this.centroid = centroid(this);
        // this.diameter = Math.sqrt(this.area / (2 / Math.PI));
        this.type = "Polygon";

        // There is a simple way to test whether this polygon is
        // "well-formed". If the centroid is outside the polygon,
        // then the polygon will be SERIOUSLY concave, which means
        // "malformed". In this case, it's inappropriate to measure
        // its diameter.
    }
    
    diameter(angle, across){

        across = across === undefined ? this.centroid : across;

        let measureStroke = new Stroke([
            this.centroid.sub(new Vec(angle)),
            this.centroid.add(new Vec(angle))
        ]);

        console.log(measureStroke, "diameter");
        let {enter, exit} = splitStrokeIntersection(this, measureStroke);

        console.log(enter.inter.p, exit.inter.p);

        return {
            head :enter.inter.p.sub(across),
            tail :exit.inter.p.sub(across),
            cent: across
        };
    }


    scale(ratio){
        for (let i = 0; i < this.length-1; i++) this[i].imult(ratio);
    }

    trans(vec){
        for (let i = 0; i < this.length-1; i++) this[i].iadd(vec);
    }

    draw(ctx){
        ctx.fillStyle = this.color.toString();
        ctx.beginPath();
        ctx.moveTo(this[0].x, this[0].y);
        for (let i = 0; i < this.length; i++) ctx.lineTo(this[i].x, this[i].y);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.arc(this.centroid.x, this.centroid.y, 3, 0, 2*Math.PI);
        ctx.stroke();
    }

    splitBy(stroke){

        const {enter, exit, strokeIntersection} = splitStrokeIntersection(this, stroke);
    
        let polyEnter, polyExit;
        if (enter.polyEdge < exit.polyEdge){
            polyEnter = enter.polyEdge;
            polyExit  = exit.polyEdge;
            strokeIntersection.reverse();
        } else {
            polyEnter = exit.polyEdge;
            polyExit  = enter.polyEdge;
        }
        
        let points    = Array.from(this),
            innerSide = points.slice(polyEnter, polyExit+1).concat(strokeIntersection),
            outerSide = points.slice(1, polyEnter+1).concat(strokeIntersection.reverse()).concat(points.slice(polyExit));
    
        return {innerSide, outerSide};
    }

    area(){
        if(this.body.length > 3){
            var pointListCopy = this.body.concat(this.body[0].copy());
            return pointListCopy.part(2, 1).map(p => p[0].cross(p[1])/2).sum();
        } else {
            return 0;
        }
    }
    
}
