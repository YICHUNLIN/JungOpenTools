import Obj from './obj'
function Line(context, args){
    Obj.call(this, context, "line", args.start, args.end);
}
Line.prototype = Object.create(Obj.prototype)

// 取得某長度的座標
Line.prototype.pointOfLength = function(length){ 
    const ltotal = this.length();
    const n = ltotal - length;
    const px = (n * this.start.x + length * this.end.x) / ltotal;
    const py = (n * this.start.y + length * this.end.y) / ltotal;
    return {x: px, y: py}
}

Line.prototype.slope = function(){
    return (this.end.x - this.start.x) / (this.end.y - this.start.y);
}

Line.prototype.length = function(){
    return Math.sqrt((this.start.x - this.end.x)**2 + (this.start.y - this.end.y)**2);
}

Line.prototype.draw = function(ctx){

}
export default Line