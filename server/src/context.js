const fs = require('fs');
const db = require('./model')
function Context(){
    this.init();
}

Context.prototype.init = function(){
    this.storageRoot = process.cwd() + '/data';
    if (!fs.existsSync(this.storageRoot))
        fs.mkdirSync(this.storageRoot)
    this.db = db(this);
    // const {Analysis} = this.db;
    // Analysis.getByEmployeeAndFuzzyDate("2024-09", "Widi")
    //     .then(console.log)
    //     .catch(console.log)
}

module.exports = Context;