
const lib = require('../../lib');
module.exports = function(context){
    return [ 
        (req, res, next) => {
          if (!req.body.hasOwnProperty('source') ) 
            return res.status(400).json({code: 400, message: `source must be required`})
          if (!Array.isArray(req.body.source))
            return res.status(400).json({code: 400, message: `source must be anarray`});
          if (req.body.source
              .filter(s => 
                          s.hasOwnProperty('lat') 
                          && s.hasOwnProperty('lng')
                          && (typeof s.lat === 'number') 
                          && (typeof s.lng === 'number')
                      ).length !== req.body.source.length
            )
            return res.status(400).json({code: 400, message: `source item error`});
          next();
        },
      (req, res) => {
        return res.status(200)
                  .json(req.body.source.map(s => lib.Proj4js.WGS84ToTwd97(s.lng, s.lat)));
      }
    ]
};