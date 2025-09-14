# Formule

### An Wordle-inspired Formula One guessing game.
A browser-based guessing game where you must identify the Formula 1 Grand Prix and year from the top 5 standings from the end of the race.

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/646b2dd9-b9ca-4a96-93ac-71951f67402a" />

---

## How to Play

- You are shown the **top 5 finishing positions** from a random GP:
  - Driver  
  - Constructor  
  - Laps completed  
  - Time/retirement status  
  - Points scored  

- Enter your guess for the **Grand Prix** and the **Year**.
- Hints will guide you:
  - ✅ Correct guess = highlighted in green  
  - 🟧 Same continent / close year = highlighted in orange  
  - ❌ Wrong guess = highlighted in red  
- After 3 incorrect guesses, you’ll also get a **Track Type hint** (street / permanent).
- Your **stats** (rounds played, guess distribution, average guesses) are tracked locally in your browser.

## Features

- Full F1 history dataset (1950–present).  
- Custom year range selection (e.g. limit to 2000–2020 seasons).  
- Local stats tracking (guess distribution).  
- Hints for continent and track type.

## Tech Stack

- [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)  
- [EJS](https://ejs.co/) templating  
- [Tailwind CSS](https://tailwindcss.com/)  
- [xlsx](https://www.npmjs.com/package/xlsx) for reading race data
- [Python](https://www.python.org/) for scraping race data


Race data scraped from https://gparchive.com
