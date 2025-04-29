
const {Line} = require('../../lib/road');

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
        ['start', 'end', 'length'].forEach(f => {
          if (!req.body.hasOwnProperty(f)) error[f] = 'must be required';
        })
        if (typeof req.body.start !== 'object') error["start"] = "must be an object ,like{x:y:}"
        if (typeof req.body.end !== 'object') error["end"] = "must be an object ,like{x:y:}"
        if (Object.keys(error).length > 0) return res.status(400).json({code: 400, error});
        return next();
      },
      (req, res) => {
          const l = new Line(req.body)
          return res.status(200).json({code: 200, data: l.pointOfLength(req.body.length)})
      }
    ]
};