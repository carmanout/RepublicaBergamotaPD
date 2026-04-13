// ================== MODAL CREAR PARTIDA Y EQUIPOS =====================

function ensureModalPartida() {
    // Ya está en el HTML, solo inicializar listeners
    const modal = document.getElementById('modal-partida');
    if (!modal) return;
    // Cerrar modal
    document.getElementById('modal-partida-close').onclick = closeModalPartida;
    modal.querySelector('.modal-partida-backdrop').onclick = closeModalPartida;
    // Submit form
    document.getElementById('form-jugadores').onsubmit = function(e) {
        e.preventDefault();
        generarEquiposDesdeSeleccion();
    };
}

function openModalPartida() {
    ensureModalPartida();
    const modal = document.getElementById('modal-partida');
    if (!modal) return;
    document.getElementById('equipos-resultados').style.display = 'none';
    document.getElementById('equipos-resultados').innerHTML = '';
    document.getElementById('modal-partida-error').style.display = 'none';
    renderListaJugadoresSeleccion();
    modal.style.display = 'flex';
}

function closeModalPartida() {
    const modal = document.getElementById('modal-partida');
    if (modal) modal.style.display = 'none';
}

function renderListaJugadoresSeleccion(filtro = '') {
    const listaDiv = document.getElementById('jugadores-lista');
    if (!listaDiv) return;
    listaDiv.innerHTML = '';
    // Guardar los seleccionados actuales
    const seleccionados = Array.from(document.querySelectorAll('.jugador-checkbox:checked')).map(cb => cb.value);
    // allData: cada fila [nombre, puntos, ...]
    let jugadores = allData.map(row => ({
        nombre: row[0],
        puntos: parseFloat(row[1]) || 0
    }));
    if (filtro) {
        const f = filtro.trim().toLowerCase();
        jugadores = jugadores.filter(j => j.nombre.toLowerCase().includes(f));
    }
    jugadores.sort((a, b) => b.puntos - a.puntos);
    jugadores.forEach((jug, idx) => {
        const id = 'jugador-checkbox-' + idx;
        const label = document.createElement('label');
        label.className = 'jugador-checkbox-label';
        label.htmlFor = id;
        // Mostrar puntos con 2 decimales, sin espacio entre número y paréntesis
        const puntosStr = jug.puntos.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        // checked si está en seleccionados
        const checked = seleccionados.includes(jug.nombre) ? 'checked' : '';
        label.innerHTML = `<input type="checkbox" class="jugador-checkbox" id="${id}" name="jugadores" value="${jug.nombre}" ${checked}><span style='white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:100%;display:inline-block;'><span style='vertical-align:middle;'>${jug.nombre}</span><span style='color:#00d4ff;font-size:0.95em;vertical-align:middle;'>(\u00A0${puntosStr})</span></span>`;
        label.style.width = '100%';
        label.style.flex = '1 1 100%';
        // Marcar visualmente si está seleccionado
        if (checked) label.classList.add('selected');
        label.onclick = function(e) {
            // Toggle visual
            if (e.target.tagName === 'INPUT') {
                setTimeout(() => {
                    label.classList.toggle('selected', e.target.checked);
                }, 10);
            }
        };
        listaDiv.appendChild(label);
    });
}

