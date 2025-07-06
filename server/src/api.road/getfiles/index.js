const fs = require('fs');
const targetFolder = `${process.cwd()}/storage/datatoshow`;


module.exports = function(context){
    return [ 
      (req, res) => {
        res.status(200).json({code: 200, data: fs.readdirSync(targetFolder)})
      }
    ]
};