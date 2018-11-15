import Radical from "./Radical.js";
import Loadable from "./Loadable.js";
import { getBounds } from "./Interior.js";

Array.prototype.sum = function(){
    if (this.length == 0)
        return 0;
    else
        return this.reduce((s, e) => s+e);
}

Array.prototype.mean = function(){
    return this.sum() / this.length;
}

export default class StrokeBase extends Loadable{

    constructor(){
        
        super();
        // this.original = document.getElementById("original").getContext('2d');
        // this.compare = document.getElementById("compare").getContext('2d');
        this.preview = document.getElementById("preview").getContext('2d');
        // this.previewImg = new Image;
        // this.previewImg.onload = function(){
        //     this.preview.drawImage(this.previewImg, 0, 0);
        // }.bind(this);

        document.getElementById('nudge').onclick = function(e){
            this.nudge();
        }.bind(this);

        this.previewFont = "Source Han Serif CN";
    }


    initStroke(charName){        
        this.getStrokeSpec(charName);
        this.initVariableControls();

        this.radical = new Radical(this.currSpec);
        this.updateWithPoint();        
    }

    updateStroke(){
        this.radical = new Radical(this.currSpec);
        this.updateWithPoint();
    }

    nudge(){

        console.log(this.currSpec.vars);

    }

    updateWithPoint(){
        let points = this.radical.points,
            bounds = getBounds(points),
            center = bounds.median.centroid.isNaN() ? bounds.outlier.centroid : bounds.median.centroid;

        console.log(center, bounds);

        for (let i = 0; i < points.length; i++)
            for (let p = 0; p < points[i].length; p++)
                points[i][p].isub(center);

        for (let i = 0; i < bounds.outlier.convexHull; i++)
            bounds.outlier.convexHull[i].isub(center);
        for (let i = 0; i < bounds.median.convexHull; i++)
            bounds.median.convexHull[i].isub(center);
        for (let i = 0; i < bounds.interior.convexHull; i++)
            bounds.interior.convexHull[i].isub(center);

        this.preview.fillStyle = "white";
        this.preview.fillRect(0, 0, 256, 256);
            
        if(this.currCharName.length == 1){
            this.preview.font= (256 * 0.9) + "px '"+this.previewFont+"'";
            this.preview.textAlign = "center";
            this.preview.textBaseline = "bottom";
    
            this.preview.fillStyle = "rgb(32, 32, 32, 0.5)";
            this.preview.fillText(this.currCharName, 128, 288)
        }


        this.preview.translate(128, 128);
        // this.preview.scale(2, 2);
        this.preview.lineWidth = this.strokeWidth;
        this.preview.lineCap = "square";
        this.preview.lineJoin = "miter";
        this.preview.miterLimit = 3;
        this.preview.strokeStyle = "black";

        for (let i = 0; i < points.length; i++){

            let seg = 0;
            this.preview.beginPath();
            this.preview.moveTo(points[i][seg].x, points[i][seg].y);

            for (; seg < points[i].length;){
                if (points[i].length - seg > 3) {
                    this.preview.bezierCurveTo(
                        points[i][seg+1].x, points[i][seg+1].y,
                        points[i][seg+2].x, points[i][seg+2].y,
                        points[i][seg+3].x, points[i][seg+3].y
                    );    
                    seg += 3;
                } else {
                    let p = points[i][seg];
                    this.preview.lineTo(p.x, p.y);
                    seg += 1;
                }
            }
            this.preview.stroke();    
        }

        this.preview.translate(-center.x, -center.y);
        this.preview.lineWidth = 1;
        console.log(bounds.median.convexHull);
        this.preview.moveTo(bounds.median.convexHull[0].x, bounds.median.convexHull[0].y);
        for (let i = 0; i < bounds.median.convexHull.length; i++){
            this.preview.lineTo(bounds.median.convexHull[i].x, bounds.median.convexHull[i].y);
        }
        this.preview.closePath();
        this.preview.stroke();

        this.preview.setTransform(1, 0, 0, 1, 0, 0);

        // let prevData = this.preview.getImageData(0, 0, 128, 128),
        //     origData = this.original.getImageData(0, 0, 128, 128),
        //     compData = this.compare.getImageData(0, 0, 128, 128);

        // for (let i = 0; i < prevData.data.length; i++){
        //     prevData.data[i] = (origData.data[i] + compData.data[i]) / 2;
        // }
        // this.preview.putImageData(prevData, 0, 0);

        // StackBlur.canvasRGB(this.original.canvas, 0, 0, 128, 128, 8);
        // StackBlur.canvasRGB(this.compare.canvas, 0, 0, 128, 128, 8);

        // let diff = [];
        // origData = this.original.getImageData(0, 0, 128, 128);
        // compData = this.compare.getImageData(0, 0, 128, 128);
        
        // for (let i = 0; i < origData.data.length; i++){
        //     diff.push(Math.abs(origData.data[i] - compData.data[i])/255);
        // }
        
        // let diffMean = diff.mean();
        // document.getElementById("difference").innerText = diffMean.toFixed(8);
        
        // return diffMean;
    }

}
