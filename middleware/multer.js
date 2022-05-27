const multer = require("multer");
const path = require("path");

module.exports = function (savelocation) {
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, savelocation));
    },
    filename: function (req, file, cb) {
      let ext = "";
      if (file.originalname.split(".").length > 1)
        ext = file.originalname.substring(
          file.originalname.lastIndexOf("."),
          file.originalname.length
        );
      cb(null, file.fieldname + Date.now() + ext);
    },
  });

  return multer({ storage: storage });
};
