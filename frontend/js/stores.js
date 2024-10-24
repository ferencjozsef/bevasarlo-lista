const apiUrl = 'http://localhost:3000/api'; // Az API URL-je

// Üzletek lekérése és megjelenítése
async function fetchStores() {
    const response = await fetch(`${apiUrl}/stores`);
    const stores = await response.json();
    const storesList = document.getElementById('stores-list');
    storesList.innerHTML = '';

    stores.forEach(store => {
        const storeElement = document.createElement('li');
        storeElement.className = 'list-group-item';

        storeElement.innerHTML = `
            <!-- Button trigger modal -->
            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal${store.id}">
            Szerk.
            </button>

            <!-- Modal -->
            <div class="modal fade" id="modal${store.id}" tabindex="-1" aria-labelledby="modalLabel${store.id}" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="modalLabel${store.id}">Üzlet szerkesztése</h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form>
                                <div class="mb-3">
                                    <label for="recipient-name" class="col-form-label">Üzlet neve:</label>
                                    <input type="text" class="form-control" id="store-name-${store.id}" value="${store.name}">
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-danger" data-bs-dismiss="modal" onclick="deleteStore(${store.id})">Törlés</button>
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Mégse</button>
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" onclick="editStore(${store.id})">Mentés</button>
                        </div>
                    </div>
                </div>
            </div>
            
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

// Üzlet törlése
async function deleteStore(storeId) {
    try {
        await fetch(`${apiUrl}/stores/${storeId}`, {
            method: 'DELETE'
        });

        fetchStores();
    } catch (error) {
        console.error('Hiba az üzlet törlésekor:', error);
    }
}


// Üzlet szerkesztése
async function editStore(storeId) {
    const storeNameInput = document.getElementById(`store-name-${storeId}`);
    const updatedName = storeNameInput.value;

    try {
        const response = await fetch(`${apiUrl}/stores/${storeId}`);

        await fetch(`${apiUrl}/stores/${storeId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({name: updatedName})
        });

        fetchStores();
    } catch (error) {
        console.error('Hiba a tétel Mentésekor:', error);
    }
}

// Inicializálás
fetchStores();