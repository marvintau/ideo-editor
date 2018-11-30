CanvasRenderingContext2D.prototype.moveToVec = function(vec, scale){
    this.moveTo(vec.x * scale, vec.y * scale);
}

CanvasRenderingContext2D.prototype.circle = function(vec, radius, scale, isFilling){
    this.beginPath();
    this.arc(vec.x * scale, vec.y * scale, radius, 0, Math.PI*2);
    if (isFilling) this.fill(); else this.stroke();
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
