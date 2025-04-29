function Obj(context,type, start, end){
    this.type = type
    this.start = start;
    this.end = end;
    this.pre = null;
    this.next = null;
    this.context = context;
}

Obj.prototype.joinPre = function(pre){
    this.pre = pre;
}

Obj.prototype.joineNext = function(next){
    this.next = next;
}

Obj.prototype.draw = function(ctx){

}

export default Obj