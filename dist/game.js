// ===== DOM ELEMENTS =====
const results = document.getElementById('results');
const yearsLabel = document.getElementById('years_label');
const resetBtn = document.getElementById('reset_btn');
const tableBody = document.querySelector('tbody');
const guessHistory = document.getElementById('guess_history');
const minYearInput = document.getElementById('min_range_input');
const maxYearInput = document.getElementById('max_range_input');
const loader = document.getElementById('loader');

const gameScreen = document.getElementById('game_screen');
const grandPrixSel = document.getElementById('grand_prix_sel');
const yearSel = document.getElementById('year_sel');
const submitBtn = document.getElementById('submit_btn');

// ===== STATE =====
let gameWon = false;
let rotation = 0;
let wrongGuesses = 0;
let totalGuesses = 0;

let grandPrix = '';
let year = 0;
let sheetName = '';
let targetContinent = '';
let targetType = '';

const gpData = window.gp_data;

// ===== HELPERS =====
function formatDriverName(name) {
    const cleanName = name.replace(/\s+/g, ' ').trim();
    const parts = cleanName.split(' ');

    const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
    const lastName = parts.slice(1).join(' ').toUpperCase();

    return lastName ? `${firstName} ${lastName}` : firstName;
}

function formatGpName(sheetName) {
    return sheetName
        .split('-')
        .slice(1)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .replace('grand', 'Grand');
}

function withinRange(x, y) {
    return Math.abs(x - y) <= 3;
}

