import Polygon from "./Polygon.js";
import Stroke from "./Stroke.js";

export default class Region {
    
    constructor(s){
        this.original = s;
        this.strokes = [];
        
        this.poly = { s };
    }

    addStroke(stroke){

    }

    split(){
        for (let stroke of this.strokes)
        for (let polygonID in this.poly){
            const polygon = this.poly[polygonID];
        
            const {innerSide, outerSide} = polygon.splitBy(stroke);
        
            delete this.poly[polygonID];
            this.poly[polygonID+"i"] = new Polygon(innerSide);
            this.poly[polygonID+"o"] = new Polygon(outerSide);
        }

        console.log(this);
    }
    
    draw(ctx){
        for (let key in this.poly) if (this.poly[key].type == "Polygon")
            this.poly[key].draw(ctx);
    
        for (let s of this.strokes) s.draw(ctx);
    }
    
}