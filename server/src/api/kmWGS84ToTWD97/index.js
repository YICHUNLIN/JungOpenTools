
const lib = require('../../lib');
module.exports = function(context){
    return [
        (req, res, next) => {
          if (!req.query.hasOwnProperty('x') || !req.query.hasOwnProperty('y')) return res.status(400).json({code: 400, message: `?x=xx.xxx&y=oo.oo`})
          next();
        },
      (req, res) => {
        return res.status(200).json(lib.Proj4js.Twd97ToWGS84(parseFloat(req.query.x), parseFloat(req.query.y)));
      }
    ]
};