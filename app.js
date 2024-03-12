const express = require('express');

const app = express();
app.set("view engine", "ejs");

app.use("/dist", express.static(__dirname + "/dist"));
app.use(express.urlencoded());

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});


// home page
app.get("/", (req, res) => {
    res.render("home");
});

// 404 page
app.use((req, res) => {
	res.status(404);
	res.render("404", {
	  	title: "404",
	});
});
  