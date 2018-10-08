
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


export default function initInput(strokeInput){
    strokeInput.addEventListener('keypress', function(e){
        var complete_dict = {
            "[" : ["[]", 1],
            "'" : ['""', 1],
            '"' : ['""', 1],
            "{" : ['{}', 1],
            "Enter":['\n\n', 1]
        };
    
        if(e.key==="Enter" && e.ctrlKey){
            redrawRadical();
            return;
        }
    
        // console.log(e.key in complete_dict);
        if(e.key in complete_dict){
            e.preventDefault();
            insertPair(strokeInput, complete_dict[e.key][0], complete_dict[e.key][1]);
        }
    });
    
    strokeInput.focus();    
}
