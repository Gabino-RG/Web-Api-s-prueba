/**
 * CONFIGURACIÓN DE ENDPOINTS
 */
const API_URL = 'http://localhost:3000/api/search';
const TAGS_URL = 'http://localhost:3000/api/tags';

/**
 * ELEMENTOS DEL DOM
 */
const elements = {
    q: document.getElementById('q'),
    category: document.getElementById('category'),
    min: document.getElementById('min'),
    max: document.getElementById('max'),
    tagsInput: document.getElementById('tags'), // El input manual (Arriba)
    tagChips: document.getElementById('tagChips'), // Los chips (Abajo)
    sort: document.getElementById('sort'),
    results: document.getElementById('results'),
    status: document.getElementById('status'),
    pagination: document.getElementById('pagination'),
    btnSearch: document.getElementById('btnSearch'),
    btnClear: document.getElementById('btnClear')
};

// Estado global
let selectedChips = new Set();
let isSearching = false;

/**
 * 1. CARGA INICIAL DE ETIQUETAS
 * Obtiene los tags únicos del servidor y los renderiza como chips
 */
async function initTags() {
    try {
        const res = await fetch(TAGS_URL);
        const tags = await res.json();
        
        elements.tagChips.innerHTML = tags.map(t => `<span class="chip" data-tag="${t}">${t}</span>`).join('');
        
        // Listener para cada chip (Selección múltiple)
        document.querySelectorAll('.chip').forEach(chip => {
            chip.onclick = function() {
                const tag = this.dataset.tag;
                if (selectedChips.has(tag)) {
                    selectedChips.delete(tag);
                    this.classList.remove('active');
                } else {
                    selectedChips.add(tag);
                    this.classList.add('active');
                }
                performSearch(1); // Búsqueda instantánea al picar un chip
            };
        });
    } catch (e) {
        console.error("Error cargando etiquetas dinámicas:", e);
    }
}

/**
 * 2. LÓGICA DE BÚSQUEDA (HÍBRIDA Y SEGURA)
 */
async function performSearch(page = 1) {
    const queryValue = elements.q.value.trim();
    const categoryValue = elements.category.value;
    
    // Unimos los chips seleccionados con lo que el usuario escribió manualmente
    const manualTags = elements.tagsInput.value.split(',').map(t => t.trim()).filter(t => t !== "");
    const combinedTags = [...selectedChips, ...manualTags].join(',');

    /**
     * ADUANA DE SEGURIDAD:
     * Si no hay texto, ni categoría, ni tags, limpiamos la UI y no llamamos al servidor.
     */
    if (!queryValue && !categoryValue && !combinedTags) {
        elements.results.innerHTML = '<p class="placeholder">✨ Selecciona un filtro o escribe algo para buscar.</p>';
        elements.status.innerText = '';
        elements.pagination.innerHTML = '';
        return; 
    }

    if (isSearching) return;
    isSearching = true;
    elements.status.innerText = '⏳ Buscando...';

    // Construcción de la URL con parámetros
    const params = new URLSearchParams({
        page,
        limit: 4,
        q: queryValue,
        category: categoryValue,
        min: elements.min.value,
        max: elements.max.value,
        tags: combinedTags,
        sort: elements.sort.value
    });

    try {
        const response = await fetch(`${API_URL}?${params}`);
        const data = await response.json();
        
        renderResults(data.items);
        renderPagination(data);
        
        elements.status.innerText = data.total === 0 
            ? '😕 No se encontraron resultados para esta combinación.' 
            : `✅ Página ${data.page} de ${data.totalPages} (${data.total} resultados)`;

    } catch (err) {
        console.error(err);
        elements.status.innerText = '❌ Error: No se pudo conectar con el servidor.';
    } finally {
        isSearching = false;
    }
}

/**
 * 3. DIBUJAR RESULTADOS EN PANTALLA
 */
function renderResults(items) {
    if (items.length === 0) {
        elements.results.innerHTML = '<p class="placeholder">Intenta ajustando los filtros.</p>';
        return;
    }

    elements.results.innerHTML = items.map(item => `
        <article class="item">
            <header>
                <h3>${item.title}</h3>
                <span class="price">$${item.price.toLocaleString()}</span>
            </header>
            <p>${item.description}</p>
            <div class="tags">
                ${item.tags.map(t => `<span class="tag-badge">${t}</span>`).join('')}
                <span class="tag-badge category">${item.category}</span>
            </div>
        </article>
    `).join('');
}

/**
 * 4. RENDERIZADO DE LA PAGINACIÓN
 */
function renderPagination(data) {
    elements.pagination.innerHTML = '';
    if (data.totalPages <= 1) return;

    const createBtn = (text, targetPage, isDisabled) => {
        const btn = document.createElement('button');
        btn.className = 'btn secondary';
        btn.innerText = text;
        btn.disabled = isDisabled;
        btn.onclick = () => {
            performSearch(targetPage);
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Regresar arriba al cambiar página
        };
        return btn;
    };

    elements.pagination.appendChild(createBtn('← Anterior', data.page - 1, data.page === 1));
    elements.pagination.appendChild(createBtn('Siguiente →', data.page + 1, data.page === data.totalPages));
}

/**
 * 5. REINICIO TOTAL
 */
function clearAll() {
    elements.q.value = '';
    elements.category.value = '';
    elements.min.value = '';
    elements.max.value = '';
    elements.tagsInput.value = '';
    elements.sort.value = 'relevance';

    selectedChips.clear();
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));

    elements.results.innerHTML = '<p class="placeholder">✨ Sistema listo para buscar.</p>';
    elements.status.innerText = '';
    elements.pagination.innerHTML = '';
}

/**
 * EVENT LISTENERS
 */
elements.btnSearch.onclick = () => performSearch(1);
elements.btnClear.onclick = clearAll;

// Buscar al presionar Enter en el buscador principal
elements.q.onkeypress = (e) => { if (e.key === 'Enter') performSearch(1); };

// Buscar automáticamente al cambiar filtros de selección
elements.category.onchange = () => performSearch(1);
elements.sort.onchange = () => performSearch(1);

// Búsqueda "inteligente" en el input manual de tags (detecta comas)
elements.tagsInput.oninput = (e) => {
    if (e.target.value.includes(',')) performSearch(1);
};

// Iniciar carga de etiquetas al abrir la página
initTags();