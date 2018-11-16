CanvasRenderingContext2D.prototype.moveToVec = function(vec){
    this.moveTo(vec.x, vec.y);
}

CanvasRenderingContext2D.prototype.lineToVec = function(vec){
    this.lineTo(vec.x, vec.y);
}

CanvasRenderingContext2D.prototype.bezierCurveToVec = function(vecs){
    if(vecs.length == 3) this.bezierCurveTo(
        vecs[0].x, vecs[0].y,
        vecs[1].x, vecs[1].y,
        vecs[2].x, vecs[2].y
    );
}

/**
 * 将部首画在Canvas上面。
 * 需要注意的是，这个绘制过程会使用到Bezier曲线，因此在设计笔画的时候
 * 应当尽可能使用三段的曲线，使得能够便利地表示成Bezier曲线。
 * 
 * @param {CanvasRenderingContext2D} canvas the canvas to be drawn
 * @param {number} strokeWidth stroke width
 * @param {Array} points the point array
 */

export function drawRadical(canvas, strokeWidth, points){
    canvas.translate(128, 128);
    canvas.lineWidth = strokeWidth;
    canvas.lineCap = "square";
    canvas.lineJoin = "miter";
    canvas.miterLimit = 3;
    canvas.strokeStyle = "black";

    for (let i = 0; i < points.length; i++){

        let seg = 0;
        canvas.beginPath();
        canvas.moveToVec(points[i][seg]);

        for (; seg < points[i].length;){
            if (points[i].length - seg > 3) {
                canvas.bezierCurveToVec(points[i].slice(seg+1, seg+4));    
                seg += 3;
            } else {
                canvas.lineToVec(points[i][seg]);
                seg += 1;
            }
        }
        canvas.stroke();    
    }
}

export function drawBound(canvas, bounds, boundName){
    
    canvas.lineWidth = 1;

    let convexHull = bounds[boundName].convexHull;
    
    canvas.beginPath();
    canvas.moveToVec(convexHull[0]);
    for (let i = 1; i < convexHull.length; i++){
        canvas.lineToVec(convexHull[i]);
    }
    canvas.closePath();
    canvas.stroke();
}
