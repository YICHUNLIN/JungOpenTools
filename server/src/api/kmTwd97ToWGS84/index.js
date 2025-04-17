
const lib = require('../../lib');
module.exports = function(context){
    return [ 
        (req, res, next) => {
          if (!req.query.hasOwnProperty('lat') || !req.query.hasOwnProperty('lng')) return res.status(400).json({code: 400, message: `?lat=xx.xxx&lng=oo.oo`})
          next();
        },
      (req, res) => {
        const result = lib.Proj4js.WGS84ToTwd97(parseFloat(req.query.lng), parseFloat(req.query.lat));
        return res.status(200).json({x: result.x, y: result.y});
      }
    ]
};