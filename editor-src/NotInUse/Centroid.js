import Vec from "../Vec.js";

function pixelDensity(imageData){
    var width   = imageData.width * 4,
        height  = imageData.height,
        data    = imageData.data,
        centerX = 0,
        centerY = 0,
        sum     = 0;
    for (let row = 0; row < height; row ++)
    for (let col = 0; col < width;  col += 4){
        if(data[row * width + col] > 0){
            centerX += col;
            centerY += row;
            sum += 1;
        }
    }
    return {
        density: sum / Math.sqrt(Math.hypot(width, height)),
        // density: sum / (width * height),
        centroid: new Vec(centerX/4/sum, centerY/sum)
    };
}

function findCenterRect(ctx){

    var ss = performance.now();
    var width  = ctx.canvas.width,
        height = ctx.canvas.height,
        canvasData = ctx.getImageData(0, 0, width, height),
        canvasDensity = pixelDensity(canvasData),
        canvasCentroid = canvasDensity.centroid;

    var data, result, resultMax = {density: 0};
    for (let r = 0.02; r < 0.8; r += 0.02)
    for (let hw = 0.125; hw <= 1; hw += 0.125){
            var sx = canvasCentroid.x * (1-r * hw) ,
                sy = canvasCentroid.y * (1-r),
                sw = width * r * hw,
                sh = height * r;

            data = ctx.getImageData( sx, sy, sw, sh);
            result = pixelDensity(data);
            if(result.density > resultMax.density){
                resultMax = result;
                resultMax.r = r;
                resultMax.hw = hw;
            }
            // result.centroid.add(new Vec(sx, sy)).draw(ctx);
    }

    resultMax.centroid = resultMax.centroid.add(new Vec(sx, sy));
    ctx.fillStyle = "rgb(255, 255, 255, 0.5)";
    ctx.fillRect( canvasCentroid.x * (1-resultMax.r * resultMax.hw),
                  canvasCentroid.y * (1-resultMax.r),
                  width * resultMax.r * resultMax.hw,
                  height * resultMax.r);

    var tt = performance.now();
    return resultMax;
}
