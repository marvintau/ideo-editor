import Input from "./Input.js";
import {fromJSONObject, toJSONText} from "./ION.js";

function dup(json){
    return JSON.parse(JSON.stringify(json));
}

function getStrokeSpec(strokeName, base){
    let stroke = dup(base[strokeName]);

    switch(stroke.type){
        case "radical":
            stroke.body = stroke.body.reduce(function(list, elem){
                let strokeElem = getStrokeSpec(elem, base);
                return (strokeElem.type == "radical") ? list.concat(strokeElem.body) : list.concat(strokeElem);
            }, []);
            return stroke;
        case "compound":
            stroke.body = stroke.body.reduce(function(list, elem){
                let strokeElem = getStrokeSpec(elem, base);

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

function addSlider(name, variable, func){
    var x = document.createElement("INPUT");
    x.setAttribute("type", "range");
    x.classList.add("slider");

    x.setAttribute("name", name);
    x.setAttribute("min", variable.range.min);
    x.setAttribute("max", variable.range.max);
    x.setAttribute("value", variable.val);
    x.setAttribute("step", 0.01);
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
    x.appendChild(addSlider(name, variable, func));
    x.appendChild(addNumberIndicator(name, variable.val));
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
    }

    updateBase(){
        loadStrokeBase()
        .then(function(data){
            this.base = JSON.parse(data);
            this.updateUI(this.base);
        }.bind(this));
    }

    updateUI(chars){
        var CharUI = document.getElementById("char-list");
    
        for(let charName in chars) if (chars[charName].type == "radical") {
            
            var p = document.createElement('button')
            p.appendChild(document.createTextNode(charName));
            p.classList.add('char-button'); 

            p.onclick = function(e){
                this.currCharName = charName;
                this.initStroke(charName);
                this.input.update(this.getStrokeSpecText(charName));
            }.bind(this);

            CharUI.appendChild(p);
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
        var stringified = JSON.stringify(this.base, null, 2);
        saveStrokeBase(stringified).then(function(e){
            console.log("persisted");
        }).catch(function(e){
            console.log("error", e);
        });
    }

    getStrokeSpec(strokeName){
        document.getElementById("indicator").innerText = "loaded stroke " + strokeName;
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
        let vars = this.currSpec.vars;

        for (let i in vars){
            varsDom.appendChild(addInput(i, vars[i], function(e){
                vars[i].val = parseFloat(e.target.value);
                document.getElementById(e.target.name+"-indicator").innerText = vars[i].val;
                this.updateStroke();
            }.bind(this)));
        }
    }

    initStroke(charName){
        // should be specified in the extended class.
    }

}
