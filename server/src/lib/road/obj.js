function Obj(type, start, end){
    this.type = type
    this.start = start;
    this.end = end;
    this.pre = null;
    this.next = null;
}

Obj.prototype.joinPre = function(pre){
    this.pre = pre;
}

Obj.prototype.joineNext = function(next){
    this.next = next;
}

module.exports = Obj