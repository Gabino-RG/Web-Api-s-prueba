async function runTests() {
    const reportContainer = document.getElementById('testReport');
    const resultsList = document.getElementById('testResultsList');
    const TEST_API = 'http://localhost:3000/api/search';
    
    reportContainer.style.display = 'block';
    resultsList.innerHTML = '<p style="text-align:center;">⏳ Consultando API en tiempo real...</p>';

    const testCases = [
        { id: 1, name: "Búsqueda Relevante", url: `${TEST_API}?q=arduino`, check: (d) => d.items[0].title.includes("Arduino") },
        { id: 2, name: "Búsqueda Vacía", url: `${TEST_API}?q=`, check: (d) => d.items.length > 0 },
        { id: 3, name: "Solo Espacios", url: `${TEST_API}?q=%20%20%20`, check: (d) => d.items.length > 0 },
        { id: 4, name: "Case Insensitive", url: `${TEST_API}?q=RASPBERRY`, check: (d) => d.items.some(i => i.title.toLowerCase().includes("raspberry")) },
        { id: 5, name: "Filtro Combinado", url: `${TEST_API}?q=web&category=Educación`, check: (d) => d.items.every(i => i.category === "Educación") },
        { id: 6, name: "Selección de Chips", url: `${TEST_API}?tags=ia,seguridad`, check: (d) => d.items.some(i => i.tags.includes("ia") || i.tags.includes("seguridad")) },
        { id: 7, name: "Rango de Precios", url: `${TEST_API}?min=100&max=500`, check: (d) => d.items.every(i => i.price >= 100 && i.price <= 500) },
        { id: 8, name: "Ordenamiento (Newest)", url: `${TEST_API}?sort=newest`, check: (d) => d.items.length > 1 ? new Date(d.items[0].date) >= new Date(d.items[1].date) : true },
        { id: 9, name: "Paginación (Page 2)", url: `${TEST_API}?page=2&limit=4`, check: (d) => d.page === 2 },
        { id: 10, name: "Sin Resultados", url: `${TEST_API}?q=xbox`, check: (d) => d.total === 0 }
    ];

    let htmlResults = "";
    let passedCount = 0;

    for (const test of testCases) {
        try {
            // Aquí ocurre la magia real: Fetch al servidor
            const res = await fetch(test.url);
            const data = await res.json();
            
            // Verificamos matemáticamente el resultado
            const isOk = test.check(data);
            if (isOk) passedCount++;

            // Log para que el Scrum Master vea que sí hay datos
            console.log(`Test #${test.id} [${test.name}]:`, isOk ? "✅ OK" : "❌ ERROR", data);
            
            htmlResults += `
                <div class="test-item-report">
                    <span><strong>${test.id}.</strong> ${test.name}</span>
                    <span class="${isOk ? 'test-pass' : 'test-fail'}">${isOk ? 'PASÓ' : 'FALLÓ'}</span>
                </div>
            `;
        } catch (err) {
            console.error(`Error en Test #${test.id}:`, err);
            htmlResults += `<div class="test-item-report"><span>${test.id}. ${test.name}</span> <span class="test-fail">ERROR API</span></div>`;
        }
    }

    // Efecto Confeti
    if (passedCount === 10 && typeof confetti === 'function') {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#3b9eff', '#2ecc71'] });
    }

    resultsList.innerHTML = htmlResults + `
        <div style="margin-top:15px; padding-top:10px; border-top: 1px solid var(--border); text-align:center;">
            <p style="font-weight:bold; color: ${passedCount === 10 ? 'var(--success)' : '#e74c3c'}">
                SISTEMA VALIDADO: ${passedCount}/10 EXITOSAS
            </p>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btnRunTests');
    if (btn) btn.onclick = runTests;
});