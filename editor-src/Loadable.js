import Input from "./Input.js";
import {fromJSONObject, toJSONText} from "./ION.js";

function dup(json){
    return JSON.parse(JSON.stringify(json));
}

function getStrokeSpecRecur(strokeNextElem, base){
    let stroke = dup(base[strokeNextElem]);
    delete stroke.text;

    switch(stroke.type){
        case "radical":
            stroke.body = stroke.body.reduce(function(list, elem){
                let strokeElem = getStrokeSpecRecur(elem, base);
                return (strokeElem.type == "radical") ? list.concat(strokeElem.body) : list.concat(strokeElem);
            }, []);
            return stroke;
        case "compound":
            stroke.body = stroke.body.reduce(function(list, elem){
                let strokeElem = getStrokeSpecRecur(elem, base);

                // a note about recursive call:
                // by this point, all elements in strokeElem body has been found.
                // the lower level of flattening has been done in previous calls.
                return (strokeElem.type == "compound") ? list.concat(strokeElem.body) : list.concat(strokeElem);
            }, []);
            return stroke;
        case "simple":
            return {type:"compound", body:[stroke]};
    }
}

function getStrokeSpec(strokeName, base){
    
    if (base[strokeName].type == "radical")
        return getStrokeSpecRecur(strokeName, base);
    else
        return {type:"radical", vars:{}, body:[getStrokeSpecRecur(strokeName, base)]};
}

function suggestSpec(specOrig, specDeri){
    console.log(specOrig, specDeri, "suggestSpec");
    var newSpec = {body: specOrig.body, type: specOrig.type, prog:[]};

    for (let i = 0; i < specDeri.body.length; i++){
        let stroke = specDeri.body[i];
        console.log(stroke, "suggestedSpec stroke");
        if(stroke.body.length == 1)
            newSpec.prog.push({ith:i, scale: 1, rotate:0, curl: 0});
        else
            newSpec.prog.push({
                ith: i,
                prog: stroke.body.map((e, j) => ({ith:j, scale: 1, rotate: 0, curl: 0}))
            });
    }

    if(specDeri.body.length > 1) for (let i = 1; i < specDeri.body.length; i++){
        newSpec.prog.push({cross:{
            dest:{ith: i-1, curve: 0, r: 0},
            self:{ith: i, curve: 0, r: 0}
        }})
    }

    console.log(newSpec, "suggestedSpec");
    return newSpec;
}

function replaceSingleVariable(key, val){
    switch(key){
        case "rotate":
            return {val: val, range:{min: val-20, max: val+20}};
        case "curl":
            return {val: val, range:{min: val-10, max: val+10}};
        case "scale":
            return {val: val, range:{min: val*0.8, max:val/0.8}};
        case "r":
            return {val: val, range:{min: val-0.1, max:val+0.1}};
    }
}

