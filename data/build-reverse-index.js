fs = require('fs');

function findUnicodeChar(string) {
    var re= /.[\u0300-\u036F]*/g;
    var match, matches= [];
    while (match= re.exec(string))
        matches.push(match[0]);
    return matches;
}

function record_handling(record){

    var record_charlist = Array.from(record), 
        record_grouped = [],
        reverse_dict = {};

    var NEXT_CHAR_IS_IN_COMPOUND = false;
    for(let next_char of record_charlist){
        if (next_char == '<'){
            NEXT_CHAR_IS_IN_COMPOUND = true;
            record_grouped.push("");
            continue;
        }
        if (next_char == ">"){
            NEXT_CHAR_IS_IN_COMPOUND = false;
            record_grouped[record_grouped.length-1] = '@' + record_grouped[record_grouped.length-1]; // distinguish the compound word
            continue;
        }

        if(NEXT_CHAR_IS_IN_COMPOUND){
            record_grouped[record_grouped.length-1] += next_char;
        } else {
            record_grouped.push(next_char);
        }
    }

    var char_stack = [],
        just_composed;

    var composing_types = {
        '⿰': ['left', 'right'],
        '⿱': ['top', 'bottom'],
        '⿲': ['left', 'middle', 'right'], 
        '⿳': ['top', 'middle', 'bottom'],
        '⿴': ['outer', 'inner'],
        '⿵': ['outer', 'bottom'],
        '⿶': ['outer', 'top'],
        '⿷': ['outer', 'right'],
        '⿸': ['outer', 'rightbottom'],
        '⿹': ['outer', 'leftbottom'],
        '⿺': ['outer', 'righttop'],
        '⿻': ['embed1', 'embed2']
    };

    while(record_grouped.length > 0){
        var next_char = record_grouped.pop();
        
        if(composing_types[next_char] === undefined){

            if(next_char[0] != "@" || (next_char[0]=='@' && just_composed === undefined))
                // for ordinary chars, just insert it.
                // if a wild compound description occurs in the description sequence, which not followed by
                // a structure descriptor, sim

                 char_stack.push(next_char);

            else {
                // for chars followed by @, we just pushed a compound description sequence onto stack, pop
                // it out and replace with the current char. Also replace the key in the reverse dictionary
                
                char_stack.pop();
                char_stack.push(next_char);

                reverse_dict[next_char] = reverse_dict[just_composed];

                delete reverse_dict[just_composed];
                just_composed = undefined;
            }

        } else {

            // when handling the composing descriptor,
            // 1. pop from char_stack according to the number of radicals in the description subsequence,
            // 2. push back the description string back to stack, because it's still a radical.
            // 3. save it to dictionary.

            let intermediate_res = [];
            for(let i = 0; i < composing_types[next_char].length; i++) intermediate_res.push(char_stack.pop());
            
            just_composed = next_char + intermediate_res.join("");
            char_stack.push(just_composed);

            for (let i in intermediate_res){
                reverse_dict[intermediate_res[i]] = {};
                reverse_dict[intermediate_res[i]][just_composed] = composing_types[next_char][i];
            }
        }
    }

    return reverse_dict;

}

var res = fs.readFileSync('dict.txt', 'utf-8').split("\n"),
    grand_reverse_index = {};

console.log("generating reverse index");
for (let record of res){
    var record_dict = record_handling(record);

    for(let char_key in record_dict){
        if (grand_reverse_index[char_key] == undefined){
            grand_reverse_index[char_key] = {};
        }
        Object.assign(grand_reverse_index[char_key], record_dict[char_key]);
    }
}

for (let key in grand_reverse_index){
    if( Object.keys(grand_reverse_index[key]).length === 0 ){
        delete grand_reverse_index[key];
    }
}
console.log("done cleaning");

for (let key in grand_reverse_index){
    for( let second_key in grand_reverse_index[key]){
        grand_reverse_index[key][second_key] = {
            "pos":grand_reverse_index[key][second_key],
            "isFinal":!(second_key in grand_reverse_index)
        };
    }
}

fs.writeFileSync("reverse_index.json", JSON.stringify(grand_reverse_index, null, 2));