// ===== TABLE =====
function updateTable(data) {
    tableBody.innerHTML = '';

    data.forEach((row, i) => {
        if (i < 5) {
            const tr = document.createElement('tr');
            row.forEach((cell, j) => {
                const td = document.createElement('td');
                td.textContent = (j === 1) ? formatDriverName(cell) : cell;
                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        }
    });
}

// ===== GAME FLOW =====
function removeWinScreen() {
    const winScreen = document.getElementById('win_screen');
    if (winScreen) winScreen.remove();

    grandPrixSel.disabled = false;
    yearSel.disabled = false;
    submitBtn.disabled = false;

    grandPrixSel.selectedIndex = 0;
    yearSel.selectedIndex = 0;
}

async function getChosenGrandPrix() {
    try {
        const response = await fetch('/get-chosen-grand-prix');
        const { randomSheetName } = await response.json();

        sheetName = randomSheetName;
        year = sheetName.split('-')[0];
        grandPrix = formatGpName(sheetName);

        gpData.data.forEach(gp => {
            if (gp[0] === grandPrix) {
                targetContinent = gp[1];
                targetType = gp[3];
            }
        });
    } catch (error) {
        console.error('Error fetching chosen grand prix:', error);
    }
}

// ===== STATS =====
function getStats() {
    const stats = JSON.parse(localStorage.getItem('formuleStats')) || [];
    const totalGames = stats.length;
    const avgNoGuesses = totalGames > 0
        ? (stats.reduce((a, b) => a + b, 0) / totalGames).toFixed(2)
        : 0;
    return { stats, totalGames, avgNoGuesses };
}

function saveStats(guessCount) {
    let stats = JSON.parse(localStorage.getItem('formuleStats')) || [];
    stats.push(guessCount > 6 ? 6 : guessCount);
    localStorage.setItem('formuleStats', JSON.stringify(stats));
}

function renderHistory(stats, avgNoGuesses) {
    const counts = { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0 };
    stats.forEach(num => num >= 6 ? counts[6]++ : counts[num]++);

    const total = stats.length || 1;
    let html = `
        <h3 class="mb-4 text-base"><span class="text-lg font-bold">${total}</span> Rounds Played</h3>
        <h4 class="mb-4">Guess Distribution</h4>
    `;

    Object.keys(counts).forEach(key => {
        const percentage = (counts[key] / total) * 100;
        const label = key >= 6 ? '6+' : key;

        html += `
            <div class="flex items-center mr-2">
                <span style="width:30px;">${label}</span>
                <div class="flex-1 bg-gray-300 h-[14px] mx-2 relative">
                    <div class="bg-green-600 h-full" style="width:${percentage}%"></div>
                </div>
                <span style="width:30px;" class="ml-2">${Math.round(percentage)}%</span>
            </div>
        `;
    });

    document.getElementById('stats_body').innerHTML = html;
}

// ===== EVENTS =====
resetBtn.addEventListener('click', () => {
    results.classList.add('hidden');
    loader.classList.remove('hidden');
    removeWinScreen();
    guessHistory.innerHTML = '';

    rotation += 360;
    wrongGuesses = 0;
    totalGuesses = 0;
    document.getElementById('hint').innerHTML = '';

    resetBtn.querySelector('svg').style.transition = 'transform 0.5s ease-in-out';
    resetBtn.querySelector('svg').style.transform = `rotate(${rotation}deg)`;

    const minYear = parseInt(minYearInput.value, 10);
    const maxYear = parseInt(maxYearInput.value, 10);

    fetch('/load-random-gp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minYear, maxYear })
    })
    .then(r => r.json())
    .then(data => {
        updateTable(data.randomSheetData);
        getChosenGrandPrix();
        loader.classList.add('hidden');
        results.classList.remove('hidden');
    });
});

submitBtn.addEventListener('click', () => {
    const grandPrixGuess = grandPrixSel.value.trim();
    const yearGuess = yearSel.value.trim();
    totalGuesses++;

    guessHistory.innerHTML += '<div class="guess"><h3 class="gp-guess"></h3><h3 class="year-guess"></h3></div>';
    const gpGuessBoxes = document.getElementsByClassName('gp-guess');
    const yearGuessBoxes = document.getElementsByClassName('year-guess');

    // Find continent of guessed GP
    let chosenContinent = '';
    gpData.data.forEach(gp => {
        if (gp[0] === grandPrixGuess) chosenContinent = gp[1];
    });

    // Fill GP guess box
    for (let i = 0; i < gpGuessBoxes.length; i++) {
        if (gpGuessBoxes[i].innerHTML === '') {
            gpGuessBoxes[i].innerHTML = grandPrixGuess;
            if (grandPrixGuess.toLowerCase() === grandPrix.toLowerCase()) {
                gpGuessBoxes[i].classList.add('correct-guess');
            } else if (chosenContinent === targetContinent) {
                gpGuessBoxes[i].classList.add('partial-guess');
            } else {
                gpGuessBoxes[i].classList.add('wrong-guess');
            }
            break;
        }
    }

    // Fill Year guess box
    for (let i = 0; i < yearGuessBoxes.length; i++) {
        if (yearGuessBoxes[i].innerHTML === '') {
            yearGuessBoxes[i].innerHTML = yearGuess;

            if (yearGuess > year) {
                yearGuessBoxes[i].innerHTML += '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-down"><polyline points="6 9 12 15 18 9"></polyline></svg>';
            } else if (yearGuess < year) {
                yearGuessBoxes[i].innerHTML += '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-up"><polyline points="18 15 12 9 6 15"></polyline></svg>';
            }

            if (yearGuess == year) {
                yearGuessBoxes[i].classList.add('correct-guess');
            } else if (withinRange(year, yearGuess)) {
                yearGuessBoxes[i].classList.add('close-guess');
            } else {
                yearGuessBoxes[i].classList.add('wrong-guess');
            }
            break;
        }
    }

    // Win condition
    if (grandPrixGuess.toLowerCase() === grandPrix.toLowerCase() && yearGuess == year) {
        grandPrixSel.disabled = true;
        yearSel.disabled = true;
        submitBtn.disabled = true;
        gameWon = true;

        saveStats(totalGuesses);
        const { stats, avgNoGuesses } = getStats();
        renderHistory(stats, avgNoGuesses);

        fetch('/set-game-won', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gameWon: true }),
        })
        .then(r => {
            if (r.ok) {
                fetch('/win-screen')
                .then(r => r.text())
                .then(html => {
                    const parser = new DOMParser();
                    const winScreenContent = parser.parseFromString(html, 'text/html');
                    gameScreen.appendChild(winScreenContent.body.firstChild);
                });
            }
        });
    } else {
        wrongGuesses++;
        if (wrongGuesses === 3) {
            document.getElementById('hint').innerHTML = `<h5>(Track Type: <span class="font-semibold">${targetType}</span>)</h5>`;
        }
    }
});

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    getChosenGrandPrix();
    const { stats, avgNoGuesses } = getStats();
    renderHistory(stats, avgNoGuesses);
});
