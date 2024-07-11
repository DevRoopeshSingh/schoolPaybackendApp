// Create # Pradip

var express = require('express');
var _router = express.Router();
var multer  = require('multer');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now())
    }
});

var upload = multer({storage: storage}).single('file');

_router.post('/assessment/file-upload',function(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    var path = '';
    upload(req,res,function(err){
  
  
        if(err)
        {
          console.log(err);
          return res.status(422).send("an Error occured")
        }
    
        path = req.file.path;
        return res.send("Upload Completed for "+path);
          
    });
  });

module.exports = _router;