function generarEquiposDesdeSeleccion() {
    const checkboxes = document.querySelectorAll('.jugador-checkbox:checked');
    const seleccionados = Array.from(checkboxes).map(cb => cb.value);
    const errorDiv = document.getElementById('modal-partida-error');
    if (seleccionados.length !== 10) {
        errorDiv.style.display = '';
        errorDiv.textContent = 'Debes seleccionar exactamente 10 jugadores para crear equipos.';
        document.getElementById('equipos-resultados').style.display = 'none';
        return;
    }
    errorDiv.style.display = 'none';
    // Obtener datos de los seleccionados
    const jugadoresSel = allData.filter(row => seleccionados.includes(row[0]))
        .map(row => ({ nombre: row[0], puntos: parseFloat(row[1]) || 0 }));

    // Algoritmo: aleatorio con diferencia máxima de 10, aumentando cada 5s
    let maxDiff = 10;
    let found = false;
    let equipoA = [], equipoB = [], sumaA = 0, sumaB = 0;
    let startTime = Date.now();
    let intentos = 0;
    const maxTime = 60000; // 1 minuto máximo para evitar bucles infinitos
    const equiposResultadosDiv = document.getElementById('equipos-resultados');
    equiposResultadosDiv.style.display = 'none';

    function intentarGenerar() {
        intentos++;
        // Generar permutación aleatoria
        const mezclados = jugadoresSel.slice().sort(() => Math.random() - 0.5);
        const a = mezclados.slice(0, 5);
        const b = mezclados.slice(5, 10);
        const sumaA_ = a.reduce((acc, j) => acc + j.puntos, 0);
        const sumaB_ = b.reduce((acc, j) => acc + j.puntos, 0);
        const dif = Math.abs(sumaA_ - sumaB_);
        if (dif <= maxDiff) {
            equipoA = a;
            equipoB = b;
            sumaA = sumaA_;
            sumaB = sumaB_;
            found = true;
            mostrarEquiposGenerados(equipoA, equipoB, sumaA, sumaB);
            return;
        }
        // Si no se encuentra, seguir intentando
        if (!found && (Date.now() - startTime < 5000)) {
            setTimeout(intentarGenerar, 0); // Siguiente intento inmediato
        } else if (!found && (Date.now() - startTime >= 5000)) {
            // Aumentar el rango y reiniciar tiempo
            maxDiff += 10;
            startTime = Date.now();
            // Mostrar mensaje de que se aumenta el rango
            errorDiv.style.display = '';
            errorDiv.textContent = `No se encontró combinación con diferencia ≤ ${maxDiff - 10}. Aumentando el rango a ${maxDiff} puntos...`;
            setTimeout(intentarGenerar, 0);
        } else if (!found && (Date.now() - startTime > maxTime)) {
            errorDiv.style.display = '';
            errorDiv.textContent = 'No se pudo encontrar una combinación adecuada.';
        }
    }
    intentarGenerar();
}

function mostrarEquiposGenerados(equipoA, equipoB, sumaA, sumaB) {
    const div = document.getElementById('equipos-resultados');
    div.style.display = '';
    const colorA = '#00d4ff', colorB = '#ff3f04';
    let html = `<div style='display:flex;gap:2em;justify-content:center;flex-wrap:wrap;'>`;
    html += `<div><h3 style='color:${colorA};margin-bottom:0.5em;'>Equipo A</h3><ul style='list-style:none;padding:0;'>`;
    equipoA.forEach(j => {
        html += `<li>${j.nombre} <span style='color:#aaa;font-size:0.95em;'>( ${j.puntos} )</span></li>`;
    });
    html += `</ul><div style='margin-top:0.7em;font-weight:bold;'>Total: <span style='color:${colorA};'>${sumaA.toLocaleString('es-ES', {maximumFractionDigits:2})}</span></div></div>`;
    html += `<div><h3 style='color:${colorB};margin-bottom:0.5em;'>Equipo B</h3><ul style='list-style:none;padding:0;'>`;
    equipoB.forEach(j => {
        html += `<li>${j.nombre} <span style='color:#aaa;font-size:0.95em;'>( ${j.puntos} )</span></li>`;
    });
    html += `</ul><div style='margin-top:0.7em;font-weight:bold;'>Total: <span style='color:${colorB};'>${sumaB.toLocaleString('es-ES', {maximumFractionDigits:2})}</span></div></div>`;
    html += `</div>`;
    // Diferencia
    const dif = Math.abs(sumaA - sumaB);
    html += `<div style='margin-top:1.5em;font-size:1.1em;'>Diferencia de puntos: <span style='color:${dif < 10 ? '#00ffb2' : '#ff5555'};'>${dif.toLocaleString('es-ES', {maximumFractionDigits:2})}</span></div>`;
    div.innerHTML = html;
}
// Inicializar botón y modal de crear partida al cargar datos
function setupCrearPartidaBtn() {
    const btn = document.getElementById('crear-partida-btn');
    if (btn) {
        btn.onclick = openModalPartida;
    }
    ensureModalPartida();
}
/**
 * Puntos de Destreza - Google Sheets Integration
 * Carga datos en tiempo real desde Google Sheets
 */

