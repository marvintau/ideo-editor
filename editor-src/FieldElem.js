import Vec from "./Vec";

/**
 * 场线段
 * 能够激发梯度场的线段。
 * 
 * 1. 场线段只有位置和长度属性，没有质量属性。
 * 2. 
 */
export default class FieldElem{
    constructor(head, tail){
        this.head = head;
        this.tail = tail;
    }

    /**
     * intensity over another fieldElem
     * @param {FieldElem} that the vec to be applied with field force
     */
    intensityOver(that){

        // 获取两向量关系，垂直得0.5，平行得-0.5
        let selfDir = this.tail.sub(this.head),
            oppoDir = that.tail.sub(that.head),
            selfMag = selfDir.mag(),
            oppoMag = oppoDir.mag(),
            angle   = Math.arcsin(Math.abs(selfDir.cross(oppoDir))/(selfMag * oppoMag))/(Math.PI/2) - 1;

        // 获取两向量距离
        let selfCenter = this.tail.add(this.head).mult(0.5),
            oppoCenter = that.tail.add(that.head).mult(0.5),
            direction  = oppoCenter.sub(selfCenter),
            directUnit = direction.norm(),
            distMag    = direction.mag();
        
        return directUnit.mult(angle / Math.pow(distMag, 2));
    }

    intensityFrom(segs){
        let intensity = new Vec();
        for (let i = 0; i < segs.length; i++) {
            const seg = segs[i];
            intensity.iadd(seg.intensityOver(this));
        }
        return intensity;
    }
}
