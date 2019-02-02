import Polygon from "./Polygon.js";
import Stroke from "./Stroke.js";

export default class Region {
    
    constructor(s, parent){
        this.original = s;
        this.strokes = [];
        
        this.parent = parent;
        this.children = {};
        this.mass = this.original.area();
    }

    density(){
        return this.mass / this.original.area();
    }

    addSimpleStroke(strokeSpec){
        let newStroke = new Stroke(strokeSpec, this.original);
        newStroke.bezierize(2);
        this.strokes.push(newStroke);

        this.updateMass();
    }

    updateMassWith(mass){
        let region = this;
        while(region.parent !== undefined){
            region.mass += mass;
            region = region.parent;
        }
    }

    diameter(angle){
        return this.original.diameter(angle);
    }

    split(){
        for (let stroke of this.strokes){
            
            if(Object.keys(this.children).length == 0){
                const polygon = this.original;
                const {innerSide, outerSide} = polygon.splitBy(stroke);

                this.children["i"] = new Region(new Polygon(innerSide));
                this.children["o"] = new Region(new Polygon(outerSide));

                continue;
            }
            
            for (let polygonID in this.children){

                const polygon = this.children[polygonID].original;
            
                const {innerSide, outerSide} = polygon.splitBy(stroke);
            
                delete this.children[polygonID];
                this.children[polygonID+"i"] = new Region(new Polygon(innerSide));
                this.children[polygonID+"o"] = new Region(new Polygon(outerSide));
            }    
        }

        console.log("split", this);
    }
    
    updateChildrenMass(){
        // .... after some magic;

        let notReachedStableState = function(region){
            allRegionChildren
        }

        while(notReachedStableState()){
            nudgeStrokes();
        }

        this.mass = 0;
        for (let key in this.children){
            this.mass += this.children[key].mass;
        }
    }

    draw(ctx){
        if (Object.keys(this.children).length == 0){
            this.original.draw(ctx);
        } else for (let key in this.children)
            this.children[key].draw(ctx);
    
        for (let s of this.strokes) s.draw(ctx);
    }
    
}