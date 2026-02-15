const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const dataPath = path.join(__dirname, 'data.json');
const items = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Endpoint para que el front sepa qué etiquetas existen
app.get('/api/tags', (req, res) => {
    const allTags = items.flatMap(item => item.tags);
    const uniqueTags = [...new Set(allTags)].sort();
    res.json(uniqueTags);
});

app.get('/api/search', (req, res) => {
    let { q, category, min, max, tags, sort, page = 1, limit = 4 } = req.query;
    let results = [...items];

    // Lógica de Relevancia (Score)
    if (q) {
        const query = q.toLowerCase().trim();
        results = results.map(item => {
            let score = 0;
            if (item.title.toLowerCase().includes(query)) score += 10;
            if (item.description.toLowerCase().includes(query)) score += 5;
            if (item.tags.some(t => t.toLowerCase().includes(query))) score += 2;
            return { ...item, score };
        }).filter(item => item.score > 0);
    } else {
        results = results.map(item => ({ ...item, score: 0 }));
    }

    // Filtro de Tags
    if (tags) {
        const tagList = tags.toLowerCase().split(',');
        results = results.filter(item => item.tags.some(t => tagList.includes(t.toLowerCase())));
    }

    if (category) results = results.filter(item => item.category === category);
    if (min) results = results.filter(item => item.price >= parseFloat(min));
    if (max) results = results.filter(item => item.price <= parseFloat(max));

    // Ordenamiento
    if (!sort || sort === 'relevance') results.sort((a, b) => b.score - a.score);
    else if (sort === 'price_asc') results.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') results.sort((a, b) => b.price - a.price);
    else if (sort === 'newest') results.sort((a, b) => new Date(b.date) - new Date(a.date));

    const total = results.length;
    const p = parseInt(page);
    const l = parseInt(limit);
    const totalPages = Math.ceil(total / l) || 1;
    res.json({ total, page: p, totalPages, items: results.slice((p-1)*l, p*l) });
});

app.listen(PORT, () => console.log(`🚀 Server en http://localhost:${PORT}`));