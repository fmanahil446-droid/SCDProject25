const express = require('express');
const bodyParser = require('body-parser');
const { addRecord, listRecords, updateRecord, deleteRecord } = require('./db'); // import your existing functions

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to NodeVault Web Interface!');
});

app.get('/records', async (req, res) => {
  const records = await listRecords();
  res.json(records);
});

app.post('/records', async (req, res) => {
  const result = await addRecord(req.body);
  res.json(result);
});

app.put('/records/:id', async (req, res) => {
  const result = await updateRecord(req.params.id, req.body);
  res.json(result);
});

app.delete('/records/:id', async (req, res) => {
  const result = await deleteRecord(req.params.id);
  res.json(result);
});

// Start server
app.listen(PORT, () => {
  console.log(`NodeVault Web Server running at http://localhost:${PORT}`);
});
