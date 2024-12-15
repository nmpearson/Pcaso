"use strict";

var FileContainer = require("../../app/models/fileContainer.js");
var User = require("../../app/models/user.js").User;
var fs = require("fs");
var csv = require("csv-parser");

module.exports = {
  getUserFiles: function (userId, callback) {
    console.log("Fetching files for user ID:", userId);

    User.findById(userId).exec(function (err, user) {
      if (err) {
        console.error("Error finding user:", err.message);
        return callback(err);
      }

      if (!user) {
        console.log("User not found for ID:", userId);
        return callback(new Error("User not found"));
      }

      console.log("User found:", user.name.first, user.name.last);

      FileContainer.find({ "parent.id": user._id })
        .limit(10)
        .exec(function (err, files) {
          if (err) {
            console.error("Error fetching files for user:", err.message);
            return callback(err);
          }

          console.log(
            "Files retrieved:",
            files.length > 0 ? files.length + " files" : "No files found"
          );
          callback(null, files);
        });
    });
  },
  getAllFiles: function (callback) {
    FileContainer.find()
      .limit(10)
      .exec(function (err, files) {
        if (err) {
          console.error("Error fetching files:", err.message);
          return callback(err);
        }

        console.log(
          "Files retrieved:",
          files.length > 0 ? files.length + " files" : "No files found"
        );
        callback(null, files);
      });
  },

  parseCsvFile: function (filePath, callback) {
    console.log("Reading CSV file from path:", filePath);

    fs.access(filePath, fs.constants.F_OK, function (err) {
      if (err) {
        console.error("File does not exist or is not accessible:", filePath);
        return callback(null, []); // Return empty data
      }

      var csvData = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", function (row) {
          var rowArray = Object.values(row);
          csvData.push(rowArray);
        })
        .on("end", function () {
          if (csvData.length === 0) {
            console.warn("CSV data parsing resulted in empty data:", filePath);
            return callback(null, []); // Return empty data
          }
          console.log(
            "CSV data parsing complete. Total rows parsed: haaaaaaaaaaa",
            csvData.length
          );
          callback(null, csvData);
        })
        .on("error", function (err) {
          console.error("Error reading CSV file:", err.message);
          callback(null, []); // Return empty data on error
        });
    });
  },

  initGallery: function (req, res) {
    var self = this;

    // Fetch all files from the database
    self.getAllFiles(function (err, files) {
      if (err) {
        console.error("Error retrieving files:", err.message);
        return res.status(500).send("Internal server error");
      }

      var processedFiles = [];
      var processedCount = 0;

      if (files.length === 0) {
        console.log("No files to process.");
        return res.render("gallery", {
          user: req.user, // User information, if available
          files: processedFiles, // Empty array if no files
        });
      }

      // Filter files by removing private ones
      var visibleFiles = files.filter((file) => {
        return (
          file.displaySettings &&
          file.displaySettings.visibility &&
          file.displaySettings.visibility !== "PRIVATE"
        );
      });

      if (visibleFiles.length === 0) {
        console.log("No visible files to process.");
        return res.render("gallery", {
          user: req.user, // User information, if available
          files: processedFiles, // Empty array if no visible files
        });
      }

      visibleFiles.forEach(function (file) {
        var filePath = file.file.path;

        self.parseCsvFile(filePath, function (err, csvData) {
          processedCount++;
          if (csvData.length > 0) {
            file.csvData = csvData.slice(0, 10); // Limit to 10 rows
            processedFiles.push(file);
          } else {
            console.warn("Error or no data for file:", file.file.name);
          }

          if (processedCount === visibleFiles.length) {
            processedFiles.forEach((file) => {
              file["_doc"].csvData = file.csvData; // Add csvData to the _doc field
            });

            res.render("gallery", {
              user: req.user, // User information, if available
              files: processedFiles,
            });
          }
        });
      });
    });
  },
};

module.exports.initGallery = module.exports.initGallery;
module.exports.getUserFiles = module.exports.getUserFiles;
module.exports.parseCsvFile = module.exports.parseCsvFile;
