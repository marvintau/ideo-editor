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

        document.getElementById('create').onclick = function(e){
            this.create();
        }.bind(this);

        initButtons();
    }

    initStroke(charName){        
        this.getStrokeSpec(charName);
        this.initVariableControls();

        this.char = new Char(this.currSpec);
        this.char.modify();
        this.updateWithPoint();        
    }

    updateStroke(){
        this.char = new Char(this.currSpec);
        this.char.modify();
        this.updateWithPoint();
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
            this.base[charName] = {type:"Radical", body:[], vars:{}, prog:[]};

            if(charName[0] == '~') this.base[charName].unnamed = "true";

            this.currCharName = charName;
            this.currSpec = this.base[charName];
            this.updateCharList(this.base);
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
            names = {"Char": "全字", "Radical": "部首", "Compound": "笔画", "Curve": "简单笔画"};

        document.getElementById("indicator").innerText = "载入" + names[type] + "『" + strokeName + "』";
        this.currSpec = getSpec(strokeName, this.base);
        console.log("currSpec", this.currSpec);
    }

    getStrokeSpecText(strokeName){

        if(this.base[strokeName].text)
            delete this.base[strokeName].text;
        return fromJSONObject(this.base[strokeName]);
    }
    
    initVariableControls(){
        let varsDom = document.getElementById("var-bars");
        while (varsDom.firstChild) {
            varsDom.removeChild(varsDom.firstChild);
        }
        
        let width = document.createElement('div');
        width.appendChild(addLabel("笔画宽度"));
        this.strokeWidth = 25;
        width.appendChild(addSlider(name, {val:25, range:{min:10, max:50}}, function(e){
            console.clear();
            this.strokeWidth = parseFloat(e.target.value);
            this.updateStroke();
        }.bind(this)));
        varsDom.appendChild(width);
        // let widthDom = document.createElement(div)

        if (this.currSpec.vars){
            for (let i in this.currSpec.vars){
                varsDom.appendChild(addInput(i, this.currSpec.vars[i], function(e){
                    if(this.currSpec.vars[i].val != undefined){
                        this.currSpec.vars[i].val = parseFloat(e.target.value);
                        document.getElementById(e.target.name+"-indicator").innerText = this.currSpec.vars[i].val;    
                    }
                    this.base[this.currCharName].vars = this.currSpec.vars;
                    this.input.update(fromJSONObject(this.base[this.currCharName]));
                    this.updateStroke();
                }.bind(this)));
            }
        }
    }


    updateWithPoint(){
        
        let width = this.preview.canvas.width,
            height = this.preview.canvas.height;
        this.preview.clearRect(0, 0, width, height);
        drawFrame(this.preview, width, height);

        let center;
        if (this.char.massCenter){       
            center = this.char.massCenter.add(this.char.geomCenter).mult(0.5);        
        } else {
            center = this.char.box.center();
        }

        console.log(this.char.body);

        let scale = 45;
        

        this.preview.translate(width/2 - center.x * scale, height/2 - center.y * scale);
                
        this.char.draw(this.preview, this.strokeWidth, scale, this.currCharName);


        this.preview.setTransform(1, 0, 0, 1, 0, 0);
    
    }

}
