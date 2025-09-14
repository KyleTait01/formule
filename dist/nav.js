helpBtn = document.getElementById("help_btn");
helpModal = document.getElementById("help_modal");

settingsBtn = document.getElementById("settings_btn");
settingsModal = document.getElementById("settings_modal");

statsBtn = document.getElementById('stats_btn');
statsModal = document.getElementById('stats_modal');

modals = document.querySelectorAll(".modal");

closeBtns = document.querySelectorAll(".close-btn");

console.log(closeBtns);

statsBtn.addEventListener("click", function(){
    statsModal.classList.remove("hidden");
})

helpBtn.addEventListener("click", function(){
    helpModal.classList.remove("hidden");
})

settingsBtn.addEventListener("click", function(){
    settingsModal.classList.remove("hidden");
})

closeBtns.forEach((closeBtn) => {
    closeBtn.addEventListener("click", function(){
        modals.forEach((modal) => {
            modal.classList.add("hidden");
        })
    })
})

const rangeInputvalue = document.querySelectorAll(".range-input input"); 
const minLabel = document.querySelector(".year-input .min-year");
const maxLabel = document.querySelector(".year-input .max-year");

rangeInputvalue.forEach((rangeInput) => {
    rangeInput.addEventListener("input", function(){
        if (rangeInput.classList.contains("min-range")){
            minLabel.innerHTML = rangeInput.value;
        } else {
            maxLabel.innerHTML = rangeInput.value;
        }

        yearsLabel.textContent = minLabel.innerHTML + " - " + maxLabel.innerHTML;
    })
})
