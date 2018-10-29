import Vec from "./Vec.js";
import CurveStructureBase from "./CurveStructureBase.js";
import Stroke from "./Stroke.js";

/**
 * intersection of two line segments
 * https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection#Given_two_points_on_each_line
 * @param {Vec} p1 start of a
 * @param {Vec} p2 end of a
 * @param {Vec} p3 start of b
 * @param {Vec} p4 end of b
 */
function lineLineIntersect(p1, p2, p3, p4){
    var det_s =  p1.sub(p3).cross(p3.sub(p4)),
        det_t = -p1.sub(p2).cross(p1.sub(p3)),
        det   =  p1.sub(p2).cross(p3.sub(p4));

    var s = det_s/det,
        t = det_t/det;

    return {p: p1.add(p2.sub(p1).mult(s)), s:s, t:t};
}

function findIntersections(pointList){

    for ( let s = 0; s < pointList.length; s++)
        for (let k = 0; k < s; k ++){
            for (let i = 0; i < pointList[s].length-1; i++)
            for (let j = 0; j < pointList[k].length-1; j++){
                var intersect = lineLineIntersect(pointList[s][i], pointList[s][i+1], pointList[k][j], pointList[k][j+1]);
                intersect.p.intersect = true;
                // console.log(intersect);
                if(intersect.s < 1 && intersect.s > 0 && intersect.t > 0 && intersect.t < 1){
                    pointList[s].splice(i+++1, 0, intersect.p);
                    pointList[k].splice(j+++1, 0, intersect.p);
                }
            }
        }

    for (let s = 0; s < pointList.length; s++){
        var segs = [[]];
        for (let i = 0; i < pointList[s].length; i++){
            segs[segs.length-1].push(pointList[s][i]);
            if(pointList[s][i].intersect) segs.push([pointList[s][i]]);
        }
        pointList[s] = segs;
    }

    return pointList;
}


/**
 * Radical is such a structure that, it contains several strokes, including
 * their intersecting information, but not aligning. like 戈, 匕. 
 * 
 */
export default class Radical extends CurveStructureBase{
    
    constructor(spec) {
        super(Stroke, spec);
        this.modify();
    }

    cross(spec){

        var pointDest = this.body[spec.dest.ith].at(spec.dest),
            pointSelf = this.body[spec.self.ith].at(spec.self);

        this.body[spec.self.ith].trans(pointDest.sub(pointSelf));
    }

    // Stroke set contains strokes that starting from different
    // position, thus the updating is actually adding the offset
    // to components respectively, instead of conjuncting curves
    // together.

    update(){        
        // first deal with the first component. 
        if(this.body.length > 0){
            this.body[0].update();
            this.box  = this.body[0].box;
        }
        if(this.body.length > 1){
            for(let i = 1; i < this.body.length; i++){
                this.body[i].update();
                this.box = this.box.union(this.body[i].box);
            }    
        }
    }

    stretchFull(size, limit){
        var thisSize = this.box.size(),
            width    = size.width  * limit,
            height   = size.height * limit;

        var ratio;
        if (Math.min(thisSize.x, thisSize.y) > Math.max(width, height)){
            ratio = Math.max( width  / thisSize.x, height / thisSize.y );
        } else {
            ratio = Math.min( width  / thisSize.x, height / thisSize.y );
        }

        for(let comp of this.body){
            comp.head = comp.head.mult(ratio);
        }

        this.scale(ratio);
        this.update();
    }

    transCenter(){
        for (let comp of this.body){
            comp.head = comp.head.add((new Vec()).sub(this.box.center()));
        }
        this.update();
    }

    toPointList(size, ratio){

        this.stretchFull(size, ratio);
        this.transCenter();
            
        var points = [];
        for(let component of this.body)
            points = points.concat(component.toPointList());

        points = findIntersections(points);
        return points;
    }
}