// =============================================================================
// Configuration
// =============================================================================

// Google Sheets Configuration
const SHEET_ID = '1cSlIRsbVTvSKKWCe_28wpMeAwkAQa5k9edWzDgpQ9Ak';
const SHEET_NAME = 'PTS DESTREZA';
const HEADER_RANGE = 'B2:G2';
const DATA_RANGE = 'B3:G'; // Sin límite, carga todas las filas con datos

// API Configuration
const API_KEY = ''; // Opcional: añade tu API key de Google Cloud Console para mayor fiabilidad

// Refresh interval in milliseconds (300 seconds)
const REFRESH_INTERVAL = 3000000;

// =============================================================================
// State
// =============================================================================

let allData = [];
let headers = [];
let currentSort = 'puntos-desc'; // Por defecto: puntos descendente
let searchTerm = '';
let refreshTimer = null;

// =============================================================================
// DOM Elements
// =============================================================================

const elements = {
    loadingState: document.getElementById('loading-state'),
    errorState: document.getElementById('error-state'),
    errorMessage: document.getElementById('error-message'),
    tableContainer: document.getElementById('table-container'),
    emptyState: document.getElementById('empty-state'),
    tableHeader: document.getElementById('table-header'),
    tableBody: document.getElementById('table-body'),
    searchInput: document.getElementById('search-input'),
    refreshBtn: document.getElementById('refresh-btn'),
    retryBtn: document.getElementById('retry-btn'),
    totalJugadores: document.getElementById('total-jugadores'),
    ultimaActualizacion: document.getElementById('ultima-actualizacion'),
    sortButtons: document.querySelectorAll('.sort-btn')
};

// =============================================================================
// Google Sheets API Functions
// =============================================================================

/**
 * Construye la URL de la API de Google Sheets
 * Usa el método de publicación CSV para acceso público sin API key
 */
function getSheetUrl() {
    // Método 1: Usar la API de Google Sheets con formato JSON
    // Nota: La hoja debe estar publicada como "Web" o ser pública
    return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}&range=${DATA_RANGE}`;
}

/**
 * Construye la URL para obtener solo los headers
 */
function getHeadersUrl() {
    return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}&range=${HEADER_RANGE}`;
}

/**
 * Parsea la respuesta de la API de Google Visualization
 * La respuesta viene en un formato especial que necesita limpieza
 */
function parseGoogleResponse(responseText) {
    // La respuesta viene envuelta en un callback, necesitamos extraer el JSON
    const match = responseText.match(/google\.visualization\.Query\.setResponse\((.*)\);?$/s);
    if (!match) {
        throw new Error('Formato de respuesta inválido');
    }
    return JSON.parse(match[1]);
}

/**
 * Extrae los datos de la respuesta parseada
 */
function extractDataFromResponse(data) {
    if (!data.table || !data.table.rows) {
        return [];
    }
    
    return data.table.rows.map(row => {
        return row.c.map(cell => cell ? (cell.v || '') : '');
    });
}

/**
 * Extrae los headers de la respuesta parseada
 */
function extractHeadersFromResponse(data) {
    if (!data.table || !data.table.cols) {
        return [];
    }
    
    return data.table.cols.map(col => col.label || '');
}

// =============================================================================
// Data Loading
// =============================================================================

/**
 * Carga los datos desde Google Sheets
 */
