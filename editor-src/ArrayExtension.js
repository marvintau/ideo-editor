Array.prototype.part = function(len, off){
    if (len == undefined) len = 2;
    if (off == undefined) off = len;
    
    let s = [];
    for (let i = 0; i < this.length-1;){
        s.push(this.slice(i, i+len));
        i += off;
    }
    return s;
}

Array.prototype.flatten = function(crit, retr){

    if (retr !== undefined && crit !== undefined){
        const stack = [...this];
        const res = [];
    
        while (stack.length) {
            const next = stack.pop();
            if (crit(next))
                stack.push(...retr(next));
            else
                res.push(next);
        }
        return res.reverse();    
    } else {
        return [].concat(...this);
    }

}

Array.prototype.sum = function(){
    return this.reduce((s, e) => s+e, 0);
}

Array.prototype.last = function(){
    return this[this.length - 1];
}

export default 0;