
const {Curve} = require('../../lib/road');

/*
body: {
  start: [number,number],
  r: number,
  center: [number, number],
  bulge: number
}
*/
module.exports = function(context){
    return [
      (req, res, next) => {
        let error = {}
        ['start', 'r', 'center', 'bulge', 'length'].forEach(f => {
          if (!req.body.hasOwnProperty(f)) error[f] = 'must be required';
        })
        if (Object.keys(error).length > 0) return res.status(400).json({code: 400, error});
        return next();
      },
      (req, res) => {
          const c = new Curve(req.body);
          return res.status(200).json({code: 200, data: c.pointOfLength(req.body.length)})
      }
    ]
};