function replaceVariables(spec){
    spec.vars = {};

    let ithStroke = 0,
        ithCurve = 0;
    for (let is = 0; is < spec.prog.length; is++)
        for (let key in spec.prog[is]){
            if (key == "ith")
                ithStroke = spec.prog[is].ith;
            else if (key == "prog")
                for (let ic = 0; ic < spec.prog[is].prog.length; ic++)
                    for (let keyc in spec.prog[is].prog[ic])
                        if (keyc == "ith")
                            ithCurve = spec.prog[is].prog[ic].ith;
                        // else if((keyc in ["rotate", "curl"] && keyc != 0) || keyc == "scale" && keyc != 1){
                        else {
                            let nonVars1 = (keyc in ["rotate", "curl"] && spec.prog[is].prog[ic][keyc] == 0),
                                nonVars2 = (keyc == "scale" && spec.prog[is].prog[ic][keyc] == 1);
                            if (!nonVars1 && !nonVars2){
                                let varName = keyc + "-" + ithStroke + "-" + ithCurve;
                                spec.vars[varName] = replaceSingleVariable(keyc, spec.prog[is].prog[ic][keyc]);
                                spec.prog[is].prog[ic][keyc] = varName;    
                            }
                        }
            else if (key == "cross"){
                let cross = spec.prog[is].cross,
                    varSelfName = "cross-"+ cross.self.ith + "-" + cross.dest.ith + "-" + "self",
                    varDestName = "cross-"+ cross.self.ith + "-" + cross.dest.ith + "-" + "dest";

                if(cross.self.r != 1 && cross.self.r != 0){
                    spec.vars[varSelfName] = replaceSingleVariable("r", cross.self.r);
                    spec.prog[is].cross.self.r = varSelfName;
                }

                if(cross.dest.r != 1 && cross.dest.r != 0){
                    spec.vars[varDestName] = replaceSingleVariable("r", cross.dest.r);
                    spec.prog[is].cross.dest.r = varDestName;
                }
            }
            // else if((key in ["rotate", "curl"] && spec.proc[is][key] != 0) || key == "scale" && spec.prog[is][key] != 1){
            else {
                let nonVars1 = ((key == "rotate" || key == "curl") && spec.prog[is][key] == 0),
                    nonVars2 = (key == "scale" && spec.prog[is][key] == 1),
                    nonVars = nonVars1 || nonVars2;
                    console.log(key, spec.prog[is][key], key in ["rotate", "curl"]);
                if(!nonVars){
                    let varName = key + "-" + ithStroke;
                    spec.vars[varName] = replaceSingleVariable(key, spec.prog[is][key]);
                    spec.prog[is][key] = varName;
                }
            }
        }
    
    return spec;
}

function addSlider(name, variable, func){
    var x = document.createElement("INPUT");
    x.setAttribute("type", "range");
    x.classList.add("slider");

    x.setAttribute("name", name);
    x.setAttribute("min", variable.range.min);
    x.setAttribute("max", variable.range.max);
    x.setAttribute("value", variable.val);
    x.setAttribute("step", 0.001);
    x.addEventListener('input', func);
    x.addEventListener('change', func);

    return x;
}

function addNumberIndicator(name, val){
    var x = document.createElement("SPAN");
    x.setAttribute("id", name+"-indicator");
    x.classList.add("indicator");
    x.innerText = val;
    return x;
}

function addLabel(name){
    var x = document.createElement('label');
    x.innerHTML = name;
    x.setAttribute('for', name);
    return x;
}

function addInput(name, variable, func){
    var x = document.createElement("div");
    x.appendChild(addLabel(name));
    if(variable.val != undefined){
        x.appendChild(addSlider(name, variable, func));
        x.appendChild(addNumberIndicator(name, variable.val));
    }
    return x;
}


/**
 * load stroke base specification JSON from server
 */
function loadStrokeBase () {

    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', "data/stroke-spec.json", true);

        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}

function saveStrokeBase(payload) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', "save", true);
        xhr.setRequestHeader('content-type', 'application/json');

        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send(payload);
    });
}

export default class Loadable {

    constructor(){
        this.base  = {};
        this.input = new Input(this);
        this.currCharName = "";
        this.currSpec = {};

        this.shouldShowStrokes = false;

        document.getElementById('create').onclick = function(e){
            this.create();
        }.bind(this);

        document.getElementById('show-stroke').onclick = function(e){
            this.shouldShowStrokes = !this.shouldShowStrokes;
            this.updateUI(this.base);
        }.bind(this);

        document.getElementById('generate-spec').onclick = function(e){
            this.suggest();
        }.bind(this);

        document.getElementById('replace-vars').onclick = function(e){
            this.replaceVars();
        }.bind(this);

    }

    updateBase(){
        loadStrokeBase()
        .then(function(data){
            this.base = JSON.parse(data);
            this.updateUI(this.base);
        }.bind(this));
    }

