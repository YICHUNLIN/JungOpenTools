const KEY = "AIzaSyCAZilVefljqtwZ75IHBn3BGYWynpHxDTc";
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
module.exports = function(context){
    return [ 
      (req, res) => {
        model.generateContent(req.query.q)
          .then(r => res.status(200).json(r.response.candidates))
          .catch(err => res.status(400).json(err))
      }
    ]
};