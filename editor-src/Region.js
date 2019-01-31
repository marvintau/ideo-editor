import Polygon from "./Polygon.js";
import Stroke from "./Stroke.js";

export default class Region {
    
    constructor(s){
        this.original = s;
        this.strokes = [];
        
        this.children = {};
    }

    addSimpleStroke(strokeSpec){
        let newStroke = new Stroke(strokeSpec, this.original);
        newStroke.bezierize(2);
        this.strokes.push(newStroke);
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
    
    draw(ctx){
        if (Object.keys(this.children).length == 0){
            this.original.draw(ctx);
        } else for (let key in this.children)
            this.children[key].draw(ctx);
    
        for (let s of this.strokes) s.draw(ctx);
    }
    
}