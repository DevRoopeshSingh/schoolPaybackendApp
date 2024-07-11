// Create # Pradip

var multer = require('multer');
var LocalStorage = require('node-localstorage').LocalStorage,
    localStorage = new LocalStorage('./scratch');
const path = require("path");
const fs = require("fs");

const FileUploadController = () => {

    var storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/i2talent_disability_certificate')
        },
        filename: (req, file, cb) => {
            cb(null, 'file-' + localStorage.getItem("getUserId"));
        }
    });

    var upload = multer({ storage: storage }).single('file');

    const fileUpload = async (req, res) => {
        res.header("Access-Control-Allow-Origin", "*");
        var fileName = '';
        upload(req, res, function (err) {

            if (err) {
                console.log(err);
                return res.status(422).send("an Error occured")
            }
            //fileName = 'file-' + req.token.i2talent_user_id;
            fileName = 'file-' + req.body.i2talent_user_id;
            localStorage.setItem('getUserId', req.body.i2talent_user_id);
            const filePath = path.join(__dirname, "../../uploads/i2talent_disability_certificate/" + fileName)
            var fileArray = { 'fileName': fileName, 'filePath': filePath };
            res.send(fileArray);

        });
    };

    // Function to download document file
    const downloadDisabilityCertificate = async (req, res) => {
        try {
            let fileName = req.params.file_name;
            const filePath = path.join(__dirname, "../../uploads/i2talent_disability_certificate/" + fileName);
            if (fs.existsSync(filePath)) {
                res.sendFile(filePath); // download
            } else{
                res.send("No such file or directory");
            }    
        } catch (error) {
            res.send("No such file or directory");
        }
    };
    return {
        fileUpload,
        downloadDisabilityCertificate
    }
}

module.exports = FileUploadController