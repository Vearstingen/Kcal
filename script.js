const foodDatabase = {
    "ägg": { calories: 77, protein: 6 },
    "havregryn": { calories: 389, protein: 17 },
    "kvarg": { calories: 60, protein: 10 },
    "äpple": { calories: 52, protein: 0.3 },
    "kyckling": { calories: 165, protein: 31 },
    "banan": { calories: 89, protein: 1.1 },
    "lasagne": { calories: 135, protein: 7 },
    "mjölk": { calories: 42, protein: 3.4 }
};

let totalCalories = 0;
let totalProtein = 0;

const todayDate = new Date().toLocaleDateString();
document.getElementById('todayDate').textContent = todayDate;

document.getElementById('entryForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const quantity = parseFloat(document.getElementById('quantity').value);
    const unit = document.getElementById('unit').value;
    const food = document.getElementById('food').value.toLowerCase();

    if (foodDatabase[food]) {
        let calorieValue = foodDatabase[food].calories;
        let proteinValue = foodDatabase[food].protein;
        let factor = 1;
        if (unit === "g") factor = 0.01;
        if (unit === "ml") factor = 0.001;
        if (unit === "dl") factor = 0.1;

        totalCalories += calorieValue * quantity * factor;
        totalProtein += proteinValue * quantity * factor;

        updateSummary();
    } else {
        alert("Maten finns inte i databasen.");
    }

    document.getElementById('entryForm').reset();
});

function updateSummary() {
    document.getElementById('totalCalories').textContent = totalCalories.toFixed(2);
    document.getElementById('totalProtein').textContent = totalProtein.toFixed(2);
}

document.getElementById('saveDay').addEventListener('click', function() {
    const history = JSON.parse(localStorage.getItem('history')) || [];
    history.push({
        date: todayDate,
        calories: totalCalories.toFixed(2),
        protein: totalProtein.toFixed(2)
    });
    localStorage.setItem('history', JSON.stringify(history));
    renderHistory();
});

document.getElementById('resetDay').addEventListener('click', function() {
    totalCalories = 0;
    totalProtein = 0;
    updateSummary();
});

function renderHistory() {
    const history = JSON.parse(localStorage.getItem('history')) || [];
    const historyList = document.getElementById('history');
    historyList.innerHTML = '';
    history.forEach((entry, index) => {
        const li = document.createElement('li');
        li.textContent = `${entry.date}: ${entry.calories} kcal, ${entry.protein} g protein`;
        li.addEventListener('click', () => {
            if (confirm('Vill du ta bort denna post?')) {
                history.splice(index, 1);
                localStorage.setItem('history', JSON.stringify(history));
                renderHistory();
            }
        });
        historyList.appendChild(li);
    });
}

renderHistory();