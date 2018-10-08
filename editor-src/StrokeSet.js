import CurveStructureBase from "./CurveStructureBase.js";

/**
 * StrokeSet is such a structure that, it contains several strokes, including
 * their intersecting information, but not aligning. like 戈, 匕. 
 * 
 */
export default class StrokeSet extends CurveStructureBase{
    constructor(strokes, head, spec) {
        super(CompoundCurve, strokes, head, spec);

        // crossing stores the crossing information between strokes.
        // crossing can be further modified by external specs, thus
        // it has to be 
        this.crossing = spec.crossing;
    }
}