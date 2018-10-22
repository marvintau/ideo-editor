import {highlightION, toJSONText} from "./ION.js";


export default class Input{

    constructor(strokeBase){
        this.input = document.getElementById('stroke-list');
        this.strokeBase = strokeBase;
        this.init();
    }

    init(){

        var self = this;

        window.addEventListener("keyup", function(e){
            if(e.key==="Enter" && e.ctrlKey && e.shiftKey){
                self.strokeBase.submit(self.input.value);
                self.strokeBase.save();
            } else if(e.key==="Enter" && e.ctrlKey){
                self.strokeBase.submit(self.input.value);
            } else {
                self.highlight();
            }          
        });

    }

    highlight(){

        this.input.style.height = this.input.scrollHeight;

        var content = this.input.value;
        var codeHolder = document.getElementById("code-display");
        
        codeHolder.innerHTML = (highlightION(content));
    }

    update(text){
        this.input.value = text;
        this.highlight();
    }
}