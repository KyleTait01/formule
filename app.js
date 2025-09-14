const express = require("express");
const session = require("express-session");
const fs = require("fs");
const xlsx = require("xlsx");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.set("view engine", "ejs");

// ===== MIDDLEWARE =====
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/dist", express.static(path.join(__dirname, "dist")));
app.use(express.urlencoded());

app.use(session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
}));

// ===== HELPERS =====
function readLinesFromFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) return reject(err);
            const lines = data.split("\n").filter(line => line.trim() !== "");
            resolve(lines);
        });
    });
}

// Pick a random valid race sheet from results Excel
function readRandomRace(filePath, session, minYear, maxYear) {
    const workbook = xlsx.readFile(filePath);
    const sheetNames = workbook.SheetNames;

    const filteredSheetNames = sheetNames.filter(name => {
        const year = parseInt(name.split("-")[0], 10);
        return year >= minYear && year <= maxYear;
    });

    if (filteredSheetNames.length === 0) {
        throw new Error("No races available within specified range");
    }

    const randomSheetName = filteredSheetNames[Math.floor(Math.random() * filteredSheetNames.length)];
    const sheet = workbook.Sheets[randomSheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    // Store in session for later reference
    if (session) {
        session.randomSheetData = jsonData;
        session.randomSheetName = randomSheetName;
    }

    return { sheetName: randomSheetName, data: jsonData };
}

// Load GP metadata (continents, types, etc.)
function loadGpData(filePath) {
    const workbook = xlsx.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    const randomSheetName = sheetNames[Math.floor(Math.random() * sheetNames.length)];
    const sheet = workbook.Sheets[randomSheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    return { sheetName: randomSheetName, data: jsonData };
}

// ===== ROUTES =====

// Home page
app.get("/", async (req, res) => {
    try {
        const lines = await readLinesFromFile(path.join(__dirname, "dist", "grands-prix.txt"));

        const resultsPath = path.join(__dirname, "all_race_results.xlsx");
        const raceData = readRandomRace(resultsPath, req.session, 1950, 2024);

        const gpDataPath = path.join(__dirname, "gp_data.xlsx");
        const gpData = loadGpData(gpDataPath);

        req.session.gp_data = gpData;

        res.render("home", {
            lines,
            sheetName: raceData.sheetName,
            randomSheetData: raceData.data,
            gp_data: gpData,
        });
    } catch (err) {
        console.error("Error loading home page:", err);
        res.status(500).send("Error loading data");
    }
});

// Load a random GP (after reset, with year filters)
app.post("/load-random-gp", async (req, res) => {
    const { minYear, maxYear } = req.body;

    const lines = await readLinesFromFile(path.join(__dirname, "dist", "grands-prix.txt"));

    const resultsPath = path.join(__dirname, "all_race_results.xlsx");
    const raceData = readRandomRace(resultsPath, req.session, minYear, maxYear);

    const gpDataPath = path.join(__dirname, "gp_data.xlsx");
    const gpData = loadGpData(gpDataPath);

    req.session.gp_data = gpData;

    res.json({
        lines,
        sheetName: raceData.sheetName,
        randomSheetData: raceData.data,
        gp_data: gpData,
    });
});

// Show win screen
app.get("/win-screen", (req, res) => {
    const gameWon = req.session.gameWon || false;
    if (gameWon) {
        res.render("win-screen", {
            gp_data: req.session.gp_data.data,
            chosen_gp: req.session.randomSheetName,
        });
    } else {
        res.sendStatus(403); // forbidden if game not won
    }
});

// Return the currently chosen GP
app.get("/get-chosen-grand-prix", (req, res) => {
    res.json({ randomSheetName: req.session.randomSheetName });
});

// Mark game as won
app.post("/set-game-won", (req, res) => {
    req.session.gameWon = true;
    res.sendStatus(200);
});

// 404 fallback
app.use((req, res) => {
    res.status(404).render("404", { title: "404" });
});

// ===== SERVER =====
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
