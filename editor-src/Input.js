
function getCursorPos(input) {
    return {
        start: input.selectionStart,
        end: input.selectionEnd
    };
}

function setCursorPos(input, pos) {
    setTimeout(function() {
        input.selectionStart = pos;
        input.selectionEnd = pos;
    }, 1);
}

function insertPair(input, bracket, pos){
    var cursorPos = getCursorPos(input),
        input_str = input.value;

    input.value = input_str.slice(0, cursorPos.start) + bracket + input_str.slice(cursorPos.start);
    setCursorPos(input, cursorPos.start+pos);
}

function insertPairFromDict(strokeInput, event){
    var complete_dict = {
        "[" : ["[]", 1],
        "'" : ['""', 1],
        '"' : ['""', 1],
        "{" : ['{}', 1],
        "Enter":['\n\n', 1]
    };

    if(event.key in complete_dict){
        event.preventDefault();
        insertPair(strokeInput, complete_dict[event.key][0], complete_dict[event.key][1]);
    }
}

export default function initInput(strokeInput){
    strokeInput.addEventListener('keypress', function(e){
    
        if(e.key==="Enter" && e.ctrlKey){
            redrawRadical();
            return;
        }
    
        insertPairFromDict(strokeInput, e);
    });
    
    strokeInput.focus();    
}
