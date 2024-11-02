const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

let stores = [];

// Üzletek lekérése
app.get('/api/stores', (req, res) => {
    res.json(stores);
});

// Üzlet lekérdezése
app.get('/api/stores/:id', (req, res) => {
    const store = stores.find(s => s.id === req.params.id);
    if (store) {
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
        const item = {
            id: Date.now().toString(),
            name: req.body.name,
            purchased: false
        };
        store.items.push(item);
        res.json(item);
    } else {
        res.status(404).send('Store not found');
    }
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

// Tétel törlése egy üzletből
app.delete('/api/stores/:storeId/items/:itemId', (req, res) => {
    const store = stores.find(s => s.id === req.params.storeId);
    if (store) {
        store.items = store.items.filter(i => i.id !== req.params.itemId);
        res.json({ success: true });
    } else {
        res.status(404).send('Store not found');
    }
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
