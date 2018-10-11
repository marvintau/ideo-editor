import StrokeSet from "./StrokeSet.js";

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
        this.strokeSet = {};
        this.ctx = ctx;
    }

    updateBase(){
        loadStrokeBase()
        .then(function(data){
            this.strokeSet = JSON.parse(data);
            this.updateUI(this.strokeSet);
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
                // this.getStroke(char);
            }.bind(this);

            CharUI.appendChild(p);
        }
    }

    getStrokeSpec(strokeName){
    
        var self = this;
        var stroke = dup(this.strokeSet[strokeName]);
        
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
        var strokeSpec = this.getStrokeSpec(char);
        var stroke = new StrokeSet(strokeSpec);
        stroke.draw(this.ctx);
    }
}
