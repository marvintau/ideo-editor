import IONEditor from "ion-editor";
import Vec from "./Vec.js";
import Polygon from "./Polygon.js";
import Stroke from "./Stroke.js";

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

function split(polygonDex, strokeDex){

    const polygon = grandDex[polygonDex],
          stroke  = grandDex[strokeDex];

    const {innerSide, outerSide} = polygon.splitBy(stroke);

    delete grandDex[polygonDex];
    grandDex[polygonDex+"i"] = new Polygon(innerSide);
    grandDex[polygonDex+"o"] = new Polygon(outerSide);
}

// the GrandDex handles all objects over the canvas. It's
// initialized with a rectangle polygon, a.k.a. the root canvas.

var grandDex = {root: new Polygon([
    new Vec(1, 1),
    new Vec(-1, 1),
    new Vec(-1, -1),
    new Vec(1, -1)
])};
grandDex.root.scale(200);


grandDex.stroke1 = new Stroke([
    new Vec(0, 2),
    new Vec(0.1, 0.5),
    new Vec(-0.1, -0.5),
    new Vec(0, -2)
]);

grandDex.stroke1.scale(80);

function draw(ctx){
    for (let key in grandDex) if (grandDex[key].type == "Polygon")
        grandDex[key].draw(ctx);

    for (let key in grandDex) if (grandDex[key].type == "Stroke")
        grandDex[key].draw(ctx);
}

split("root", "stroke1");
draw(ctx);
console.log(grandDex.rooti.type);
document.addEventListener("interpret", function(e){
    console.log(e, "interpret");
})