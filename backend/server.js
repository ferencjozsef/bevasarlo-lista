const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());


let stores = [];
const DATA_FILE = 'stores.json';

// Üzletek lekérése
app.get('/api/stores', (req, res) => {
    res.json(stores);
});

// Üzlet lekérdezése
app.get('/api/stores/:id', (req, res) => {
    const store = stores.find(s => s.id === req.params.id);
    if (store) {
        // Tételek sorrend szerint rendezése
        store.items.sort((a, b) => a.order - b.order);
        res.json(store);
    } else {
        res.status(404).send('Store not found');
    }
});

// Új üzlet hozzáadása
app.post('/api/stores', (req, res) => {
    const store = {
        id: Date.now().toString(),
        name: req.body.name,
        items: []
    };
    stores.push(store);
    res.json(store);
});

// Üzlet szerkesztése
app.put('/api/stores/:id', (req, res) => {
    const store = stores.find(s => s.id === req.params.id);
    if (store) {
        store.name = req.body.name;
        res.json(store);
    } else {
        res.status(404).send('Store not found');
    }
});

// Üzlet törlése
app.delete('/api/stores/:id', (req, res) => {
    stores = stores.filter(s => s.id !== req.params.id);
    res.json({ success: true });
});

// Tétel lekérdezése egy üzlethez
app.get('/api/stores/:id/items/:itemId', (req, res) => {
    const store = stores.find(s => s.id === req.params.id);
    if (store) {
		const item = store.items.find(i => i.id === req.params.itemId);
        if (item) {
            res.json(item);
        } else {
            res.status(404).send('Item not found');
        }
    } else {
        res.status(404).send('Store not found');
    }
});

// Tétel hozzáadása egy üzlethez
app.post('/api/stores/:id/items', (req, res) => {
    const store = stores.find(s => s.id === req.params.id);
    if (store) {
        const newOrder = store.items.length > 0 ? Math.max(...store.items.map(i => i.order)) + 1 : 0;
        const item = {
            id: Date.now().toString(),
            name: req.body.name,
            purchased: false,
            order: newOrder // Alapértelmezett sorrend az utolsó helyre kerül
        };
        store.items.push(item);
        res.json(item);
    } else {
        res.status(404).send('Store not found');
    }
});

// Tétel sorrendjének módosítása
app.put('/api/stores/:id/items/reorder', (req, res) => {
    const store = stores.find(s => s.id === req.params.id);
    if (!store) {
        return res.status(404).send('Store not found');
    }

    //console.log("Request body:", JSON.stringify(req.body, null, 2));

    const { items } = req.body; // A helyes kulcs: "items"
    if (!Array.isArray(items)) {
        return res.status(400).send('Invalid request format');
    }

    // Frissítjük az elemek sorrendjét
    items.forEach(({ id, position }) => {
        const existingItem = store.items.find(i => i.id === id);
        if (existingItem) {
            existingItem.order = position; // order helyett position
        }
    });

    // Visszaadjuk a frissített elemeket
    res.json(store.items.sort((a, b) => a.order - b.order));
});


// Tétel szerkesztése egy üzletben
app.put('/api/stores/:storeId/items/:itemId', (req, res) => {
    const store = stores.find(s => s.id === req.params.storeId);
    if (store) {
        const item = store.items.find(i => i.id === req.params.itemId);
        if (item) {
            item.name = req.body.name;
            item.purchased = req.body.purchased;
            res.json(item);
        } else {
            res.status(404).send('Item not found');
        }
    } else {
        res.status(404).send('Store not found');
    }
});

// Tétel törlése egy üzeletből
app.delete('/api/stores/:storeId/items/:itemId', (req, res) => {
    const store = stores.find(s => s.id === req.params.storeId);
    if (store) {
        store.items = store.items.filter(i => i.id !== req.params.itemId);
        res.json({ success: true });
    } else {
        res.status(404).send('Store not found');
    }
});

// Üzletek mentése fájlba
app.post('/api/stores/save', (req, res) => {
    fs.writeFile(DATA_FILE, JSON.stringify(stores, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Hiba a fájl mentésekor:', err);
            return res.status(500).json({ error: 'Hiba a fájl mentésekor' });
        }
        res.json({ success: true, message: 'Adatok sikeresen mentve' });
    });
});

// Üzletek betöltése fájlból
app.post('/api/stores/load', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Hiba a fájl beolvasásakor:', err);
            return res.status(500).json({ error: 'Hiba a fájl beolvasásakor' });
        }
        try {
            stores = JSON.parse(data);
            res.json({ success: true, message: 'Adatok sikeresen betöltve', stores });
        } catch (parseError) {
            console.error('Hiba a JSON feldolgozásakor:', parseError);
            res.status(500).json({ error: 'Hiba a JSON feldolgozásakor' });
        }
    });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
