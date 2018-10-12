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