const mongoose = require("mongoose");

const RecordSchema = new mongoose.Schema({
  id: Number,
  name: String,
  value: Number,
  createdAt: String,
});

module.exports = mongoose.model("Record", RecordSchema);