async function loadData() {
    showLoading();
    
    try {
        // Cargar headers y datos en paralelo
        const [headersResponse, dataResponse] = await Promise.all([
            fetch(getHeadersUrl()),
            fetch(getSheetUrl())
        ]);
        
        if (!headersResponse.ok || !dataResponse.ok) {
            throw new Error('Error al conectar con Google Sheets');
        }
        
        const headersText = await headersResponse.text();
        const dataText = await dataResponse.text();
        
        const headersData = parseGoogleResponse(headersText);
        const sheetData = parseGoogleResponse(dataText);
        
        // headers = extractHeadersFromResponse(headersData);
        headers = [
            'JUGADOR',
            'Pts. DESTREZA',
            'Nº Partidas',
            'Victorias',
            'Derrotas',
            'WINRATE'
        ];
        allData = extractDataFromResponse(sheetData);
        
        // Filtrar filas vacías
        allData = allData.filter(row => row.some(cell => cell !== ''));
        
        if (allData.length === 0) {
            showEmpty();
        } else {
            renderTable();
            showTable();
        }
        setupCrearPartidaBtn();
        
        updateStats();
        updateLastRefreshTime();
        
    } catch (error) {
        console.error('Error cargando datos:', error);
        showError(error.message);
    }
}

/**
 * Método alternativo usando CSV (más simple pero menos flexible)
 * Este método funciona si la hoja está publicada como CSV
 */
