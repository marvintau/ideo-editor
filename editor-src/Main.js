import {testSeg} from "./Seg.js";
import {testCompoundCurve} from "./CompoundCurve.js";
import initInput from "./Input.js";

var c              = document.getElementById("canvas"),
    ctx            = document.getElementById("canvas").getContext("2d"),
    ratio          = window.devicePixelRatio;
    c.style.width  = c.width + "px";
    c.style.height = c.height + "px";
    c.width        = c.width * ratio;
    c.height       = c.height * ratio;

ctx.scale(ratio, ratio);

initInput(document.getElementById('stroke-list'));


testSeg(ctx);
testCompoundCurve(ctx);