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
        if (item.purchased === true) {
            itemElement.className = "list-group-item checked";
        } else {
            itemElement.className = "list-group-item";
        }

        itemElement.id = `${item.id}`;

        itemElement.innerHTML = ``;

        itemElement.innerHTML += `<input class="item-checkbox" type="checkbox" ${item.purchased ? 'checked' : ''} onclick="toggleItemPurchased('${item.id}', '${item.name}', this.checked)"></input>`

        if (item.purchased === true) {
            itemElement.innerHTML += `
                <span class="text"><del>${item.name}</del></span>
            `;
        } else {
            itemElement.innerHTML += `
                <span class="text">${item.name}</span>
            `;
        }
        

        itemElement.innerHTML += `
            <!-- Button trigger modal -->
            <div class="buttons">
                <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modal${item.id}">✏️</button>
                <button class="btn btn-secondary move-up btn-sm">▲</button>
                <button class="btn btn-secondary move-down btn-sm">▼</button>
            </div>

            <!-- Modal -->
            <div class="modal fade" id="modal${item.id}" tabindex="-1" aria-labelledby="modalLabel${item.id}" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="modalLabel${item.id}">Üzlet szerkesztése</h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form>
                                <div class="mb-3">
                                    <label for="recipient-name" class="col-form-label">Üzlet neve:</label>
                                    <input type="text" class="form-control" id="item-name-${item.id}" value="${item.name}">
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-danger" data-bs-dismiss="modal" onclick="deleteItem(${item.id})">Törlés</button>
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" >Mégse</button>
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" onclick="editItem(${item.id})">Mentés</button>
                        </div>
                    </div>
                </div>
            </div>
            
        `;

        itemsList.appendChild(itemElement);
    });

    attachMoveButtons();
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

// Tétel állapotának módosítása
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

// Tétel törlése
async function deleteItem(itemId) {
    try {
        await fetch(`${apiUrl}/stores/${storeId}/items/${itemId}`, {
            method: 'DELETE'
        });

        fetchItems();
    } catch (error) {
        console.error('Hiba a tétel törlésekor:', error);
    }
}

// Tétel szerkesztése
async function editItem(itemId) {
    const itemNameInput = document.getElementById(`item-name-${itemId}`);
    const updatedName = itemNameInput.value;

    try {
        const response = await fetch(`${apiUrl}/stores/${storeId}/items/${itemId}`);
        const item = await response.json();

        await fetch(`${apiUrl}/stores/${storeId}/items/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({id: item.id, name: updatedName, purchased: item.purchased})
        });

        fetchItems();
    } catch (error) {
        console.error('Hiba a tétel Mentésekor:', error);
    }
}

function attachMoveButtons() {
    document.querySelectorAll('.move-up').forEach(button => {
        button.addEventListener('click', function () {
            const itemElement = this.closest('li');
            const prevElement = itemElement.previousElementSibling;
            if (prevElement) {
                itemElement.parentNode.insertBefore(itemElement, prevElement);
                updateItemOrder();
            }
        });
    });

    document.querySelectorAll('.move-down').forEach(button => {
        button.addEventListener('click', function () {
            const itemElement = this.closest('li');
            const nextElement = itemElement.nextElementSibling;
            if (nextElement) {
                itemElement.parentNode.insertBefore(nextElement, itemElement);
                updateItemOrder();
            }
        });
    });
}

async function updateItemOrder() {
    const items = Array.from(document.querySelectorAll('#items-list li')).map((el, index) => ({
        id: el.getAttribute('id'),
        position: index
    }));

    try {
        await fetch(`${apiUrl}/stores/${storeId}/items/reorder`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items })
        });
    } catch (error) {
        console.error('Hiba a sorrend frissítésekor:', error);
    }
}

// Inicializálás
fetchStore();
fetchItems();
