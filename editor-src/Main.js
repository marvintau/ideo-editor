// import { testSeg } from "./Seg.js";
// import { testCurve } from "./Curve.js";
// import { testCompoundCurve } from "./CompoundCurve.js";

import StrokeBase from "./StrokeBase.js";
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

var strokeBase = new StrokeBase(ctx);
strokeBase.updateBase();