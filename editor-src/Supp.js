export function forSucc(list, func){
    for(let i = 0; i < list.length - 1; i++) func(i, list[i], list[i+1]);
}