import { testSeg } from "./Seg.js";
import { testCurve } from "./Curve.js";
import { testCompoundCurve } from "./CompoundCurve.js";
import { testStrokeSet } from "./StrokeSet.js";

import {loadStrokeBase, getStroke} from "./StrokeBase";
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


function withStrokeData(data){
    var strokes = JSON.parse(data);

    // testSeg(ctx);
    // testCurve(ctx);
    // testCompoundCurve(ctx);
    
    var strokeSpec = getStroke(strokes, "女");
    testStrokeSet(ctx, strokeSpec);
}

loadStrokeBase().then(withStrokeData)