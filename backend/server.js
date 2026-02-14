const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const dataPath = path.join(__dirname, 'data.json');
const items = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

app.get('/api/search', (req, res) => {
    let { q, category, min, max, sort, page = 1, limit = 4 } = req.query;
    let results = [...items];

    if (q) {
        const query = q.toLowerCase().trim();
        results = results.filter(item => 
            item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.tags.some(t => t.toLowerCase().includes(query))
        );
    }

    if (category) results = results.filter(item => item.category === category);
    if (min) results = results.filter(item => item.price >= parseFloat(min));
    if (max) results = results.filter(item => item.price <= parseFloat(max));

    if (sort === 'price_asc') results.sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') results.sort((a, b) => b.price - a.price);
    if (sort === 'newest') results.sort((a, b) => new Date(b.date) - new Date(a.date));

    const total = results.length;
    const p = parseInt(page);
    const l = parseInt(limit);
    const totalPages = Math.ceil(total / l) || 1;
    const paginatedItems = results.slice((p - 1) * l, p * l);

    res.json({ total, page: p, totalPages, items: paginatedItems });
});

app.listen(PORT, () => console.log(`🚀 API en puerto ${PORT}`));