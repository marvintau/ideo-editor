

function initLine(radical, scene, mat){
    var lines = [];
    for (let i = 0; i < radical.length; i++){
        lines.push([]);
        for (let j = 0; j < radical[i].length; j++){
            var line = new THREE.Line(new THREE.Geometry(), mat);
            lines[i].push(line);
            scene.add(line);
        }
    }

    return lines;
}

function updateLine(lines, radical){
    for (let i = 0; i < radical.length; i++)
    for (let j = 0; j < radical[i].length; j++){
        lines[i][j].geometry.vertices = radical[i][j].map(v => new THREE.Vector3(v.x, v.y, 0));
        lines[i][j].geometry.verticesNeedUpdate = true;
    }
}

function dispose(lines){
    for (let i = 0; i < lines.length; i++)
    for (let j = 0; j < lines[i].length; j++){
        lines[i][j].geometry.dispose();
        lines[i][j] = undefined;
    }
}

export default class Lines {

    // do nothing when creating object
    constructor(scene){
        this.scene = scene;
        this.mat  = new THREE.LineBasicMaterial( { color: 0x000000} );
        this.lines = [];
    }

    /**
     * Should be called right after the first time of getting radical
     * list
     * @param {Array} radical radical list
     * @param {number} resolution resolution
     * @param {THREE.scene} scene scene object
     */
    init(radical){
        this.lines = initLine(radical, this.scene, this.mat);
    }

    /**
     * use when updating
     * @param {Array} radical radical list
     */
    update(radical){
        updateLine(this.lines, radical);
    }

    /**
     * use before clearing the scene.
     */
    dispose(){
        dispose(this.lines);
        this.lines = [];
    }
}