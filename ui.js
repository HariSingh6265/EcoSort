// UI rendering and DOM manipulation module for EcoSort

import { WASTE_CATEGORIES, UPCYCLING_IDEAS } from './data.js';

// Show a temporary sticker-style toast notification
export function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Choose emoji based on type
    let emoji = 'ℹ️';
    if (type === 'success') emoji = '✅';
    if (type === 'warning') emoji = '⚠️';
    if (type === 'error') emoji = '❌';

    toast.innerHTML = `<span style="margin-right: 8px;">${emoji}</span><span>${message}</span>`;
    container.appendChild(toast);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Toggle global loading screen
export function showLoading(text = 'Thinking...') {
    const loader = document.getElementById('loading-overlay');
    if (loader) {
        const textEl = loader.querySelector('.loading-text');
        if (textEl) textEl.textContent = text;
        loader.classList.add('active');
        loader.style.display = 'flex';
    }
}

export function hideLoading() {
    const loader = document.getElementById('loading-overlay');
    if (loader) {
        loader.classList.remove('active');
        loader.style.display = 'none';
    }
}

// Render waste classification results
export function renderResults(categoryKey, matchedLabel, confidence, isFallback, imgDataUrl) {
    const resultsContainer = document.getElementById('results-content');
    if (!resultsContainer) return;

    const category = WASTE_CATEGORIES[categoryKey] || WASTE_CATEGORIES.dry;

    // Get upcycling suggestions
    // Try to match specific label (e.g. "bottle", "cardboard"), otherwise fall back to category suggestions
    let ideas = [];
    const normalizedLabel = matchedLabel.toLowerCase();
    
    // Check if any key in UPCYCLING_IDEAS is contained in the label
    let foundSpecificKey = null;
    for (const key in UPCYCLING_IDEAS) {
        if (normalizedLabel.includes(key)) {
            foundSpecificKey = key;
            break;
        }
    }

    if (foundSpecificKey) {
        ideas = UPCYCLING_IDEAS[foundSpecificKey];
    } else {
        ideas = UPCYCLING_IDEAS[categoryKey] || [];
    }

    // Generate HTML for results
    resultsContainer.innerHTML = `
        <div class="results-grid">
            <!-- Left Side: Image Preview & Label -->
            <div class="sticker-card card-preview">
                <h3 class="card-title">📷 Captured Object</h3>
                <div class="result-image-wrapper">
                    <img src="${imgDataUrl}" alt="Captured waste item" class="result-image">
                </div>
                <div class="result-meta" style="margin-top: 15px;">
                    <div style="font-size: 1.1rem; margin-bottom: 5px;">
                        Identified: <strong class="highlight-text" style="text-transform: capitalize;">${matchedLabel}</strong>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill" style="width: ${confidence}%"></div>
                    </div>
                    <div style="font-size: 0.9rem; color: #555; display: flex; justify-content: space-between; margin-top: 5px;">
                        <span>Confidence: ${confidence}%</span>
                        ${isFallback ? '<span class="tag-fallback">General Mapping</span>' : '<span class="tag-matched">AI Matched</span>'}
                    </div>
                </div>
            </div>

            <!-- Right Side: Mapped Category & Bin Details -->
            <div class="sticker-card card-guidance">
                <h3 class="card-title">♻️ Disposal Guidance</h3>
                
                <div class="category-header-box">
                    <span style="font-size: 0.9rem; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; opacity: 0.8;">Classification</span>
                    <h2 class="category-name">${category.name}</h2>
                </div>

                <!-- India standard bin standard visual -->
                <div class="bin-indicator-box" style="background-color: ${category.binHex}; color: ${category.textColor};">
                    <div class="bin-text-badge">
                        🗑️ DISPOSE IN: ${category.binColor.toUpperCase()} BIN
                    </div>
                </div>

                <div class="guidance-details" style="margin-top: 15px;">
                    <p style="font-size: 1rem; line-height: 1.5; margin-bottom: 12px;"><strong>Instructions:</strong> ${category.instructions}</p>
                    <div class="india-standard-box">
                        <div style="font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: #333; margin-bottom: 4px;">India Waste Standards:</div>
                        <p style="font-size: 0.9rem; color: #444; line-height: 1.4; margin: 0;">${category.indiaStandard}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- DIY Upcycling section -->
        ${ideas.length > 0 ? `
        <div class="sticker-card card-diy" style="margin-top: 25px;">
            <h3 class="card-title">💡 DIY Upcycling Suggestions</h3>
            <p style="margin-bottom: 15px; font-size: 0.95rem; color: #333;">This item looks recyclable! Instead of binning it, try these creative DIY projects:</p>
            <div class="diy-grid">
                ${ideas.map((idea, idx) => `
                    <div class="diy-card">
                        <div class="diy-index">0${idx + 1}</div>
                        <h4 class="diy-title">${idea.title}</h4>
                        <p class="diy-desc">${idea.description}</p>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        <!-- Next Actions -->
        <div class="actions-wrapper" style="margin-top: 25px; display: flex; gap: 15px;">
            <button id="btn-results-scan" class="btn btn-brutal btn-secondary" style="flex: 1;">
                🔄 Scan Another Item
            </button>
            <button id="btn-results-stations" class="btn btn-brutal btn-accent" style="flex: 2;">
                📍 Find Recycle Stations Near Me
            </button>
        </div>
    `;
}

// Render list of recycle stations
export function renderRecycleStations(stations, searchType, queryName = '') {
    const container = document.getElementById('stations-results-list');
    const header = document.getElementById('stations-results-header');
    if (!container || !header) return;

    if (searchType === 'gps') {
        header.innerHTML = `📍 Nearby Recycling Centers <span class="tag-brutal">Within 5km</span>`;
    } else {
        header.innerHTML = `🔍 Recycling Centers in <span class="tag-brutal" style="text-transform: capitalize;">${queryName}</span>`;
    }

    if (!stations || stations.length === 0) {
        container.innerHTML = `
            <div class="sticker-card text-center" style="padding: 40px 20px;">
                <div style="font-size: 3rem; margin-bottom: 15px;">🔍</div>
                <h3>No Recycling Stations Found</h3>
                <p style="color: #555; max-width: 450px; margin: 10px auto 20px;">
                    We couldn't locate any registered recycling spots within a 5km radius of your search. 
                    Local municipal collection standards vary across India.
                </p>
                <div style="font-size: 0.9rem; background: #ffeaa7; padding: 12px; border: 2px solid #000; border-radius: 4px; display: inline-block; box-shadow: 3px 3px 0 #000; text-align: left; max-width: 450px;">
                    <strong>💡 Suggestion:</strong> Try typing a larger neighboring district or city name (e.g. "Mumbai", "Pune", "Indore") in the search box above.
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = stations.map((st) => {
        const distanceStr = st.distance !== null 
            ? `<div class="station-distance">🏃 ${st.distance.toFixed(2)} km away</div>`
            : `<div class="station-distance">🏢 Local Center</div>`;

        const materialsBadge = st.materials 
            ? `<div class="station-materials"><strong>Accepts:</strong> ${st.materials}</div>`
            : '';

        return `
            <div class="sticker-card station-card">
                <div class="station-header">
                    <h3 class="station-name">${st.name}</h3>
                    ${distanceStr}
                </div>
                <p class="station-address">${st.address}</p>
                ${materialsBadge}
                <div style="margin-top: 15px; text-align: right;">
                    <a href="${st.mapsUrl}" target="_blank" class="btn btn-brutal btn-secondary btn-small" style="display: inline-flex; align-items: center; gap: 5px; text-decoration: none;">
                        🗺️ Open in Google Maps ↗
                    </a>
                </div>
            </div>
        `;
    }).join('');
}
