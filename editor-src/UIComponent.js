export function addSlider(name, variable, func){
    var x = document.createElement("INPUT");
    x.setAttribute("type", "range");
    x.classList.add("slider");

    x.setAttribute("name", name);
    x.setAttribute("min", variable.range.min);
    x.setAttribute("max", variable.range.max);
    x.setAttribute("value", variable.val);
    x.setAttribute("step", 0.001);
    x.addEventListener('input', func);
    x.addEventListener('change', func);

    return x;
}

function addNumberIndicator(name, val){
    var x = document.createElement("SPAN");
    x.setAttribute("id", name+"-indicator");
    x.classList.add("indicator");
    x.innerText = val.toFixed(3);
    return x;
}

export function addLabel(name){
    var x = document.createElement('label');
    x.innerHTML = name;
    x.setAttribute('for', name);
    return x;
}

export function addInput(name, variable, func){
    var x = document.createElement("div");
    x.appendChild(addLabel(name));
    if(variable.range != undefined){
        x.appendChild(addSlider(name, variable, func));
        x.appendChild(addNumberIndicator(name, variable.val));
    } else if (variable.val != undefined){
        x.appendChild(addNumberIndicator(name, variable.val));
    }
    return x;
}


function hideAllTabs(){
    for (let child of document.getElementById('char-list').children){
        child.style.display = "none";
    }
}

export function initButtons(){
    document.getElementById('toggle-stroke').onclick = function(e){
        hideAllTabs();
        document.getElementById('list-Stroke').style.display = "block";
    }

    document.getElementById('toggle-radical').onclick = function(e){
        hideAllTabs();
        document.getElementById('list-Radical').style.display = "block";
    }

    document.getElementById('toggle-uniq').onclick = function(e){
        hideAllTabs();
        document.getElementById('list-Uniq').style.display = "block";
    }

    document.getElementById('toggle-combo').onclick = function(e){
        hideAllTabs();
        document.getElementById('list-Combo').style.display = "block";
    }


    document.getElementById('var-bars').style.display = "none";
    document.getElementById('toggle-code-param').onclick = function(e){
        let codelist = document.getElementById('code-list'),
            varslist = document.getElementById('var-bars');

        codelist.style.display = codelist.style.display == "none" ? "flex" : "none";
        varslist.style.display = varslist.style.display == "none" ? "block" : "none";
    }

}
