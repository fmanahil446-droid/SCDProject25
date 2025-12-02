const readline = require('readline');
const db = require('./db');
require('./events/logger'); // Initialize event logger

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to search records
function searchRecords() {
  rl.question('Enter search keyword (ID or Name): ', keyword => {
    const lowerKeyword = keyword.toLowerCase();
    const results = db.listRecords().filter(record =>
      record.name.toLowerCase().includes(lowerKeyword) ||
      record.id.toString() === keyword
    );

    if (results.length === 0) {
      console.log('No records found.');
    } else {
      console.log(`Found ${results.length} matching record(s):`);
      results.forEach((r, index) => {
        console.log(`${index + 1}. ID: ${r.id} | Name: ${r.name} | Value: ${r.value} | Created: ${r.created}`);
      });
    }
    menu(); // Return to menu after search
  });
}

// Function to sort records
function sortRecords() {
  rl.question('Choose field to sort by (Name/Created): ', field => {
    const sortField = field.toLowerCase();
    if (sortField !== 'name' && sortField !== 'created') {
      console.log('Invalid field.');
      return menu();
    }

    rl.question('Choose order (Ascending/Descending): ', order => {
      const ascending = order.toLowerCase() === 'ascending';
      const recordsCopy = [...db.listRecords()]; // copy to avoid modifying vault

      recordsCopy.sort((a, b) => {
        if (sortField === 'name') {
          return ascending
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        } else { // sortField === 'created'
          return ascending
            ? new Date(a.created) - new Date(b.created)
            : new Date(b.created) - new Date(a.created);
        }
      });

      console.log('Sorted Records:');
      recordsCopy.forEach((r, index) => {
        console.log(`${index + 1}. ID: ${r.id} | Name: ${r.name} | Value: ${r.value} | Created: ${r.created}`);
      });

      menu(); // Return to menu after sorting
    });
  });
}

function menu() {
  console.log(`
===== NodeVault =====
1. Add Record
2. List Records
3. Update Record
4. Delete Record
5. Search Records
6. Sort Records
7. Exit
=====================
  `);

  rl.question('Choose option: ', ans => {
    switch (ans.trim()) {
      case '1':
        rl.question('Enter name: ', name => {
          rl.question('Enter value: ', value => {
            db.addRecord({ name, value });
            console.log('✅ Record added successfully!');
            menu();
          });
        });
        break;

      case '2':
        const records = db.listRecords();
        if (records.length === 0) console.log('No records found.');
        else records.forEach(r => console.log(`ID: ${r.id} | Name: ${r.name} | Value: ${r.value} | Created: ${r.created}`));
        menu();
        break;

      case '3':
        rl.question('Enter record ID to update: ', id => {
          rl.question('New name: ', name => {
            rl.question('New value: ', value => {
              const updated = db.updateRecord(Number(id), name, value);
              console.log(updated ? '✅ Record updated!' : '❌ Record not found.');
              menu();
            });
          });
        });
        break;

      case '4':
        rl.question('Enter record ID to delete: ', id => {
          const deleted = db.deleteRecord(Number(id));
          console.log(deleted ? '🗑️ Record deleted!' : '❌ Record not found.');
          menu();
        });
        break;

      case '5':
        searchRecords();
        break;

      case '6':
        sortRecords();
        break;

      case '7':
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