    updateUI(chars){
        var charUI = document.getElementById("char-list");
    
        while (charUI.firstChild) {
            charUI.removeChild(charUI.firstChild);
        }

        for(let charName in chars)
        if (this.shouldShowStrokes || this.base[charName].type === "radical"){
            
            var p = document.createElement('button')
            p.appendChild(document.createTextNode(charName));
            p.classList.add('char-button'); 

            p.onclick = function(e){
                this.currCharName = charName;
                this.initStroke(charName);
                this.input.update(this.getStrokeSpecText(charName));
            }.bind(this);

            charUI.appendChild(p);
        }
    }

    submit(){
        var text = document.getElementById("stroke-list").value;
        var updatedSpec = JSON.parse(toJSONText(text));
        this.base[this.currCharName] = updatedSpec;
        this.base[this.currCharName].text = text;
        this.initStroke(this.currCharName);
    }

    save(){
        var stringified = JSON.stringify(this.base, null, 2),
            charName    = this.currCharName;
        saveStrokeBase(stringified).then(function(e){
            document.getElementById("indicator").innerText = "『" + charName + "』字编辑已然保存";
        }).catch(function(e){
            console.log("error", e);
        });
    }

    suggest(){

        // right after submit, the current spec is the fresh and
        // incomplete one. we get the full one through getStrokeSpec.
        // then get the suggestedSpec from suggestSpec. Notably, we
        // don't save this one, because it's used for deriving progs,
        // and too detailed to save.
        this.submit();
        this.getStrokeSpec(this.currCharName);
        this.base[this.currCharName] = suggestSpec(this.base[this.currCharName], this.currSpec);
        this.base[this.currCharName].text = fromJSONObject(this.base[this.currCharName]);
        this.input.update(this.base[this.currCharName].text);
        this.initStroke(this.currCharName);
    }

    replaceVars(){
        delete this.base[this.currCharName].text;
        console.log(this.base[this.currCharName]);
        this.base[this.currCharName] = replaceVariables(this.base[this.currCharName]);
        this.base[this.currCharName].text = fromJSONObject(this.base[this.currCharName]);
        this.input.update(this.base[this.currCharName].text);
        this.initStroke(this.currCharName);
    }

    create(){
        var charName = document.getElementById("new-char-name").value;
        if(this.base[charName] !== undefined)
            document.getElementById("indicator").innerText = "『" + charName + "』字已然存在了";
        else{
            this.base[charName] = {type:"radical", body:[], vars:{}, prog:[]};
            this.currCharName = charName;
            this.currSpec = this.base[charName];
            this.updateUI(this.base);
        }
    }

    getStrokeSpec(strokeName){

        var type = this.base[strokeName].type,
            names = {"radical": "部首", "compound": "笔画", "simple": "简单笔画"};

        document.getElementById("indicator").innerText = "载入" + names[type] + "『" + strokeName + "』";
        this.currSpec = getStrokeSpec(strokeName, this.base);
    }

    getStrokeSpecText(strokeName){

        var text = "";
        if (this.base[strokeName].text === undefined){
            text = fromJSONObject(this.base[strokeName]);
        } else {
            text = this.base[strokeName].text;
        }
        
        return text;
    }
    
    initVariableControls(){
        let varsDom = document.getElementById("var-bars");
        while (varsDom.firstChild) {
            varsDom.removeChild(varsDom.firstChild);
        }
        
        let width = document.createElement('div');
        width.appendChild(addLabel("笔画宽度"));
        this.strokeWidth = 8;
        width.appendChild(addSlider(name, {val:4, range:{min:1, max:15}}, function(e){
            this.strokeWidth = parseFloat(e.target.value);
            this.updateStroke();
        }.bind(this)));
        varsDom.appendChild(width);
        // let widthDom = document.createElement(div)

        if (this.currSpec.vars){
            let vars = this.currSpec.vars;
            for (let i in vars){
                varsDom.appendChild(addInput(i, vars[i], function(e){
                    if(vars[i].val != undefined){
                        vars[i].val = parseFloat(e.target.value);
                        document.getElementById(e.target.name+"-indicator").innerText = vars[i].val;    
                    }
                    this.updateStroke();
                }.bind(this)));
            }
        }
    }

    initStroke(charName){
        // should be specified in the extended class.
    }

}
