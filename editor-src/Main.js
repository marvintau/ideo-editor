import IONEditor from "ion-editor";
import Vec from "./Vec.js";

// 程序的主入口
// Main entrance of this project


var editor = new IONEditor(document.getElementById("editor"));

let canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d'),
    dpr = window.devicePixelRatio;
canvas.width  = 800;
canvas.height = 800;
canvas.style.width  = 400;
canvas.style.height = 400;
document.getElementById('canvas-container').appendChild(canvas);
ctx.translate(canvas.width/2, canvas.height/2);
ctx.scale(dpr, dpr);

// MATH TOOLS
// ================================================================
function intersectSegSeg(p1, p2, p3, p4){

    let det_s =  p1.sub(p3).cross(p3.sub(p4)),
        det_t = -p1.sub(p2).cross(p1.sub(p3)),
        det   =  p1.sub(p2).cross(p3.sub(p4));

    let s = det_s/det,
        t = det_t/det,
        p = p1.add(p2.sub(p1).mult(s));

    return { p, s, t};
}

function forSucc(list, func){
    for(let i = 0; i < list.length - 1; i++) func(i, list[i], list[i+1]);
}

// ================================================================

// PRESENTATION TOOLS
// ================================================================

class Color {
    constructor (r_obj, g, b, a){

        // TO BE ADDED MORE
        const colorfuncs = {
            plum : [
                [ -0.0399966,    0.0271153,   -0.000484974,     3.08273*10e-6],
                [ -0.00588486,   0.00511731,  -0.0000405736,    7.75887*10e-7],
                [  0.00402332,   0.0015165,    0.000220422,    -1.92692*10e-6]
            ]
        }
        
        if (g !== undefined && b !== undefined){
            this.r = r_obj;
            this.g = g;
            this.b = b;
            this.a = a;
        } else {

            const s = r_obj !== undefined ? colorfuncs[r_obj.scheme] : colorfuncs["plum"],
                  t = r_obj !== undefined ? r_obj.t : Math.random() * 50;
                console.log(t);
            this.r = (s[0][0] + s[0][1]*t + s[0][2]*t*t + s[0][3]*t*t*t) * 255;
            this.g = (s[1][0] + s[1][1]*t + s[1][2]*t*t + s[1][3]*t*t*t) * 255;
            this.b = (s[2][0] + s[2][1]*t + s[2][2]*t*t + s[2][3]*t*t*t) * 255;
            this.a = 0.7;
        }
    }

    toString(){
        return 'rgba(' + this.r.toFixed(4) + ", " + this.g.toFixed(4) + ", "
                       + this.b.toFixed(4) + ", " + this.a.toFixed(4) + ")";
    }

    darken(ratio){
        this.r *= ratio;
        this.g *= ratio;
        this.b *= ratio;
    }

    lighten(ratio){
        this.r = 1- (1 - this.r) * ratio;
        this.g = 1- (1 - this.g) * ratio;
        this.b = 1- (1 - this.b) * ratio;
    }
}

// ================================================================

function splitStrokeIntersection(polygon, stroke){

    let enter = undefined,
        exit = undefined;

    forSucc(stroke, function(s, sHead, sTail){
        forSucc(polygon, function(p, pHead, pTail){
            var inter           = intersectSegSeg(sHead, sTail, pHead, pTail);
            
            let interPolyEdge   = inter.t > 0 && inter.t < 1,
                interStrokeBody = inter.s < 1 && inter.s > 0,
                interStrokeHead = inter.s < 1 && sHead.attr.head,
                interStrokeTail = inter.s > 0 && sTail.attr.tail,
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
    
    let strokeIntersection = [];

    if (enter !== undefined && exit !== undefined){
        strokeIntersection.push(enter.inter.p);
        for (let i = enter.stroEdge + 1; i <= exit.stroEdge; i++) strokeIntersection.push(stroke[i]);
        strokeIntersection.push(exit.inter.p);
    }

    return { enter, exit, strokeIntersection};
}

function splitBy(polygonDex, strokeDex){

    const polygon = grandDex[polygonDex],
          stroke  = grandDex[strokeDex];

    const {enter, exit, strokeIntersection} = splitStrokeIntersection(polygon, stroke);

    let polyEnter, polyExit;
    if (enter.polyEdge < exit.polyEdge){
        polyEnter = enter.polyEdge;
        polyExit  = exit.polyEdge;
        strokeIntersection.reverse();
    } else {
        polyEnter = exit.polyEdge;
        polyExit  = enter.polyEdge;
    }
    
    let points    = Array.from(polygon),
        innerSide = points.slice(polyEnter, polyExit+1).concat(strokeIntersection),
        outerSide = points.slice(1, polyEnter).concat(strokeIntersection.reverse()).concat(points.slice(polyExit));
    
    console.log("polygon points", points);
    console.log("innerside", innerSide);

    delete grandDex[polygonDex];
    grandDex[polygonDex+"i"] = new Polygon(innerSide);
    grandDex[polygonDex+"o"] = new Polygon(outerSide);
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
        this.color = new Color();
    }

    
    scale(ratio){
        for (let i = 0; i < this.length-1; i++) this[i].imult(ratio);
    }

    trans(vec){
        for (let i = 0; i < this.length-1; i++) this[i].iadd(vec);
    }

    draw(ctx){
        ctx.fillStyle = this.color.toString();
        console.log(ctx.fillStyle);
        ctx.beginPath();
        ctx.moveTo(this[0].x, this[0].y);
        for (let i = 0; i < this.length; i++) ctx.lineTo(this[i].x, this[i].y);
        ctx.closePath();
        ctx.fill();
    }
}

class Stroke extends Array {

    constructor(args){
        super(...args);
        this[0].setAttr({head: true});
        this[this.length-1].setAttr({tail: true});
        this.color = new Color();
        this.color.darken(0.3);
    }

    scale(ratio){
        for (let i = 0; i < this.length; i++) this[i].imult(ratio);
    }

    draw(ctx){
        ctx.strokeStyle = this.color.toString();
        ctx.beginPath();
        ctx.moveTo(this[0].x, this[0].y);
        for (let i = 0; i < this.length; i++) ctx.lineTo(this[i].x, this[i].y);
        ctx.stroke();
    }

}

// the GrandDex handles all objects over the canvas. It's
// initialized with a rectangle polygon, a.k.a. the root canvas.

var grandDex = {root: new Polygon([
    new Vec(1, 1),
    new Vec(-1, 1),
    new Vec(-1, -1),
    new Vec(1, -1)
])};


grandDex.stroke1 = new Stroke([
    new Vec(0, 2),
    new Vec(0.1, 0.5),
    new Vec(-0.1, -0.5),
    new Vec(0, -2)
]);

grandDex.root.scale(80);
grandDex.stroke1.scale(80);

function draw(ctx){
    for (let key in grandDex){
        grandDex[key].draw(ctx);
    }
}

splitBy("root", "stroke1");
draw(ctx);
console.log(grandDex);
document.addEventListener("interpret", function(e){
    console.log(e, "interpret");
})