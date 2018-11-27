CanvasRenderingContext2D.prototype.moveToVec = function(vec, scale){
    this.moveTo(vec.x * scale, vec.y * scale);
}

CanvasRenderingContext2D.prototype.lineToVec = function(vec, scale){
    this.lineTo(vec.x * scale, vec.y * scale);
}

CanvasRenderingContext2D.prototype.bezierCurveToVec = function(vecs, scale){
    if(vecs.length == 3) this.bezierCurveTo(
        vecs[0].x * scale, vecs[0].y * scale,
        vecs[1].x * scale, vecs[1].y * scale,
        vecs[2].x * scale, vecs[2].y * scale
    );
}

export function drawFrame(canvas, width, height, style){

    if(style === undefined) style = {lineWidth:1, strokeStyle : "rgb(0, 0, 0, 0.2)"};

    Object.assign(canvas, style);
    canvas.beginPath();
    canvas.rect(0.05*width, 0.05*height, 0.9*width, 0.9*height);
    for (let i = 2; i < 5; i++){
        canvas.moveTo(0,      i * width / 6);
        canvas.lineTo(height, i * width / 6);
        canvas.moveTo(i * height / 6,   0);
        canvas.lineTo(i * height / 6, width);
    } 
    canvas.stroke();
}

export function drawBBox(canvas, box, scale, style){

    if(style === undefined) style = {lineWidth:1.5, strokeStyle : "rgb(192, 64, 0, 0.7)"};
    Object.assign(canvas, style);

    var size = box.size(),
        cen  = box.center();

    canvas.beginPath();
    canvas.rect(box.head.x * scale, box.head.y * scale, size.x * scale, size.y * scale);
    canvas.stroke();
    canvas.beginPath();
    canvas.arc(cen.x*scale, cen.y*scale, 3, 0, Math.PI*2);
    canvas.stroke();

    canvas.translate(128,128);

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

export function drawRadical(canvas, strokeWidth, points, scale){
    canvas.lineWidth = strokeWidth;
    canvas.lineCap = "square";
    canvas.lineJoin = "miter";
    canvas.miterLimit = 3;
    canvas.strokeStyle = "black";

    for (let i = 0; i < points.length; i++){

        let seg = 0;
        canvas.beginPath();
        canvas.moveToVec(points[i][seg], scale);

        for (; seg < points[i].length;){
            if (points[i].length - seg > 3) {
                canvas.bezierCurveToVec(points[i].slice(seg+1, seg+4), scale);    
                seg += 3;
            } else {
                canvas.lineToVec(points[i][seg], scale);
                seg += 1;
            }
        }
        canvas.stroke();    
    }

}

export function drawBound(canvas, bounds, scale, color){
    
    canvas.fillStyle = color;

    let convex = bounds.convex;
    
    canvas.beginPath();
    canvas.moveToVec(convex[0], scale);
    for (let i = 1; i < convex.length; i++){
        canvas.lineToVec(convex[i], scale);
        // console.log(convex[i].mult(scale));
    }
    canvas.closePath();
    canvas.fill();
}
