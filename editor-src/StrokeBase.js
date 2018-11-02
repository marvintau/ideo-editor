import Radical from "./Radical.js";
import Loadable from "./Loadable.js";
import Voronoi from "./Voronoi.js";
import Lines from "./Lines.js";
import Vec from "./Vec.js";


function drawPolygon(ctx, bound, color){
    
    let points = bound.convexHull,
        centroid = bound.centroid;

    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.translate(235, 235);
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for(let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    // ctx.lineTo(points[0].x, points[0].y);
    ctx.closePath();
    ctx.stroke();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.beginPath();
    ctx.arc(centroid.x + 235, centroid.y + 235, 3, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;

    return centroid;
}



export default class StrokeBase extends Loadable{

    constructor(){
        
        super();

        this.initView();

        this.lines =   new Lines(this.scene);
        this.voronoi = new Voronoi(this.scene, 10);

        this.snap = document.getElementById("screenshot").getContext('2d');

        this.image = new Image;
        this.image.onload = function(){
            this.snap.drawImage(this.image, 0, 0);

            // let interior = getInterior(this.points);
            drawPolygon(this.snap, this.radical.bounds.interior, "rgba(123,138,142, 0.9)");

            // let medier = getMedier(this.points);
            drawPolygon(this.snap, this.radical.bounds.median, "rgba(123,138,142, 0.9)");

            // let outlier = getOutlier(this.points);
            drawPolygon(this.snap, this.radical.bounds.outlier, "rgba(52,108,112, 0.4)");
            

        }.bind(this);
    }

    initView(){
        var width  =  470,
            height =  470,
            near   = -235,
            far    =  235;
            
        this.renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true });
        this.camera   = new THREE.OrthographicCamera( width/-2, width/2, height/-2, height/2, near, far);
        this.scene    = new THREE.Scene();

        this.renderer.setSize(width, height);
        document.getElementById("canvas-wrap").appendChild(this.renderer.domElement);
        
        this.size = this.renderer.getSize();
        
        this.camera.lookAt( 0, 0, 0 );

    }

    clearScene(){        
        while (this.scene.children.length > 0){
            this.scene.remove(this.scene.children[0]);
        }

        this.lines.dispose();
        this.voronoi.dispose();

    }

    initStroke(charName){        
        this.getStrokeSpec(charName);
        this.initVariableControls();

        this.clearScene();

        this.radical = new Radical(this.currSpec);

        this.lines.init(this.radical.points);
        this.voronoi.init(this.radical.points);

        this.updateWithPoint();        
    }

    updateStroke(){
        this.radical = new Radical(this.currSpec);
        this.updateWithPoint();
    }

    updateWithPoint(){
        let points = this.radical.points;
        this.lines.update(points);
        this.voronoi.update(points);

        this.renderer.render(this.scene, this.camera);
        this.image.src = this.renderer.domElement.toDataURL();
    }
}
