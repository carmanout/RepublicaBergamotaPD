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
let currentSort = 'default';
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
                // Solo mostrar el nombre, sin avatar
                const nameText = document.createElement('span');
                nameText.className = 'player-name-text';
                nameText.textContent = cell;
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

/**
 * Ordena los datos según el criterio actual
 */
function sortData(data) {
    const sorted = [...data];
    
    switch (currentSort) {
        case 'puntos-desc':
            // Asumimos que la segunda columna es puntos (índice 1)
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
            
        case 'nombre':
            sorted.sort((a, b) => {
                const aName = (a[0] || '').toString().toLowerCase();
                const bName = (b[0] || '').toString().toLowerCase();
                return aName.localeCompare(bName);
            });
            break;
            
        case 'default':
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