async function loadDataCSV() {
    showLoading();
    
    try {
        // Intentar cargar como CSV publicado
        const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&sheet=${encodeURIComponent(SHEET_NAME)}`;
        
        const response = await fetch(csvUrl);
        
        if (!response.ok) {
            throw new Error('No se pudo acceder a la hoja. Verifica que esté publicada.');
        }
        
        const csvText = await response.text();
        const parsed = parseCSV(csvText);
        
        // Extraer headers de la fila 1 (índice 0) y filtrar columnas B-G (índices 1-6)
        if (parsed.length > 0) {
            // La primera fila contiene los headers
            const allHeaders = parsed[0];
            headers = allHeaders.slice(1, 7); // Columnas B a G
            
            // El resto son datos, empezando desde la fila 3 (índice 2 en el array original)
            // Pero como ya quitamos la primera fila, empezamos desde índice 1
            allData = parsed.slice(2).map(row => row.slice(1, 7));
            
            // Filtrar filas vacías
            allData = allData.filter(row => row.some(cell => cell && cell.toString().trim() !== ''));
        }
        
        if (allData.length === 0) {
            showEmpty();
        } else {
            renderTable();
            showTable();
        }
        
        updateStats();
        updateLastRefreshTime();
        
    } catch (error) {
        console.error('Error con método CSV:', error);
        // Intentar con el método de la API
        await loadData();
    }
}

/**
 * Parsea un CSV simple
 */
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    return lines.map(line => {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }).filter(row => row.length > 0);
}

// =============================================================================
// Rendering
// =============================================================================

/**
 * Renderiza la tabla con los datos actuales
 */
function renderTable() {
    // Filtrar datos según búsqueda
    let filteredData = allData;
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredData = allData.filter(row => 
            row.some(cell => cell.toString().toLowerCase().includes(term))
        );
    }
    
    // Ordenar datos
    filteredData = sortData(filteredData);
    
    // Renderizar headers
    renderHeaders();
    
    // Renderizar filas
    renderRows(filteredData);
}

/**
 * Renderiza los headers de la tabla
 */
function renderHeaders() {
    elements.tableHeader.innerHTML = '';
    
    // Columna de ranking
    const rankTh = document.createElement('th');
    rankTh.textContent = '#';
    elements.tableHeader.appendChild(rankTh);
    
    // Headers del sheet
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        elements.tableHeader.appendChild(th);
    });
}

/**
 * Renderiza las filas de datos
 */
function renderRows(data) {
    elements.tableBody.innerHTML = '';
    
    if (data.length === 0) {
        elements.emptyState.style.display = 'flex';
        return;
    } else {
        elements.emptyState.style.display = 'none';
    }
    
    data.forEach((row, index) => {
        const tr = document.createElement('tr');

        // Celda de ranking
        const rankTd = document.createElement('td');
        const rankBadge = document.createElement('span');
        rankBadge.className = 'rank-badge';

        const rank = index + 1;
        if (rank === 1) {
            rankBadge.classList.add('rank-1');
        } else if (rank === 2) {
            rankBadge.classList.add('rank-2');
        } else if (rank === 3) {
            rankBadge.classList.add('rank-3');
        } else {
            rankBadge.classList.add('rank-other');
        }

        rankBadge.textContent = rank;
        rankTd.appendChild(rankBadge);
        tr.appendChild(rankTd);

        // Celdas de datos
        row.forEach((cell, cellIndex) => {
            const td = document.createElement('td');
            const headerText = headers[cellIndex] || '';
            const isNameColumn = cellIndex === 0;
            const isWinrateColumn = headerText.trim().toLowerCase() === 'winrate';
            const isPointsColumn = headerText.toLowerCase().includes('punto') || 
                                   headerText.toLowerCase().includes('pts') ||
                                   (!isNaN(parseFloat(cell)) && isFinite(cell));

            // Valor procesado según reglas
            let displayValue = cell;
            if (isNameColumn) {
                // Mostrar el nombre como botón clickable
                const nameText = document.createElement('span');
                nameText.className = 'player-name-text player-modal-trigger';
                nameText.textContent = cell;
                nameText.style.cursor = 'pointer';
                nameText.addEventListener('click', () => {
                    openPlayerModal(cell);
                });
                td.appendChild(nameText);
            } else if (isWinrateColumn) {
                // Winrate: mostrar como porcentaje
                let num = parseFloat(cell);
                if (cell === '0' || cell === 0 || num === 0) {
                    td.className = 'points-cell';
                    td.textContent = '0%';
                } else if (isNaN(num)) {
                    td.className = 'stat-cell';
                    td.textContent = '0';
                } else {
                    // Si el valor es 0-1, multiplicar por 100
                    if (num <= 1 && num >= 0) {
                        num = num * 100;
                    }
                    td.className = 'points-cell';
                    td.textContent = num.toLocaleString('es-ES', { maximumFractionDigits: 2 }) + '%';
                }
            } else if (isPointsColumn) {
                let num = parseFloat(cell);
                if (cell === '0' || cell === 0 || num === 0) {
                    td.className = 'points-cell';
                    td.textContent = '0';
                } else if (isNaN(num)) {
                    td.className = 'stat-cell';
                    td.textContent = '0';
                } else {
                    td.className = 'points-cell';
                    td.textContent = formatNumber(cell);
                }
            } else {
                // Otras columnas
                let num = parseFloat(cell);
                if (cell === '0' || cell === 0 || num === 0) {
                    td.className = 'stat-cell';
                    td.textContent = '0';
                } else if (isNaN(num)) {
                    td.className = 'stat-cell';
                    td.textContent = '0';
                } else {
                    td.className = 'stat-cell';
                    td.textContent = cell;
                }
            }

            tr.appendChild(td);
        });

        elements.tableBody.appendChild(tr);
    });
}

// ================= MODAL JUGADOR =====================

// Crea el modal en el DOM si no existe
function ensurePlayerModal() {
    if (document.getElementById('player-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'player-modal';
    modal.className = 'player-modal';
    modal.innerHTML = `
        <div class="player-modal-backdrop"></div>
        <div class="player-modal-content">
            <button class="player-modal-close">&times;</button>
            <div class="player-modal-body" style="display:flex;gap:2rem;align-items:flex-start;">
                <div style="flex:2;min-width:220px">
                    <div class="player-modal-loading">Cargando datos del jugador...</div>
                    <div class="player-modal-error" style="display:none;color:#ff5555"></div>
                    <div class="player-modal-info" style="display:none"></div>
                </div>
                <div class="player-modal-chart" style="flex:1;min-width:220px;max-width:320px;display:flex;flex-direction:column;align-items:center;">
                    <canvas id="playerPieChart" width="220" height="220" style="background:transparent;"></canvas>
                    <div id="playerPieLegend" style="margin-top:1.2rem;width:100%;display:flex;flex-wrap:wrap;justify-content:center;gap:0.7rem;"></div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    // Cerrar modal al hacer click en backdrop o botón
    modal.querySelector('.player-modal-backdrop').addEventListener('click', closePlayerModal);
    modal.querySelector('.player-modal-close').addEventListener('click', closePlayerModal);
}

function openPlayerModal(playerName) {
    ensurePlayerModal();
    const modal = document.getElementById('player-modal');
    modal.style.display = 'flex';
    // Limpiar estados
    modal.querySelector('.player-modal-loading').style.display = '';
    modal.querySelector('.player-modal-error').style.display = 'none';
    modal.querySelector('.player-modal-info').style.display = 'none';
    // Cargar datos del jugador
    fetchPlayerSheet(playerName)
        .then(playerData => {
            renderPlayerModalInfo(playerName, playerData);
        })
        .catch(err => {
            modal.querySelector('.player-modal-loading').style.display = 'none';
            modal.querySelector('.player-modal-error').style.display = '';
            modal.querySelector('.player-modal-error').textContent = err.message || 'Error al cargar datos del jugador';
        });
}

function closePlayerModal() {
    const modal = document.getElementById('player-modal');
    if (modal) modal.style.display = 'none';
}

// Obtiene los datos de la hoja del jugador
async function fetchPlayerSheet(playerName) {
    // El nombre de la hoja es el nombre del jugador en mayúsculas y sin espacios
    const sheetTab = playerName.trim().toUpperCase();
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetTab)}&range=B2:E`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('No se pudo acceder a la hoja del jugador.');
    const text = await response.text();
    const data = parseGoogleResponse(text);
    // Extraer headers y filas
    const headers = data.table.cols.map(col => col.label || '');
    const rows = data.table.rows.map(row => row.c.map(cell => cell ? (cell.v || '') : ''));
    return { headers, rows };
}

function renderPlayerModalInfo(playerName, playerData) {
    const modal = document.getElementById('player-modal');
    modal.querySelector('.player-modal-loading').style.display = 'none';
    modal.querySelector('.player-modal-error').style.display = 'none';
    const infoDiv = modal.querySelector('.player-modal-info');
    infoDiv.style.display = '';
    // Cabeceras fijas
    const fixedHeaders = ['Kill Participation', 'KDA', 'Resultado', 'Rol'];
    let html = `<h2 style="margin-bottom:1rem">${playerName}</h2>`;
    html += '<table class="player-info-table"><thead><tr>';
    fixedHeaders.forEach(h => {
        html += `<th>${h}</th>`;
    });
    html += '</tr></thead><tbody>';
    playerData.rows.forEach(row => {
        html += '<tr>';
        row.forEach((cell, idx) => {
            let display = cell;
            let tdStyle = '';
            // Kill Participation en %
            if (idx === 0) {
                let num = parseFloat(cell);
                if (cell === '' || cell === null || cell === undefined || cell === '0' || num === 0) {
                    display = '0%';
                } else if (!isNaN(num)) {
                    if (num <= 1 && num >= 0) num = num * 100;
                    display = num.toLocaleString('es-ES', { maximumFractionDigits: 2 }) + '%';
                }
            }
            // KDA redondeado a centésimas y coloreado
            else if (idx === 1) {
                let num = parseFloat(cell);
                if (cell === '' || cell === null || cell === undefined || cell === '0' || num === 0) {
                    display = '0';
                    tdStyle = 'background:rgba(255,0,0,0.18);color:#fff;';
                } else if (!isNaN(num)) {
                    display = num.toLocaleString('es-ES', { maximumFractionDigits: 2 });
                    // Color dinámico según valor
                    // Rojo <2, amarillo 2-3, verde >3
                    let r = 255, g = 0, b = 0;
                    if (num < 2) {
                        g = Math.round(60 + 80 * (num/2)); // de 60 a 140
                        b = 60;
                    } else if (num >= 2 && num <= 3) {
                        // Amarillo a verde
                        r = Math.round(255 - 255 * ((num-2)/1)); // 255 a 0
                        g = 200;
                        b = 60;
                    } else if (num > 3) {
                        r = 0;
                        g = 200 + Math.round(55 * Math.min((num-3)/2,1)); // 200 a 255
                        b = 60;
                    }
                    tdStyle = `background:rgba(${r},${g},${b},0.18);color:#fff;`;
                }
            }
            // Resultado traducido y coloreado
            else if (idx === 2) {
                let val = (cell || '').toString().toLowerCase();
                if (val === 'loss' || val === 'derrota') {
                    display = 'Derrota';
                    tdStyle = 'color:#ff5555;font-weight:bold;';
                } else if (val === 'win' || val === 'victoria') {
                    display = 'Victoria';
                    tdStyle = 'color:#00ffb2;font-weight:bold;';
                } else if (!val || val === '0') {
                    display = '0';
                }
            }
            // Otros: si es 0 o vacío, mostrar 0
            else if ((cell === '' || cell === null || cell === undefined || cell === '0') && idx !== 3) {
                display = '0';
            }
            html += `<td style="${tdStyle}">${display}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody></table>';
    infoDiv.innerHTML = html;
    // Pie chart de roles
    setTimeout(() => renderPlayerPieChart(playerData.rows), 0);
}

// Dibuja el gráfico de queso de roles
function renderPlayerPieChart(rows) {
    const canvas = document.getElementById('playerPieChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Contar roles
    const roleIdx = 3; // 4ª columna (Rol)
    const roles = ['jungle', 'mid', 'top', 'supp', 'adc'];
    const colors = ['#008d00', '#5800bd', '#ff3f04', '#0044ff', '#00b8c5'];
    const counts = { jungle: 0, mid: 0, top: 0, supp: 0, adc: 0 };
    rows.forEach(row => {
        const role = (row[roleIdx] || '').toLowerCase();
        if (counts.hasOwnProperty(role)) counts[role]++;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    if (total === 0) return;
    // Calcular ángulos
    let startAngle = -Math.PI/2;
    roles.forEach((role, i) => {
        const value = counts[role];
        if (value === 0) return;
        const percent = value / total;
        const endAngle = startAngle + percent * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(canvas.width/2, canvas.height/2);
        ctx.arc(canvas.width/2, canvas.height/2, 90, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = colors[i];
        ctx.fill();
        // Etiqueta
        const midAngle = (startAngle + endAngle) / 2;
        const labelX = canvas.width/2 + Math.cos(midAngle) * 65;
        const labelY = canvas.height/2 + Math.sin(midAngle) * 65;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 13px Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (percent > 0.08) ctx.fillText(`${Math.round(percent*100)}%`, labelX, labelY);
        startAngle = endAngle;
    });
    // Leyenda debajo del gráfico
    const legendDiv = document.getElementById('playerPieLegend');
    if (legendDiv) {
        legendDiv.innerHTML = '';
        roles.forEach((role, i) => {
            const value = counts[role];
            if (value === 0) return;
            const percent = ((value / total) * 100).toFixed(0);
            const item = document.createElement('span');
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.gap = '0.4em';
            item.innerHTML = `<span style="display:inline-block;width:16px;height:16px;background:${colors[i]};border-radius:3px;"></span><span style="color:#fff;font-size:13px;">${role.toUpperCase()} (${percent}%)</span>`;
            legendDiv.appendChild(item);
        });
    }
}



/**
 * Ordena los datos según el criterio actual
 */
function sortData(data) {
    const sorted = [...data];
    switch (currentSort) {
        case 'puntos-desc':
            // Ordenar por puntos descendente (índice 1)
            sorted.sort((a, b) => {
                const aVal = parseFloat(a[1]) || 0;
                const bVal = parseFloat(b[1]) || 0;
                return bVal - aVal;
            });
            break;
        case 'puntos-asc':
            sorted.sort((a, b) => {
                const aVal = parseFloat(a[1]) || 0;
                const bVal = parseFloat(b[1]) || 0;
                return aVal - bVal;
            });
            break;
        case 'winrate-desc':
            // Ordenar por winrate descendente (índice 5)
            sorted.sort((a, b) => {
                let aVal = parseFloat(a[5]);
                let bVal = parseFloat(b[5]);
                // Si winrate está en 0-1, multiplicar por 100
                if (!isNaN(aVal) && aVal <= 1 && aVal >= 0) aVal = aVal * 100;
                if (!isNaN(bVal) && bVal <= 1 && bVal >= 0) bVal = bVal * 100;
                aVal = isNaN(aVal) ? 0 : aVal;
                bVal = isNaN(bVal) ? 0 : bVal;
                return bVal - aVal;
            });
            break;
        case 'nombre':
            sorted.sort((a, b) => {
                const aName = (a[0] || '').toString().toLowerCase();
                const bName = (b[0] || '').toString().toLowerCase();
                return aName.localeCompare(bName);
            });
            break;
        default:
            // Mantener orden original
            break;
    }
    return sorted;
}

/**
 * Formatea un número con separadores de miles
 */
function formatNumber(num) {
    const n = parseFloat(num);
    if (isNaN(n)) return num;
    return n.toLocaleString('es-ES');
}

// =============================================================================
// UI State Management
// =============================================================================

function showLoading() {
    elements.loadingState.style.display = 'flex';
    elements.errorState.style.display = 'none';
    elements.tableContainer.style.display = 'none';
    elements.emptyState.style.display = 'none';
}

function showError(message) {
    elements.loadingState.style.display = 'none';
    elements.errorState.style.display = 'flex';
    elements.tableContainer.style.display = 'none';
    elements.emptyState.style.display = 'none';
    elements.errorMessage.textContent = message || 'Error desconocido';
}

function showTable() {
    elements.loadingState.style.display = 'none';
    elements.errorState.style.display = 'none';
    elements.tableContainer.style.display = 'block';
    elements.emptyState.style.display = 'none';
}

function showEmpty() {
    elements.loadingState.style.display = 'none';
    elements.errorState.style.display = 'none';
    elements.tableContainer.style.display = 'none';
    elements.emptyState.style.display = 'flex';
}

function updateStats() {
    elements.totalJugadores.textContent = allData.length;
}

function updateLastRefreshTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    elements.ultimaActualizacion.textContent = timeString;
}

// =============================================================================
// Event Handlers
// =============================================================================

function setupEventListeners() {
    // Búsqueda
    elements.searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderTable();
    });
    
    // Botón de actualizar
    elements.refreshBtn.addEventListener('click', () => {
        elements.refreshBtn.classList.add('spinning');
        loadData().then(() => {
            setTimeout(() => {
                elements.refreshBtn.classList.remove('spinning');
            }, 500);
        });
    });
    
    // Botón de reintentar
    elements.retryBtn.addEventListener('click', () => {
        loadData();
    });
    
    // Botones de ordenamiento
    elements.sortButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Actualizar estado activo
            elements.sortButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Aplicar ordenamiento
            currentSort = btn.dataset.sort;
            renderTable();
        });
    });
}

// =============================================================================
// Auto-refresh
// =============================================================================

function startAutoRefresh() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
    }
    
    refreshTimer = setInterval(() => {
        console.log('Actualizando datos automáticamente...');
        loadData();
    }, REFRESH_INTERVAL);
}

function stopAutoRefresh() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
    }
}

// =============================================================================
// Initialization
// =============================================================================

function init() {
    setupEventListeners();
    loadData();
    startAutoRefresh();
    
    // Efecto de decodificación del título
    initDecodeEffect();
}

/**
 * Efecto de decodificación del título (tipo Matrix/cyberpunk)
 */
function initDecodeEffect() {
    const decodeElement = document.querySelector('.decode-text');
    if (!decodeElement) return;
    
    const originalText = decodeElement.dataset.text;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let iteration = 0;
    
    const interval = setInterval(() => {
        decodeElement.textContent = originalText
            .split('')
            .map((char, index) => {
                if (index < iteration) {
                    return originalText[index];
                }
                if (char === ' ') return ' ';
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('');
        
        if (iteration >= originalText.length) {
            clearInterval(interval);
        }
        
        iteration += 1 / 3;
    }, 30);
}

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);

// Pausar auto-refresh cuando la pestaña no está visible
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopAutoRefresh();
    } else {
        startAutoRefresh();
        loadData(); // Recargar al volver
    }
});
