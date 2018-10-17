import {highlightION} from "./ION.js";

function escapeHtml(unsafe) {
	return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export default class Input{

    constructor(){
        this.input = document.getElementById('stroke-list');
        this.init();
    }

    init(){

        var self = this;
        for (let event in ['keyup', 'change']){
            window.addEventListener("keyup", function(e){
                self.highlight();
                if(e.key==="Enter" && e.ctrlKey){
                    func(self.input.value);
                    return;
                }            
            });
        }
    }

    highlight(){

        this.input.style.height = this.input.scrollHeight;

        var content = this.input.value;
        var codeHolder = document.getElementById("code-display");
        var escaped = content;
        
        codeHolder.innerHTML = (highlightION(escaped));

    }

    update(text){
        this.input.value = text;
        this.highlight();
    }
}