function range(length, func){
    return [...Array(length).keys()].map((e, i) =>func(e, i));
}

function loadJSON (json_filename) {

    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', json_filename, true);

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

// loadJSON('data/stroke-spec.json').then(function(data){
//     char_set_json = JSON.parse(data);
//     // redrawRadical();
// })

export {
    range,
    loadJSON
};