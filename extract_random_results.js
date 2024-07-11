const xlsx = require('xlsx');
const fs = require('fs');

// Load the Excel file
const workbook = xlsx.readFile('all_race_results.xlsx');

// Get all sheet names
const sheetNames = workbook.SheetNames;

// Select a random sheet
const randomSheetName = sheetNames[Math.floor(Math.random() * sheetNames.length)];

// Read the content of the random sheet
const sheet = workbook.Sheets[randomSheetName];

// Convert sheet to JSON
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

// Create an object that includes the sheet name and the data
const result = {
    sheetName: randomSheetName,
    data: data
};

// Print the results
console.log(`Results from sheet: ${randomSheetName}`);
console.log(result);

// Save the results to a file
fs.writeFileSync('random_sheet_results.json', JSON.stringify(result, null, 2));
