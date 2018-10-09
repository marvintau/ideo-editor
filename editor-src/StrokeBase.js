function dup(json){
    return JSON.parse(JSON.stringify(json));
}

export function loadStrokeBase () {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', "data/stroke-spec.json", true);

        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}

export function getStroke(strokeBase, strokeName){
    
    var stroke = dup(strokeBase[strokeName]);
    
    switch(stroke.type){
        case "radical":
            stroke.body = stroke.body.reduce(function(list, elem){
                var strokeElem = getStroke(strokeBase, elem);
                return (strokeElem.type == "radical") ? list.concat(strokeElem.body) : list.concat(strokeElem);
            }, []);
            return stroke;
        case "compound":
            stroke.body = stroke.body.reduce(function(list, elem){
                var strokeElem = getStroke(strokeBase, elem);

                // a note about recursive call:
                // by this point, all elements in strokeElem body has been found.
                // the lower level of flattening has been done in previous calls.
                return (strokeElem.type == "compound") ? list.concat(strokeElem.body) : list.concat(strokeElem);
            }, []);
            return stroke;
        case "simple":
            return {type:"compound", body:[stroke]};
    }
}

