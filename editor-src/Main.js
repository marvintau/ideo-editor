import IONEditor from "ion-editor";
import Vec from "./Vec.js";
import Polygon from "./Polygon.js";
import Stroke from "./Stroke.js";
import Region from "./Region.js";

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

// the GrandDex handles all objects over the canvas. It's
// initialized with a rectangle polygon, a.k.a. the root canvas.

var root = new Region(new Polygon([
    new Vec( 200,  200),
    new Vec(-200,  200),
    new Vec(-200, -200),
    new Vec( 200, -200)
]));

let stroke =  new Stroke([
    new Vec(  0,  200),
    new Vec( 150,   0),
    new Vec(-150,   0),
    new Vec(  0, -200)
]);

stroke[0].setAttr({curveStart: true});
stroke.bezierize(2);

let stroke2 =  new Stroke([
    new Vec( 200, - 0),
    new Vec(  50, -10),
    new Vec( -50,  10),
    new Vec(-200,   0)
]);

stroke2[0].setAttr({curveStart: true});
stroke2.bezierize(2);

let stroke3 = new Stroke([
    new Vec(-100,  200),
    new Vec(-100, -100),
    new Vec(100,  -100),
    new Vec(100,   200)
]);

// stroke3[0].setAttr({curveStart: true});
// stroke3.bezierize(2);

root.addStroke(stroke);
root.addStroke(stroke2);
root.addStroke(stroke3);
root.split();
root.draw(ctx);
// console.log(grandDex.rooti.type);
document.addEventListener("interpret", function(e){
    console.log(e, "interpret");
})