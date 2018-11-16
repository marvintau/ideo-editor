function dup(json){
    return JSON.parse(JSON.stringify(json));
}

/**
 * 
 * 递归地获得完整的部件描述。
 * 由于在部件索引中对其它部件是通过名称引用，因此要不断将引用的
 * 部件名称替换为实际的描述，这是一个递归调用的过程，因此应当注
 * 意，如果一个描述中引用了自身的名称，就会造成无限递归错误。
 *
 * @param {string} strokeNextElem 部件的名称
 * @param {object} base 部件索引
 */
function getSpecRecursive(strokeNextElem, base){
    let stroke = dup(base[strokeNextElem]);
    delete stroke.text;

    switch(stroke.type){

        // 考虑进行扩展，就是一个radical和一个stroke构成一个新的radical
        case "radical":
            stroke.body = stroke.body.reduce(function(list, elem){
                return list.concat(getSpecRecursive(elem, base));
            }, []);
            return stroke;

        // 一个简单笔画返回的是一个仅包含它的复杂笔画，也是递归的终点
        case "simple":
            return {type:"compound", body:[stroke]};

        // 一个复杂笔画引用的可能是另一个复杂笔画，也可能是若干个简单笔画，
        // 但是因为在上面简单笔画也返回复杂笔画，因而最终返回的都是复杂笔
        // 画。因此最终得到的是将各复杂笔画合成后的新的复杂笔画。而复杂笔
        // 画内的引用关系也因为这部操作而丢失了。
        case "compound":
            stroke.body = stroke.body.reduce(function(list, elem){
                return list.concat(getSpecRecursive(elem, base).body);
            }, []);
            return stroke;
    }
}

/**
 * 
 * 获取部件详细描述的方法，同时也是部件的递归入口。
 * 如果获取的不是一个radical，那么就造出一个radical出来。
 * 
 * @param {string} strokeName 部件名称
 * @param {object} base 部件索引
 */
export function getSpec(strokeName, base){
    
    if (base[strokeName].type == "radical")
        return getSpecRecursive(strokeName, base);
    else
        return {
            type:"radical",
            vars:{},
            body:[getSpecRecursive(strokeName, base)]
        };
}

export function suggestSpec(specOrig, specDeri){
    console.log(specOrig, specDeri, "suggestSpec");
    var newSpec = {body: specOrig.body, type: specOrig.type, prog:[]};

    for (let i = 0; i < specDeri.body.length; i++){
        let stroke = specDeri.body[i];
        console.log(stroke, "suggestedSpec stroke");
        if(stroke.body.length == 1)
            newSpec.prog.push({ith:i, scale: 1, rotate:0, curl: 0});
        else
            newSpec.prog.push({
                ith: i,
                prog: stroke.body.map((e, j) => ({ith:j, scale: 1, rotate: 0, curl: 0}))
            });
    }

    if(specDeri.body.length > 1) for (let i = 1; i < specDeri.body.length; i++){
        newSpec.prog.push({cross:{
            dest:{ith: i-1, curve: 0, r: 0},
            self:{ith: i, curve: 0, r: 0}
        }})
    }

    console.log(newSpec, "suggestedSpec");
    return newSpec;
}

function replaceSingleVariable(key, val){
    switch(key){
        case "rotate":
            return {val: val, range:{min: val-20, max: val+20}};
        case "curl":
            return {val: val, range:{min: val-10, max: val+10}};
        case "scale":
            return {val: val, range:{min: val*0.8, max:val/0.8}};
        case "r":
            return {val: val, range:{min: val-0.1, max:val+0.1}};
    }
}

function replaceVariableGeneralInstr(spec, ithProg, key, varName){
    let nonVars1 = ((key == "rotate" || key == "curl") && spec.prog[ithProg][key] == 0),
        nonVars2 = (key == "scale" && spec.prog[ithProg][key] == 1),
        nonVars = nonVars1 || nonVars2;
    console.log(key, spec.prog[ithProg][key], key in ["rotate", "curl"]);
    if(!nonVars){
        spec.vars[varName] = replaceSingleVariable(key, spec.prog[is][key]);
        spec.prog[ithProg][key] = varName;
    }
}

function replaceVariableCross(spec, ithProg){
    let cross = spec.prog[ithProg].cross,
        varSelfName = "cross-"+ cross.self.ith + "-" + cross.dest.ith + "-" + "self",
        varDestName = "cross-"+ cross.self.ith + "-" + cross.dest.ith + "-" + "dest";

    if(cross.self.r != 1 && cross.self.r != 0){
        spec.vars[varSelfName] = replaceSingleVariable("r", cross.self.r);
        spec.prog[ithProg].cross.self.r = varSelfName;
    }

    if(cross.dest.r != 1 && cross.dest.r != 0){
        spec.vars[varDestName] = replaceSingleVariable("r", cross.dest.r);
        spec.prog[ithProg].cross.dest.r = varDestName;
    }
}

function replaceVariables(spec){
    spec.vars = {};

    let ithStroke = 0,
        ithCurve = 0;
    for (let is = 0; is < spec.prog.length; is++)
        for (let key in spec.prog[is]){
            if (key == "ith")
                ithStroke = spec.prog[is].ith;
            else if (key == "prog")
                for (let ic = 0; ic < spec.prog[is].prog.length; ic++)
                    for (let keyc in spec.prog[is].prog[ic])
                        if (keyc == "ith")
                            ithCurve = spec.prog[is].prog[ic].ith;
                        else{
                            let varName = keyc+"-"+ithStroke+"-"+ithCurve;
                            replaceVariableGeneralInstr(spec.prog[is], ic, keyc, varName);
                        }
            else if (key == "cross")
                replaceVariableCross(spec, is);
            else {
                let varName =  key+"-"+ithStroke;
                replaceVariableGeneralInstr(spec, is, key, varName);
            }
                
        }
    
    return spec;
}
