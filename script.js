const localDB = {
  "ägg": { calories: 77, protein: 6 },
  "havregryn": { calories: 389, protein: 17 },
  "kvarg": { calories: 60, protein: 10 },
  "äpple": { calories: 52, protein: 0.3 },
  "kyckling": { calories: 165, protein: 31 },
  "banan": { calories: 89, protein: 1.1 },
  "lasagne": { calories: 135, protein: 7 },
  "mjölk": { calories: 42, protein: 3.4 }
};

let list = [];
let totalCalories = 0;
let totalProtein = 0;

function convert(amount, unit) {
  const factors = { g: 1, ml: 1, dl: 100, st: 100 };
  return amount * (factors[unit] || 1);
}

async function getFoodData(food) {
  if (localDB[food]) return localDB[food];

  const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${food}.json`);
  const data = await res.json();
  if (data.status === 1 && data.product.nutriments) {
    return {
      calories: data.product.nutriments['energy-kcal_100g'] || 0,
      protein: data.product.nutriments['proteins_100g'] || 0
    };
  } else {
    throw new Error("Hittar inte produkt");
  }
}

document.getElementById('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const amount = parseFloat(document.getElementById('amount').value);
  const unit = document.getElementById('unit').value;
  const food = document.getElementById('food').value.toLowerCase().replace(/ /g, "_");

  const grams = convert(amount, unit);
  try {
    const data = await getFoodData(food);
    const kcal = (data.calories / 100) * grams;
    const protein = (data.protein / 100) * grams;

    list.push({ food, kcal, protein });
    totalCalories += kcal;
    totalProtein += protein;
    updateDisplay();
  } catch {
    alert("Kunde inte hitta info om " + food);
  }

  document.getElementById('form').reset();
});

function updateDisplay() {
  const listDiv = document.getElementById('list');
  listDiv.innerHTML = '';
  list.forEach(item => {
    listDiv.innerHTML += `<p>${item.food.replace(/_/g, ' ')}: ${item.kcal.toFixed(0)} kcal, ${item.protein.toFixed(1)} g protein</p>`;
  });

  document.getElementById('summary').innerHTML = `<strong>Totalt:</strong> ${totalCalories.toFixed(0)} kcal, ${totalProtein.toFixed(1)} g protein`;
}

document.getElementById('save').addEventListener('click', () => {
  const today = new Date().toISOString().split('T')[0];
  let data = JSON.parse(localStorage.getItem('days') || '{}');
  data[today] = { kcal: totalCalories, protein: totalProtein };
  localStorage.setItem('days', JSON.stringify(data));
  renderHistory();
});

document.getElementById('reset').addEventListener('click', () => {
  list = [];
  totalCalories = 0;
  totalProtein = 0;
  updateDisplay();
});

function renderHistory() {
  const history = document.getElementById('history');
  history.innerHTML = '';
  const data = JSON.parse(localStorage.getItem('days') || '{}');
  for (let [date, entry] of Object.entries(data)) {
    const li = document.createElement('li');
    li.textContent = `${date}: ${entry.kcal.toFixed(0)} kcal, ${entry.protein.toFixed(1)} g protein`;
    li.onclick = () => {
      if (confirm('Ta bort denna dag?')) {
        delete data[date];
        localStorage.setItem('days', JSON.stringify(data));
        renderHistory();
      }
    };
    history.appendChild(li);
  }

  const week = document.getElementById('week');
  let wkcal = 0, wprot = 0;
  Object.values(data).forEach(d => {
    wkcal += d.kcal;
    wprot += d.protein;
  });
  week.innerHTML = `Totalt denna vecka: ${wkcal.toFixed(0)} kcal, ${wprot.toFixed(1)} g protein`;
}

renderHistory();
