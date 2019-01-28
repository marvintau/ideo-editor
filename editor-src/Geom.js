import {forSucc} from "./Supp.js";
import Vec from "./Vec.js";

export function intersectSegSeg(p1, p2, p3, p4){

    let det_s =  p1.sub(p3).cross(p3.sub(p4)),
        det_t = -p1.sub(p2).cross(p1.sub(p3)),
        det   =  p1.sub(p2).cross(p3.sub(p4));

    let s = det_s/det,
        t = det_t/det,
        p = p1.add(p2.sub(p1).mult(s));

    return { p, s, t};
}

export function area(polygon){

    let area = 0;

    if(polygon.length > 3) forSucc(polygon, function(p, pHead, pTail){
        area += pHead.cross(pTail)/2;
    });

    return area;
}

function moment(polygon, axis){

    let moment = 0;
    
    forSucc(polygon, function(p, pHead, pTail){
        moment += (pHead[axis] + pTail[axis]) * pHead.cross(pTail) / 6;
    });

    return moment;
}

export function centroid(polygon){

    if (polygon.length > 2){
    
        let momentX  = moment(polygon, "x"),
            momentY  = moment(polygon, "y"),
            polyArea = area(polygon);
    
        return new Vec(momentX/polyArea, momentY/polyArea);
    } else {
        console.error("centroid needs at least two points over the curve");
    }

}