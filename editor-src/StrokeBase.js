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
        var text = document.getElementById("stroke-list").value;
        var updatedSpec = JSON.parse(toJSONText(text));
        this.base[this.currCharName] = updatedSpec;
        this.getStroke(this.currCharName);
        this.base[this.currCharName].text = text;
    }

    save(){
        var stringified = JSON.stringify(this.base, null, 2);
        saveStrokeBase(stringified).then(function(e){
            console.log("persisted");
        }).catch(function(e){
            console.log("error", e);
        });
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
    
    getStroke(char){
        // console.clear();
        var strokeSpec = this.getStrokeSpec(char);
        var stroke = new StrokeSet(strokeSpec);
        console.log("strokeSpec", strokeSpec);
        stroke.draw(this.ctx);
        stroke.findCenterRect(this.ctx, 10);
        stroke.findCentroid(this.ctx, 15);
    }
}
