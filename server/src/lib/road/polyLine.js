const Obj = require('./obj')
function PolyLine(args){
    Obj.call(this, "polyline", args.contents[0].start, args.contents[args.contents.length - 1].end);
    this.contents = [];
    args.contents.forEach((e, i) => {
        if (i !== 0) {
            e.pre = args.contents[i-1];
        }
        if (i < (args.contents.length - 1)){
            e.next = args.contents[i+1]
        }
        this.contents.push(e);
    });
    console.log(this.contents)
}
PolyLine.prototype = Object.create(Obj.prototype)

module.exports = PolyLine