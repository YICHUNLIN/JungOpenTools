function Node(type, proc, name){
    this.type = type;
    this.proc = proc;
    this.name = name;
    this.inputs = [];
    this.outputs = [];
}

Node.prototype.addInput = function(node){
    this.inputs.push(node);
}

Node.prototype.addOutput = function(node){
    this.outputs.push(node)
}

module.exports = Node;