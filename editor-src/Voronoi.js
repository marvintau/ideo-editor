import Vec from "./Vec";

/**
 * Create a ConeBufferGeometry object
 * @param {THREE.Material} material material of this cone
 * @returns {THREE.Mesh}
 */
function createSingleCone(material){
    
    var coneGeom = new THREE.ConeBufferGeometry(250, 200, 60),
        cone     = new THREE.Mesh(coneGeom, material);
    
    cone.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI/2);
    return cone;
}

/**
 * Create an array of cones with same material
 * @param {*} coneNumber 
 * @param {*} material 
 * @returns { THREE.Mesh[] }
 */
function createStrokeCone(coneNumber, material){
    var cones = [];
    for( let i = 0; i < coneNumber; i++){
        cones.push(createSingleCone(material));
    }
    return cones;
}

/**
 * create an array of array of cones from radical point
 * array
 * @param {[][]} radical array of array.
 */
function createRadicalCone(radical, mats){
    var cones = [];

    for( let i = 0; i < radical.length; i++){
        cones.push(radical[i].map((e, j) => createStrokeCone(e.length, mats[i][j])));
    }       
    return cones;
}

/**
 * sample a point list of the stroke
 * @param {Array} stroke array of point
 * @param {number} resolution how many pieces will be divided
 */
function strokeSample(stroke, resolution){
    var res = [];
    for(let i = 0; i < stroke.length-1; i++){
        var segList = stroke[i].sampleTo(stroke[i+1], resolution);
        res = res.concat(segList);
    }
    res.push(stroke[stroke.length-1]);
    return res;
}

/**
 * sample a whole radical
 * @param {Array} strokeList array of array of point
 * @param {*} resolution 
 */
function radicalSample(strokeList, resolution){

    var res = [];
    for (let i = 0; i < strokeList.length; i++){
        res.push([]);
        for( let j = 0; j < strokeList[i].length; j++)
            res[res.length-1].push(strokeSample(strokeList[i][j], resolution));
    }
        
    return res;
}

/**
 * 
 * @param {Array} radical original stroke point list
 * @param {number} resolution resolution
 * @param {THREE.scene} scene three.js scene object
 */
function initVoronoiCones(radical, resolution, scene, mats){
    var sampledRadical = radicalSample(radical, resolution);
    var cones = createRadicalCone(sampledRadical, mats);

    for (let i = 0; i < sampledRadical.length; i++)
    for (let j = 0; j < sampledRadical[i].length; j++)
    for (let k = 0; k < sampledRadical[i][j].length; k++)
        scene.add(cones[i][j][k]);
        
    return cones;
}

/**
 * 
 * @param {Array} radical original stroke point list
 * @param {Array} cones cones object
 */
function updateVoronoiCones(radical, cones, resolution){

    var sampledRadical = radicalSample(radical, resolution);

    for (let i = 0; i < sampledRadical.length; i++)
    for (let j = 0; j < sampledRadical[i].length; j++)
    for (let k = 0; k < sampledRadical[i][j].length; k++){
        let point = sampledRadical[i][j][k];
        cones[i][j][k].position.set(point.x, point.y, -100)
    }
}

/**
 * wrapped voronoi stuff into class
 */
export default class Voronoi {

    // do nothing when creating object
    constructor(scene, resolution){
        this.resolution = resolution;
        this.scene = scene;
        this.mats = [];
        this.cones = [];
    }

    /**
     * Should be called right after the first time of getting radical
     * list
     * @param {Array} radical radical list
     * @param {number} resolution resolution
     * @param {THREE.scene} scene scene object
     */
    init(radical){

        this.mats = [];
        for (let i = 0; i < radical.length; i++){
            this.mats.push([]);
            for (let j = 0; j < radical[i].length; j++){
                var color = new THREE.Color( "rgb(" + (255-j*20)+ ", "+ (255-i*20) +", "+ (255-i*20) + ")");
                this.mats[i].push(new THREE.MeshBasicMaterial({color: color, side:THREE.BackSide}));    
            }
        }
            
        this.cones = initVoronoiCones(radical, this.resolution, this.scene, this.mats);
    }

    /**
     * used when updating
     * @param {Array} radical radical list
     */
    update(radical){
        updateVoronoiCones(radical, this.cones, this.resolution);
    }

    dispose(){
        for (let i = 0; i < this.cones.length; i++)
        for (let j = 0; j < this.cones[i].length; j++)
        for (let k = 0; k < this.cones[i][j].length; k++){
            this.cones[i][j][k].geometry.dispose();
            this.cones[i][j][k].material.dispose();
            this.cones[i][j][k] = undefined;
        }

        for(let i = 0; i < this.mats.length; i++)
        for(let j = 0; j < this.mats[i].length; j++){
            this.mats[i][j].dispose();
            this.mats[i][j] = undefined;
        }
    }
}