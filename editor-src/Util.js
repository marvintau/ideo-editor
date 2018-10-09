function range(length, func){
    return [...Array(length).keys()].map((e) =>func(e));
}

function dup(json){
    return JSON.parse(JSON.stringify(json));
}

export {
    range,
    dup
};