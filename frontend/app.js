const API_URL = 'http://localhost:3000/api/search';
const elements = {
    q: document.getElementById('q'), category: document.getElementById('category'),
    min: document.getElementById('min'), max: document.getElementById('max'),
    sort: document.getElementById('sort'), results: document.getElementById('results'),
    status: document.getElementById('status'), btnSearch: document.getElementById('btnSearch'),
    btnClear: document.getElementById('btnClear'), pagination: document.getElementById('pagination')
};

async function performSearch(page = 1) {
    elements.status.innerText = 'Buscando...';
    const params = new URLSearchParams({
        page, limit: 4, q: elements.q.value, category: elements.category.value,
        min: elements.min.value, max: elements.max.value, sort: elements.sort.value
    });

    try {
        const response = await fetch(`${API_URL}?${params}`);
        const data = await response.json();
        renderResults(data.items);
        renderPagination(data);
        elements.status.innerText = `Página ${data.page} de ${data.totalPages} (${data.total} resultados)`;
    } catch (err) {
        elements.status.innerText = 'Error de conexión';
    }
}

function renderResults(items) {
    if (items.length === 0) {
        elements.results.innerHTML = '<p class="placeholder">Sin coincidencias.</p>';
        return;
    }
    elements.results.innerHTML = items.map(item => `
        <article class="item">
            <header><h3>${item.title}</h3><span class="price">$${item.price.toLocaleString()}</span></header>
            <p style="color:var(--text-secondary)">${item.description}</p>
            <div>${item.tags.map(t => `<span class="tag-badge">${t}</span>`).join('')}</div>
        </article>
    `).join('');
}

function renderPagination(data) {
    elements.pagination.innerHTML = '';
    if (data.totalPages <= 1) return;
    const btn = (t, p, d) => {
        const b = document.createElement('button');
        b.className = 'btn secondary'; b.innerText = t; b.disabled = d;
        b.onclick = () => performSearch(p); return b;
    };
    elements.pagination.appendChild(btn('← Anterior', data.page - 1, data.page === 1));
    elements.pagination.appendChild(btn('Siguiente →', data.page + 1, data.page === data.totalPages));
}

elements.btnSearch.onclick = () => performSearch(1);
elements.btnClear.onclick = () => {
    [elements.q, elements.category, elements.min, elements.max].forEach(i => i.value = '');
    elements.sort.value = 'relevance';
    elements.results.innerHTML = '<p class="placeholder">Ingresa un término.</p>';
    elements.status.innerText = ''; elements.pagination.innerHTML = '';
};