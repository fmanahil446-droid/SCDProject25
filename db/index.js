const Record = require("../models/Record");
const recordUtils = require("./record");
const vaultEvents = require("../events");

const connectMongo = require('./mongo');  // <--- ensure it matches the export
connectMongo();

// ADD RECORD
async function addRecord({ name, value }) {
  const createdAt = new Date().toISOString();
  const id = recordUtils.generateId();

  const newRecord = await Record.create({ id, name, value, createdAt });

  vaultEvents.emit("recordAdded", newRecord);
  return newRecord;
}

// LIST RECORDS
async function listRecords() {
  return await Record.find({});
}

// UPDATE RECORD
async function updateRecord(id, newName, newValue) {
  const record = await Record.findOneAndUpdate(
    { id },
    { name: newName, value: newValue },
    { new: true }
  );

  if (record) vaultEvents.emit("recordUpdated", record);
  return record;
}

// DELETE RECORD
async function deleteRecord(id) {
  const record = await Record.findOneAndDelete({ id });

  if (record) vaultEvents.emit("recordDeleted", record);
  return record;
}

module.exports = { addRecord, listRecords, updateRecord, deleteRecord };

