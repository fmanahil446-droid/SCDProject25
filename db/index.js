const fs = require('fs');
const path = require('path');
const fileDB = require('./file');
const recordUtils = require('./record');
const vaultEvents = require('../events');
const dbFile = './file.json';

if (!fs.existsSync(dbFile)) {
  fs.writeFileSync(dbFile, '[]', 'utf-8');
}
// ------------------ Ensure all existing records have 'created' ------------------ //
const data = fileDB.readDB();
let updated = false;
data.forEach(r => {
  if (!r.created) {
    r.created = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    updated = true;
  }
});
if (updated) fileDB.writeDB(data);

// ------------------ Backup Function ------------------ //
function backupDB() {
  const data = fileDB.readDB();
  const now = new Date();
  const timestamp = now.toISOString().replace(/:/g, '-'); // safe filename
  const backupFolder = path.join(__dirname, '../backups');

  // Ensure backups folder exists
  if (!fs.existsSync(backupFolder)) fs.mkdirSync(backupFolder);

  const backupFile = path.join(backupFolder, `backup_${timestamp}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`💾 Backup created: ${backupFile}`);
}

// ------------------ DB Functions ------------------ //
function addRecord({ name, value }) {
  recordUtils.validateRecord({ name, value });
  const data = fileDB.readDB();
  const created = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const newRecord = { id: recordUtils.generateId(), name, value, created };
  data.push(newRecord);
  fileDB.writeDB(data);
  vaultEvents.emit('recordAdded', newRecord);

  // Automatic backup
  backupDB();

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

  // Automatic backup
  backupDB();

  return record;
}

// ------------------ Exports ------------------ //
module.exports = { addRecord, listRecords, updateRecord, deleteRecord, backupDB };

