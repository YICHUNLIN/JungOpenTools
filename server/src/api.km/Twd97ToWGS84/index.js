
const lib = require('../../lib');
module.exports = function(context){
    return [
      (req, res, next) => {
        console.log(req.body)
        if (!req.body.hasOwnProperty('source') ) 
          return res.status(400).json({code: 400, message: `source must be required`})
        if (!Array.isArray(req.body.source))
          return res.status(400).json({code: 400, message: `source must be anarray`});
        if (req.body.source
            .filter(s => 
                        s.hasOwnProperty('x') 
                        && s.hasOwnProperty('y')
                        && (typeof s.x === 'number') 
                        && (typeof s.y === 'number')
                    ).length !== req.body.source.length
          )
          return res.status(400).json({code: 400, message: `source item error`});
        next();
      },
      (req, res) => {
              return res.status(200)
                        .json(req.body.source.map(s => lib.Proj4js.Twd97ToWGS84(parseFloat(s.x), parseFloat(s.y))));
      }
    ]
};