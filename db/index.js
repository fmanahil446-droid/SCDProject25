const fileDB = require('./file');
const recordUtils = require('./record');
const vaultEvents = require('../events');

const data = fileDB.readDB();
let updated = false;
data.forEach(r => {
  if (!r.created) {
    r.created = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    updated = true;
  }
});
if (updated) fileDB.writeDB(data);

function addRecord({ name, value }) {
  recordUtils.validateRecord({ name, value });
  const data = fileDB.readDB();
  const created = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const newRecord = { id: recordUtils.generateId(), name, value, created }; // add created field
  data.push(newRecord);
  fileDB.writeDB(data);
  vaultEvents.emit('recordAdded', newRecord);
  return newRecord;
}


function listRecords() {
  return fileDB.readDB();
}

function updateRecord(id, newName, newValue) {
  const data = fileDB.readDB();
  const record = data.find(r => r.id === id);
  if (!record) return null;
  record.name = newName;
  record.value = newValue;
  fileDB.writeDB(data);
  vaultEvents.emit('recordUpdated', record);
  return record;
}

function deleteRecord(id) {
  let data = fileDB.readDB();
  const record = data.find(r => r.id === id);
  if (!record) return null;
  data = data.filter(r => r.id !== id);
  fileDB.writeDB(data);
  vaultEvents.emit('recordDeleted', record);
  return record;
}

module.exports = { addRecord, listRecords, updateRecord, deleteRecord };
