const connectMongo = require('./db/mongo'); // Adjust path if needed
connectMongo();

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const db = require('./db');   // MongoDB-based DB
require('./events/logger');   // Logger auto-runs

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ------------------------
// 🔹 Search Functionality (Async)
// ------------------------
async function searchRecords(keyword) {
  keyword = keyword.toLowerCase();
  const records = await db.listRecords();

  const results = records.filter(record =>
    record.name.toLowerCase().includes(keyword) ||
    record.id.toString().includes(keyword)
  );

  if (results.length === 0) {
    console.log("No records found.");
  } else {
    console.log(`Found ${results.length} matching record(s):`);
    results.forEach((record, index) => {
      console.log(
        `${index + 1}. ID: ${record.id} | Name: ${record.name} | Value: ${record.value} | Created: ${record.createdAt}`
      );
    });
  }
}

// ------------------------
// 🔹 Export Functionality (Async)
// ------------------------
async function exportData() {
  const records = await db.listRecords();
  if (records.length === 0) {
    console.log("No records to export.");
    return;
  }

  const exportFile = path.join(__dirname, 'export.txt');
  const now = new Date().toLocaleString();

  let content = `NodeVault Export\nDate & Time: ${now}\nTotal Records: ${records.length}\nFile: export.txt\n\n`;
  content += "ID | Name | Value | Created\n";
  content += "----------------------------------\n";

  records.forEach(r => {
    const created = r.createdAt || "N/A";
    content += `${r.id} | ${r.name} | ${r.value} | ${created}\n`;
  });

  fs.writeFileSync(exportFile, content, 'utf8');
  console.log(`✅ Data exported successfully to ${exportFile}`);
}

// ------------------------
// 🔹 Vault Statistics (Async)
// ------------------------
async function viewVaultStatistics() {
  const records = await db.listRecords();

  if (records.length === 0) {
    console.log("No records found in the vault.");
    return;
  }

  const totalRecords = records.length;

  const lastModified = records.reduce((latest, record) => {
    const date = new Date(record.createdAt);
    return date > latest ? date : latest;
  }, new Date(0));

  const longestRecord = records.reduce((longest, record) => {
    return record.name.length > longest.name.length ? record : longest;
  }, records[0]);

  const sortedByDate = records
    .map(r => new Date(r.createdAt))
    .sort((a, b) => a - b);

  const earliest = sortedByDate[0];
  const latest = sortedByDate[sortedByDate.length - 1];

  console.log("\nVault Statistics:");
  console.log("--------------------------");
  console.log(`Total Records: ${totalRecords}`);
  console.log(`Last Modified: ${lastModified.toLocaleString()}`);
  console.log(`Longest Name: ${longestRecord.name} (${longestRecord.name.length} characters)`);
  console.log(`Earliest Record: ${earliest.toISOString().split('T')[0]}`);
  console.log(`Latest Record: ${latest.toISOString().split('T')[0]}`);
}

// ------------------------
// 🔹 Main Menu
// ------------------------
function menu() {
  console.log(`
===== NodeVault =====
1. Add Record
2. List Records
3. Update Record
4. Delete Record
5. Search Record
6. Sort Records
7. Export Data
8. View Vault Statistics
9. Exit
=====================
  `);

  rl.question('Choose option: ', async ans => {

    switch (ans.trim()) {
      case '1':
        rl.question('Enter name: ', name => {
          rl.question('Enter value: ', async value => {
            await db.addRecord({ name, value });
            console.log('✅ Record added successfully!');
            menu();
          });
        });
        break;

      case '2':
        const records = await db.listRecords();
        if (records.length === 0) console.log('No records found.');
        else records.forEach(r =>
          console.log(`ID: ${r.id} | Name: ${r.name} | Value: ${r.value} | Created: ${r.createdAt}`)
        );
        menu();
        break;

      case '3':
        rl.question('Enter record ID to update: ', id => {
          rl.question('New name: ', name => {
            rl.question('New value: ', async value => {
              const updated = await db.updateRecord(Number(id), name, value);
              console.log(updated ? '✅ Record updated!' : '❌ Record not found.');
              menu();
            });
          });
        });
        break;

      case '4':
        rl.question('Enter record ID to delete: ', async id => {
          const deleted = await db.deleteRecord(Number(id));
          console.log(deleted ? '🗑️ Record deleted!' : '❌ Record not found.');
          menu();
        });
        break;

      case '5':
        rl.question('Enter search keyword: ', async keyword => {
          await searchRecords(keyword);
          menu();
        });
        break;

      case '6':
        rl.question('Sort by (name/date): ', field => {
          rl.question('Order (asc/desc): ', async order => {
            const records = await db.listRecords();
            let sorted = [...records];

            if (field.toLowerCase() === 'name') {
              sorted.sort((a, b) => a.name.localeCompare(b.name));
            } else if (field.toLowerCase() === 'date') {
              sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            } else {
              console.log('Invalid field!');
              return menu();
            }

            if (order.toLowerCase() === 'desc') sorted.reverse();

            console.log('Sorted Records:');
            sorted.forEach((r, index) => {
              console.log(
                `${index + 1}. ID: ${r.id} | Name: ${r.name} | Value: ${r.value} | Created: ${r.createdAt}`
              );
            });
            menu();
          });
        });
        break;

      case '7':
        await exportData();
        menu();
        break;

      case '8':
        await viewVaultStatistics();
        menu();
        break;

      case '9':
        console.log('👋 Exiting NodeVault...');
        rl.close();
        break;

      default:
        console.log('Invalid option.');
        menu();
    }
  });
}

menu();

