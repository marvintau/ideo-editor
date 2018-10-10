export function range(length, func){
    return [...Array(length).keys()].map((e) =>func(e));
}

export function dup(json){
    return JSON.parse(JSON.stringify(json));
}

export function flatten(arr){
    return arr.reduce(
        (flat, next) => flat.concat(Array.isArray(next) ? flatten(next) : next),
    []);
}

export function findMinMax(data, func){
    var min =  10000,
        max = -10000,
        minIndex = 0,
        maxIndex = 0;

    var p = data.map(func);
    for (let i in p)
        if(p[i] > max) {
            max = p[i]; maxIndex = i;
        } else if (p[i] < min) {
            min = p[i]; minIndex = i;
        }

    return {
        max : parseInt(maxIndex),
        min : parseInt(minIndex)
    };
}