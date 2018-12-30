/**
 * verletNext
 * 基于Verlet积分计算向量在下一个时刻的位置。
 * 
 * 注意：in-place操作，会直接改写curr
 * 
 * @param {Vec} curr 当前位置
 * @param {Vec} prev 上一位置
 * @param {Vec} accel 加速度
 * @param {number} delta 时间间隔
 */
function verletNext(curr, accel, delta, prev){
    curr.imult(2);
    curr.isub(prev);
    curr.imult(1/delta);
    curr.iadd(accel.mult(Math.pow(delta, 2)));
}

function verletInit(curr, accel, delta){
    curr.iadd(accel.mult(0.5 * Math.pow(delta, 2)));
}

class Kinect extends Vec{

    constructor(vec, accel){
        super(vec);
        this.accel = accel;
    }

    next(delta){
        if (this.prev === undefined) {
            const prev = this.copy();
            verletInit(this, this.accel, delta);
            this.prev = prev;
        } else {
            verletNext(this, this.accel, delta, this.prev);
        }
    }
}