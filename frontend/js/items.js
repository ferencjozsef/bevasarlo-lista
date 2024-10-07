const apiUrl = 'http://localhost:3000/api'; // Az API URL-je
const urlParams = new URLSearchParams(window.location.search);
const storeId = urlParams.get('storeId');

// Üzlet lekérése és név beállítása
async function fetchStore() {
    const response = await fetch(`${apiUrl}/stores/${storeId}`);
    const store = await response.json();
    const storeName = document.getElementById('store-name');
    storeName.textContent = store.name + ' bevásárló lista';
}

// Tételek lekérése és megjelenítése
async function fetchItems() {
    const response = await fetch(`${apiUrl}/stores/${storeId}`);
    const store = await response.json();
    const itemsList = document.getElementById('items-list');
    itemsList.innerHTML = '';

    store.items.forEach(item => {
        const itemElement = document.createElement('li');

        itemElement.innerHTML = `
            <div class="edit-item-section">
                <button id="btn-edit-item-${item.id}">Szerk.</button>
                <input type="checkbox" ${item.purchased ? 'checked' : ''} onclick="toggleItemPurchased('${item.id}', '${item.name}', this.checked)">
            </div>
            <div class="edit-item-name">
        `;

        if (item.purchased === true) {
            itemElement.innerHTML += `
                <p><del>${item.name}</del></p>
                </div>
            `;
        } else {
            itemElement.innerHTML += `
                <p>${item.name}</p>
                </div>
            `;
        }

        itemsList.appendChild(itemElement);
    });
}

// Új tétel hozzáadása
document.getElementById('new-item-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const itemName = document.getElementById('new-item-name').value;

    try {
        await fetch(`${apiUrl}/stores/${storeId}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: itemName})
        });

        document.getElementById('new-item-name').value = '';
        fetchItems();
    } catch (error) {
        console.error('Hiba a tétel hozzáadásakor:', error);
    }
});

// Tételek vásárlási állapotának állítása
async function toggleItemPurchased(itemId, name, isChecked) {
    try {
        await fetch(`${apiUrl}/stores/${storeId}/items/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({id: itemId, name: name, purchased: isChecked })
        });
    } catch (error) {
        console.error('Hiba a státusz frissítésekor:', error);
    }

    fetchItems();
}

// Inicializálás
fetchStore();
fetchItems();