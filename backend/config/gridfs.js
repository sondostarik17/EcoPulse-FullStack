
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

let bucket = null;

const getGridFSBucket = () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error("MongoDB is not connected");
  }

  if (!bucket) {
    bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "reportsImages",
    });
  }

  return bucket;
};

module.exports = getGridFSBucket;
