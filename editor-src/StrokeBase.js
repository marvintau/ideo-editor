import Input from "./Input.js";
import StrokeSet from "./StrokeSet.js";
import {fromJSONObject, toJSONText} from "./ION.js";

function dup(json){
    return JSON.parse(JSON.stringify(json));
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

export default class StrokeBase {

    constructor(ctx){
        this.base  = {};
        this.ctx   = ctx;
        this.input = new Input(this);
        this.currCharName = "";
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
    
        for(let char in chars) if (chars[char].type == "radical") {
            var p = document.createElement('button')
            p.appendChild(document.createTextNode(char));
            p.classList.add('char-button');

            p.onclick = function(e){
                this.getStroke(char);
                this.currCharName = char;
                this.input.update(this.getStrokeSpecText(char));
            }.bind(this);

            CharUI.appendChild(p);
        }
    }

    submit(){
        var updatedSpec = JSON.parse(toJSONText(document.getElementById("stroke-list").value));
        console.log(this.base[this.currCharName], updatedSpec);
        this.base[this.currCharName] = updatedSpec;
        // this.updateStroke(this.currCharName, updatedSpec);
        this.getStroke(this.currCharName);
    }

    getStrokeSpecText(strokeName){
        return fromJSONObject(this.base[strokeName]);
    }

    getStrokeSpec(strokeName){
    
        var self = this,
            stroke = dup(this.base[strokeName]);
    
        switch(stroke.type){
            case "radical":
                stroke.body = stroke.body.reduce(function(list, elem){
                    var strokeElem = self.getStrokeSpec(elem);
                    return (strokeElem.type == "radical") ? list.concat(strokeElem.body) : list.concat(strokeElem);
                }, []);
                return stroke;
            case "compound":
                stroke.body = stroke.body.reduce(function(list, elem){
                    var strokeElem = self.getStrokeSpec(elem);
    
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
    
    updateStroke(char, spec){
        console.log("update", spec);
        var stroke = new StrokeSet(spec);
        stroke.draw(this.ctx);
        stroke.findCenterRect(this.ctx, 10);
        stroke.findCentroid(this.ctx, 15);
    }
    
    getStroke(char){
        console.clear();
        var strokeSpec = this.getStrokeSpec(char);
        var stroke = new StrokeSet(strokeSpec);
        stroke.draw(this.ctx);
        stroke.findCenterRect(this.ctx, 10);
        stroke.findCentroid(this.ctx, 15);
    }
}
