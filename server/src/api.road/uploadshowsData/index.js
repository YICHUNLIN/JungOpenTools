const fs = require('fs');
const root = `${process.cwd()}/storage`;
if(!fs.existsSync(root)) fs.mkdirSync(root);
const targetFolder = `${root}/datatoshow`;
if(!fs.existsSync(targetFolder)) fs.mkdirSync(targetFolder);


module.exports = function(context){
    return [ 
      (req, res, next) => {
        if (req.body.hasOwnProperty('name') 
          && req.body.hasOwnProperty('data') 
        && Array.isArray(req.body.data)) return next();
        return res.status(400).json({code: 400, message: 'name and data must be required, and data must be an array'})
      },
      (req, res) => {
        
        fs.writeFileSync(`${targetFolder}/${req.body.name.replace('.json', '')}-${new Date().getTime()}.json`, JSON.stringify(req.body.data));
      }
    ]
};