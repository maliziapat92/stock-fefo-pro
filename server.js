const express = require('express');
const { JSONFilePreset } = require('lowdb/node');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

async function getDb() {
    return await JSONFilePreset(path.join(__dirname, 'db.json'), { produits: [] });
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/produits', async (req, res) => {
    const db = await getDb();
    res.json(db.data.produits);
});

app.post('/produits', async (req, res) => {
    const db = await getDb();
    const nouveau = { id: Date.now().toString(), ...req.body };
    await db.update(({ produits }) => produits.push(nouveau));
    res.status(201).json(nouveau);
});

app.delete('/produits/:id', async (req, res) => {
    const db = await getDb();
    await db.update(({ produits }) => {
        const index = produits.findIndex(p => p.id === req.params.id);
        if (index !== -1) produits.splice(index, 1);
    });
    res.json({ success: true });
});

// Nouvelle route de nettoyage automatique
app.delete('/nettoyer-perimes', async (req, res) => {
    const db = await getDb();
    const ajd = new Date().toISOString().split('T')[0];
    const restants = db.data.produits.filter(p => p.dateExpiration >= ajd);
    await db.update(data => { data.produits = restants; });
    res.json({ message: "Nettoyage terminé." });
});

app.listen(3050, '0.0.0.0', () => console.log('Serveur Pro actif sur http://127.0.0.1:3050'));
