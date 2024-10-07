const apiUrl = 'http://localhost:3000/api'; // Az API URL-je

// Üzletek lekérése és megjelenítése
async function fetchStores() {
    const response = await fetch(`${apiUrl}/stores`);
    const stores = await response.json();
    const storesList = document.getElementById('stores-list');
    storesList.innerHTML = '';

    stores.forEach(store => {
        const storeElement = document.createElement('li');

        storeElement.innerHTML = `
            <button class="edit-store-button">Szerk.</button>
            <a href="./items.html?storeId=${store.id}">${store.name}</a>
        `;

        storesList.appendChild(storeElement);
    });
}

// Új üzlet hozzáadása
document.getElementById('new-store-form').addEventListener('submit', async (e) => {
     e.preventDefault();

    const storeName = document.getElementById('new-store-name').value;

    try {
        await fetch(`${apiUrl}/stores`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: storeName })
        });

        document.getElementById('new-store-name').value = ''; // Mező törlése
        fetchStores();
    } catch (error) {
        console.error('Hiba az üzlet hozzáadásakor:', error);
    }
});

// Inicializálás
fetchStores();