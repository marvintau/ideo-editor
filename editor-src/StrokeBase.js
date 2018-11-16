
import Input from "./Input.js";
import {fromJSONObject, toJSONText} from "./ION.js";
import {getSpec} from "./Spec.js";
import {addSlider, addLabel, addInput} from "./UIComponent.js";
import {loadStrokeBase, saveStrokeBase} from "./Ajax.js";

import Radical from "./Radical.js";
import { getBounds } from "./Interior.js";
import {drawBound, drawRadical} from "./Draw.js";

export default class StrokeBase{

    constructor(){
        
        this.base  = {};
        this.input = new Input(this);
        this.currCharName = "";
        this.currSpec = {};
        this.preview = document.getElementById("preview").getContext('2d');

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

    initStroke(charName){        
        this.getStrokeSpec(charName);
        this.initVariableControls();

        this.radical = new Radical(this.currSpec);
        this.updateWithPoint();        
    }

    updateStroke(){
        this.radical = new Radical(this.currSpec);
        this.updateWithPoint();
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

    suggest(){
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

    getStrokeSpec(strokeName){

        var type = this.base[strokeName].type,
            names = {"radical": "部首", "compound": "笔画", "simple": "简单笔画"};

        document.getElementById("indicator").innerText = "载入" + names[type] + "『" + strokeName + "』";
        this.currSpec = getSpec(strokeName, this.base);
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


    updateWithPoint(){
        let points = this.radical.points,
            bounds = getBounds(points),
            center = bounds.median.centroid.isNaN() ? bounds.outlier.centroid : bounds.median.centroid;

        console.log(center, bounds);

        this.preview.clearRect(-128, -128, 384, 384);

        for (let i = 0; i < points.length; i++)
            for (let p = 0; p < points[i].length; p++)
                points[i][p].isub(center);

        this.preview.beginPath();
        this.preview.rect(16, 16, 224, 224);
        this.preview.stroke();

        drawRadical(this.preview, this.strokeWidth, points);


        this.preview.translate(-center.x, -center.y);
        drawBound(this.preview, bounds, "median");
        drawBound(this.preview, bounds, "outlier");

        this.preview.setTransform(1, 0, 0, 1, 0, 0);
    }

}
