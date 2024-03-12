const express = require('express');
const session = require('express-session');
const fs = require('fs');

const app = express();
app.set("view engine", "ejs");

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
	
		// Render the EJS template and pass the lines as data
		res.render('home', { lines });
	} catch (err) {
		console.error('Error reading file:', err);
		res.status(500).send('Error reading file');
	}
});

app.get('/win-screen', (req, res) => {
	const gameWon = req.session.gameWon || false;
	if (gameWon){
		res.render('win-screen');
	}
})

app.post('/set-game-won', (req, res) => {
	req.session.gameWon = true;
	res.sendStatus(200);
})

// 404 page
app.use((req, res) => {
	res.status(404);
	res.render("404", {
	  	title: "404",
	});
});
  