const express = require('express');
const session = require('express-session');
const fs = require('fs');
const xlsx = require('xlsx')
const bodyParser = require('body-parser');

const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

// Function to read lines from a file
function readLinesFromFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                // Split the data into lines and remove empty lines
                const lines = data.split('\n').filter(line => line.trim() !== '');
                resolve(lines);
            }
        });
    });
}

// Function to read a random sheet from an Excel file and return an object with sheet name and data
function readRandomSheetFromExcel(filePath, session, minYear, maxYear) {
    const workbook = xlsx.readFile(filePath);
    const sheetNames = workbook.SheetNames;

    const filteredSheetNames = sheetNames.filter(sheetName => {
        const year = parseInt(sheetName.split('-')[0], 10);
        return year >= minYear && year <= maxYear;
    });

    if (filteredSheetNames.length === 0){
        throw new Error('No sheets available within specified range');
    }

    const randomSheetName = filteredSheetNames[Math.floor(Math.random() * filteredSheetNames.length)];
    const sheet = workbook.Sheets[randomSheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

	if (session){
		// Store sheet data in the session
		session.randomSheetData = jsonData;
		session.randomSheetName = randomSheetName;
	}

    return {
        sheetName: randomSheetName,
        data: jsonData
    };
}

function readRandomSheetFromExcel2(filePath) {
    const workbook = xlsx.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    const randomSheetName = sheetNames[Math.floor(Math.random() * sheetNames.length)];
    const sheet = workbook.Sheets[randomSheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    return {
        sheetName: randomSheetName,
        data: jsonData
    };
}


app.use("/dist", express.static(__dirname + "/dist"));
app.use(express.urlencoded());

app.use(session({
	secret: 'your_secret_key',
	resave: false,
	saveUninitialized: true,
}));

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});


// home page
app.get("/", async (req, res) => {
	try {
		// Read lines from grands-prix.txt (adjust the file path as needed)
		const filePath = __dirname + '/dist/grands-prix.txt';
		const lines = await readLinesFromFile(filePath);

		const excelFilePath = __dirname + '/all_race_results_2.xlsx';
        const randomSheetData = readRandomSheetFromExcel(excelFilePath, req.session, 1950, 2024);

		const gp_data_filepath = __dirname + '/gp_data.xlsx';
		const gp_data = readRandomSheetFromExcel2(gp_data_filepath)

		req.session.gp_data = gp_data;
	
		// Render the EJS template and pass the lines as data
		res.render('home', { lines, sheetName: randomSheetData.sheetName, randomSheetData: randomSheetData.data, gp_data: gp_data });
	} catch (err) {
		console.error('Error reading file:', err);
		res.status(500).send('Error reading file');
	}
});

app.post('/load-random-gp', async (req, res) => {
    const { minYear, maxYear } = req.body;

    const filePath = __dirname + '/dist/grands-prix.txt';
    const lines = await readLinesFromFile(filePath);

    const excelFilePath = __dirname + '/all_race_results_2.xlsx';
    const randomSheetData = readRandomSheetFromExcel(excelFilePath, req.session, minYear, maxYear);

    const gp_data_filepath = __dirname + '/gp_data.xlsx';
    const gp_data = readRandomSheetFromExcel2(gp_data_filepath)

    req.session.gp_data = gp_data;

    res.json({
        lines,
        sheetName: randomSheetData.sheetName,
        randomSheetData: randomSheetData.data,
        gp_data: gp_data
    });
})


app.get('/win-screen', (req, res) => {
	const gameWon = req.session.gameWon || false;
	if (gameWon){
		res.render('win-screen', { gp_data: req.session.gp_data.data, chosen_gp: req.session.randomSheetName });
	}
})

app.get('/get-chosen-grand-prix', (req, res) => {
    const randomSheetName = req.session.randomSheetName;
    res.json({ randomSheetName });
});


app.post('/set-game-won', (req, res) => {
	req.session.gameWon = true;
	res.sendStatus(200);
})

app.get('/get-sheet-names', (req, res) => {
    const excelFilePath = __dirname + '/all_race_results.xlsx';
    const workbook = xlsx.readFile(excelFilePath);
    const sheetNames = workbook.SheetNames;
    res.json(sheetNames);
});

app.get('/get-sheet-data/:sheetName', (req, res) => {
    const sheetName = req.params.sheetName;
    const excelFilePath = __dirname + '/all_race_results.xlsx';
    const workbook = xlsx.readFile(excelFilePath);
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    res.json(jsonData);
});


// 404 page
app.use((req, res) => {
	res.status(404);
	res.render("404", {
	  	title: "404",
	});
});
  