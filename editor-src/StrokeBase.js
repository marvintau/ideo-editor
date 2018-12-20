import "./ArrayExtension.js";
import Input from "./Input.js";
import {fromJSONObject, toJSONText} from "./ION.js";
import {getSpec} from "./Spec.js";
import {initButtons, addSlider, addLabel, addInput} from "./UIComponent.js";
import {loadStrokeBase, saveStrokeBase} from "./Ajax.js";

import Char from "./Char.js";
import {drawBound, drawRadical, drawFrame, drawBBox} from "./Draw.js";


/**
 * The overall class that initiates the UI, retrieves character
 * information from backend, and so on.
 */

export default class StrokeBase{

    constructor(){
        
        this.base  = {};
        this.input = new Input(this);
        this.currCharName = "";
        this.currSpec = {};
        this.preview = document.getElementById("preview").getContext('2d');
        this.thumb = document.getElementById("thumb").getContext('2d');

        document.getElementById('create').onclick = function(e){
            this.create();
        }.bind(this);

        this.drawingAdditional = false;

        document.getElementById('drawing-additional').onclick = function(e){
            this.drawingAdditional = !this.drawingAdditional;
            this.updateStroke();
        }.bind(this);

        initButtons();
    }

    initStroke(charName){        
        try{
            this.getStrokeSpec(charName);
            this.initVariableControls();
    
            this.char = new Char(this.currSpec);
            this.char.modify();
    
            let state = this.drawingAdditional;
            this.thumb.clearRect(0, 0, this.thumb.canvas.height, this.thumb.canvas.width);
            this.drawingAdditional = false;
            this.draw();
            this.thumb.drawImage(this.preview.canvas, 0, 0, this.thumb.canvas.height, this.thumb.canvas.width);
            this.drawingAdditional = state;
            this.draw();            
        }
        catch (e){
            document.getElementById("indicator").innerHTML="<span class=\"keyword\">"+e.message+"</span>";
            console.error(e);
        }
    }

    updateStroke(){
        this.char = new Char(this.currSpec);
        this.char.modify();

        let state = this.drawingAdditional;
        this.thumb.clearRect(0, 0, this.thumb.canvas.height, this.thumb.canvas.width);
        this.drawingAdditional = false;
        this.draw();
        this.thumb.drawImage(this.preview.canvas, 0, 0, this.thumb.canvas.height, this.thumb.canvas.width);
        this.drawingAdditional = state;
        this.draw();
   }

    updateBase(){
        loadStrokeBase()
        .then(function(data){
            this.base = JSON.parse(data);
            this.updateCharList(this.base);
        }.bind(this));
    }

    updateCharList(chars){
        var charUI = document.getElementById("char-list");
    
        while (charUI.firstChild) {
            charUI.removeChild(charUI.firstChild);
        }

        let comboDOM = document.createElement('div'),
            uniqDOM = document.createElement('div'),
            radicalDOM = document.createElement('div'),
            strokeDOM = document.createElement('div');

        comboDOM.setAttribute('id', "list-Combo");
        uniqDOM.setAttribute('id', "list-Uniq");
        uniqDOM.style.display = "none";
        radicalDOM.setAttribute('id', 'list-Radical');
        radicalDOM.style.display = "none";
        strokeDOM.setAttribute('id', 'list-Stroke');
        strokeDOM.style.display = "none";

        charUI.appendChild(comboDOM);
        charUI.appendChild(uniqDOM);
        charUI.appendChild(radicalDOM);
        charUI.appendChild(strokeDOM);

        for(let charName in chars){
            
            var p = document.createElement('div')
            p.appendChild(document.createTextNode(charName));
            p.classList.add('char-button'); 

            p.onclick = function(e){
                console.clear();
                this.currCharName = charName;
                this.initStroke(charName);
                this.input.update(this.getStrokeSpecText(charName));
            }.bind(this);

            let category;
            category = chars[charName].desc ? chars[charName].desc : chars[charName].type;
            category = category === "Curve" ? "Stroke" : category;
            category = category === "Char" ? "Uniq" : category;
            
            document.getElementById("list-"+category).appendChild(p);
        }
    }

    submit(){
        var text = document.getElementById("stroke-list").value;
        var updatedSpec = JSON.parse(toJSONText(text));
        this.base[this.currCharName] = updatedSpec;

        // this.base[this.currCharName].thumbnail = this.thumb.canvas.toDataURL();

        this.initStroke(this.currCharName);
        console.log(this.base[this.currCharName]);
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
            this.base[charName] = {type:"Radical", body:[], vars:{}, prog:[]};

            if(charName[0] == '~') this.base[charName].unnamed = "true";

            this.currCharName = charName;
            this.currSpec = this.base[charName];
            this.updateCharList(this.base);
        }
    }

    getStrokeSpec(strokeName){


        var globalVariables = {
            globalStrokeWidth : {val: 1, range: {min: 1, max:5}},
            globalCompoundSpacing : {val: 0.3, range: {min: 0.1, max:0.5}}
        }

        var type = this.base[strokeName].type,
            names = {"Char": "全字", "Radical": "部首", "Compound": "笔画", "Curve": "简单笔画"};

        document.getElementById("indicator").innerText = "载入" + names[type] + "『" + strokeName + "』";
        this.currSpec = getSpec(strokeName, this.base, globalVariables);
    }

    getStrokeSpecText(strokeName){

        let dupped = JSON.parse(JSON.stringify(this.base[strokeName]));

        if(dupped.thumbnail)
            delete dupped.thumbnail;
        return fromJSONObject(dupped);
    }
    
    initVariableControls(){
        let varsDom = document.getElementById("var-bars");
        while (varsDom.firstChild) {
            varsDom.removeChild(varsDom.firstChild);
        }
        
        if (this.currSpec.vars){
            for (let i in this.currSpec.vars){
                varsDom.appendChild(addInput(i, this.currSpec.vars[i], function(e){
                    if(this.currSpec.vars[i].val != undefined){
                        this.currSpec.vars[i].val = parseFloat(e.target.value);
                        document.getElementById(e.target.name+"-indicator").innerText = this.currSpec.vars[i].val;    
                    }
                    
                    this.input.update(fromJSONObject(this.base[this.currCharName]));
                    this.updateStroke();
                }.bind(this)));
            }
        }
    }


    draw(){
        
        let width = this.preview.canvas.width,
            height = this.preview.canvas.height;
        this.preview.clearRect(0, 0, width, height);

        if(this.drawingAdditional){
            drawFrame(this.preview, width, height);

            this.preview.font = "780px serif";
            this.preview.fillStyle = "rgb(0, 0, 0, 0.5)";
            this.preview.fillText(this.currCharName, 30, 660);
        }

        let center;
        if (this.char.massCenter){       
            center = this.char.massCenter.add(this.char.geomCenter).mult(0.5);        
        } else {
            center = this.char.box.center();
        }

        let scale = 45;
        this.preview.translate(width/2 - center.x * scale, height/2 - center.y * scale);
                
        let drawSpec = {
            scale: scale,
            strokeWidth: 25,
            currCharName: this.currCharName,
            drawingAdditional: this.drawingAdditional
        }

        this.char.draw(this.preview, drawSpec);

        this.preview.setTransform(1, 0, 0, 1, 0, 0);
    
    }

}
