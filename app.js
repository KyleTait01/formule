const express = require('express');
const session = require('express-session');

const app = express();
app.set("view engine", "ejs");

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
app.get("/", (req, res) => {
    res.render("home");
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
  