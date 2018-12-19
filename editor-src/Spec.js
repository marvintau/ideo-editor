function dup(json){
    return JSON.parse(JSON.stringify(json));
}

/**
 * 将comp的子一层variable绑定在自己的variable列表中。如果当
 * 前组件没有vars的话就创建一个。如果已经有同名变量，则当前变
 * 量会覆盖子一层的变量。
 * @param {object} comp 
 */
function bindVars(comp){
    if (!comp.vars) comp.vars = {};
    
    if(comp.body)
        for (let elem of comp.body) if(elem && elem.vars)
            for (let key in elem.vars) {
                if(elem.vars[key].exposeLevel != undefined && elem.vars[key].exposeLevel-1 != 0){
                    comp.vars[key] = elem.vars[key];
                    comp.vars[key].exposeLevel -= 1;
                    // the expose level in elem level will be decreased as well but it's fine. 
                }

                if(elem.vars[key].global)
                    comp.vars[key] = elem.vars[key];
                    
                if(elem.vars[key].overridable && comp.vars[key])
                    elem.vars[key] = comp.vars[key];
            }

    return comp;
}    

/**
 * 
 * 递归地获得完整的部件描述。
 * 由于在部件索引中对其它部件是通过名称引用，因此要不断将引用的
 * 部件名称替换为实际的描述，这是一个递归调用的过程，因此应当注
 * 意，如果一个描述中引用了自身的名称或其它循环引用的情况，就会
 * 造成无限递归错误。
 *
 * @param {string} compName 部件的名称
 * @param {object} base 部件索引
 */
function getSpecRecursive(compName, base, globalVars){

    if (globalVars === undefined) globalVars = {};

    for (let key in globalVars) globalVars[key].global = 1;

    if(base[compName]){
        let comp = dup(base[compName]);
        delete comp.text;

        switch(comp.type){

            case "Char":
            case "Radical":
                comp.body = comp.body.reduce(function(list, elem){
                    return list.concat(getSpecRecursive(elem, base, globalVars));
                }, []);

                comp = bindVars(comp);
                break;

            // 一个复杂笔画引用的可能是另一个复杂笔画，也可能是若干个简单笔画，
            // 但是因为在上面简单笔画也返回复杂笔画，因而最终返回的都是复杂笔
            // 画。因此最终得到的是将各复杂笔画合成后的新的复杂笔画。而复杂笔
            // 画内的引用关系也因为这部操作而丢失了。
            case "Stroke":
                comp.body = comp.body.reduce(function(list, elem){
                    return list.concat(getSpecRecursive(elem, base, globalVars).body);
                }, []);

                comp = bindVars(comp);
                break;

            // 一个简单笔画返回的是一个仅包含它的复杂笔画，也是递归的终点
            // 之所以要处理这部分，是因为某些笔画是Curve结构。
            case "Curve":
                if(!comp.vars)
                    comp.vars = globalVars;
                else for (let key in globalVars)
                    comp.vars[key] = globalVars[key];

                comp = {type:"Stroke", body:[comp], vars:comp.vars};
                console.log(comp);
                break;
        }

        return comp;

    } else {
        throw {name: "NotFound", message:"字典里面没找到 [" + compName + "]"};
    }
}

/**
 * 
 * 获取部件详细描述的方法，同时也是部件的递归入口。
 * 我们需要能够显示Stroke，Radical和Char，而Stroke和Radical最终都需要转换成
 * Char。Stroke会先转换成Radical，无论spec本身就是Radical还是由Stroke转换成
 * 了Radical，都会套一层spec变成Char，而如果spec本身就是Char则直接调用递归的
 * getSpecRecursive。
 * 
 * @param {string} strokeName 部件名称
 * @param {object} base 部件索引
 */
export function getSpec(strokeName, base, globalVars){
    
    var res = getSpecRecursive(strokeName, base, globalVars);
    
    if (res.type == "Stroke")
        res = {type:"Radical", vars:res.vars, body:[res]};
    
    if (res.type == "Radical")
        res = {type: "Char", vars: res.vars, body:[res]};
    
    console.log(res.vars, "getSpec");
    return res;
}