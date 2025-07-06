const fs = require('fs');
const targetFolder = `${process.cwd()}/storage/datatoshow`;

module.exports = function(context){
    return [ 
      (req, res) => {
        if (!fs.existsSync(`${targetFolder}/${req.query.fn}`)) 
          return res.status(400).json({code: 200, message: 'file name not found'})
        const d = fs.readFileSync(`${targetFolder}/${req.query.fn}`);
        res.status(200).json({code: 200, data: JSON.parse(d)})

        
      }
    ]
};