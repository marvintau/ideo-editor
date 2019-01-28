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
    new Vec(0, 2),
    new Vec(0.1, 0.5),
    new Vec(-0.1, -0.5),
    new Vec(0, -2)
]);
stroke.scale(80);

root.split(stroke);
root.draw(ctx);
// console.log(grandDex.rooti.type);
document.addEventListener("interpret", function(e){
    console.log(e, "interpret");
})