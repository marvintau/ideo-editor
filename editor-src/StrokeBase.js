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
        this.preview = document.getElementById("preview").getContext('2d');
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


    updateWithPoint(){
        let points = this.radical.points,
            bounds = getBounds(points),
            center = bounds.median.centroid.isNaN() ? bounds.outlier.centroid : bounds.median.centroid;

        console.log(center, bounds);

        this.preview.clearRect(-128, -128, 384, 384);

        for (let i = 0; i < points.length; i++)
            for (let p = 0; p < points[i].length; p++)
                points[i][p].isub(center);

        for (let i = 0; i < bounds.outlier.convexHull; i++)
            bounds.outlier.convexHull[i].isub(center);
        for (let i = 0; i < bounds.median.convexHull; i++)
            bounds.median.convexHull[i].isub(center);
        for (let i = 0; i < bounds.interior.convexHull; i++)
            bounds.interior.convexHull[i].isub(center);


        this.preview.beginPath();
        this.preview.rect(16, 16, 224, 224);
        this.preview.stroke();

        this.preview.translate(128, 128);
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
        this.preview.beginPath();
        this.preview.moveTo(bounds.median.convexHull[0].x, bounds.median.convexHull[0].y);
        for (let i = 0; i < bounds.median.convexHull.length; i++){
            this.preview.lineTo(bounds.median.convexHull[i].x, bounds.median.convexHull[i].y);
        }
        this.preview.closePath();
        this.preview.stroke();

        console.log(bounds.outlier.convexHull);
        this.preview.beginPath();
        this.preview.moveTo(bounds.outlier.convexHull[0].x, bounds.outlier.convexHull[0].y);
        for (let i = 0; i < bounds.outlier.convexHull.length; i++){
            this.preview.lineTo(bounds.outlier.convexHull[i].x, bounds.outlier.convexHull[i].y);
        }
        this.preview.closePath();
        this.preview.stroke();

        this.preview.setTransform(1, 0, 0, 1, 0, 0);
    }

}
