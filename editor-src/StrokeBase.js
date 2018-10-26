import Radical from "./Radical.js";
import Loadable from "./Loadable.js";
import Voronoi from "./Voronoi.js";
import Vec from "./Vec.js";
import Lines from "./Lines.js";


export default class StrokeBase extends Loadable{

    constructor(){
        
        super();

        this.initView();
        this.lines =   new Lines(this.scene);
        this.voronoi = new Voronoi(this.scene, 15);

    }

    initView(){
        var width  =  470,
            height =  470,
            near   = -235,
            far    =  235;
            
        this.renderer = new THREE.WebGLRenderer();
        this.camera   = new THREE.OrthographicCamera( width/-2, width/2, height/-2, height/2, near, far);
        this.scene    = new THREE.Scene();

        this.renderer.setSize(width, height);
        document.getElementById("canvas-wrap").appendChild(this.renderer.domElement);
        
        this.size = this.renderer.getSize();
        
        this.camera.lookAt( 0, 0, 0 );

    }

    clearScene(){
        this.lines.dispose();
        this.voronoi.dispose();
        
        while (this.scene.children.length > 0){
            this.scene.remove(this.scene.children[0]);
        }
    }

    initStroke(charName){        
        this.getStrokeSpec(charName);
        this.initVariableControls();

        this.clearScene();

        let radical = new Radical(this.currSpec),
            points  = radical.toPointList(this.size, 0.9);

        this.lines.init(points);
        this.voronoi.init(points, 10);

        this.updateStroke();
    }

    updateStroke(){
        let radical = new Radical(this.currSpec),
            points  = radical.toPointList(this.size, 0.9);

        this.lines.update(points);
        this.voronoi.update(points);
        this.renderer.render(this.scene, this.camera);
    }
}
