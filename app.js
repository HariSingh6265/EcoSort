// EcoSort — Main Application Orchestrator Module

import { Router } from './router.js';
import { classifyImage, processClassificationResults } from './ai.js';
import { getUserLocation, fetchNearbyStations, searchStationsByCity } from './location.js';
import { renderResults, renderRecycleStations, showToast, showLoading, hideLoading } from './ui.js';

let router;
let cameraStream = null;
let currentFacingMode = 'environment'; // Default to back camera for scan target

// ----------------------------------------------------
// CAMERA MANAGEMENT
// ----------------------------------------------------

async function startCamera() {
    const video = document.getElementById('camera-video');
    const loadingPlaceholder = document.getElementById('camera-loading-placeholder');
    if (!video) return;

    // Clear previous stream if any
    if (cameraStream) {
        stopCamera();
    }

    if (loadingPlaceholder) {
        loadingPlaceholder.style.display = 'flex';
        loadingPlaceholder.innerHTML = `
            <span style="font-size: 2rem; animation: spin 1.5s infinite linear; display: inline-block;">⚙️</span>
            <p style="margin-top: 10px; font-weight: 700; font-size: 0.85rem;">Accessing camera stream...</p>
        `;
    }

    try {
        const constraints = {
            video: {
                facingMode: currentFacingMode,
                width: { ideal: 640 },
                height: { ideal: 480 }
            },
            audio: false
        };

        cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = cameraStream;
        video.onloadedmetadata = () => {
            if (loadingPlaceholder) {
                loadingPlaceholder.style.display = 'none';
            }
        };
    } catch (error) {
        console.error("Camera getUserMedia failed:", error);
        if (loadingPlaceholder) {
            loadingPlaceholder.innerHTML = `
                <span style="font-size: 2rem;">⚠️</span>
                <p style="margin-top: 10px; font-weight: 700; font-size: 0.85rem; color: var(--hazard); padding: 0 10px;">
                    Camera blocked or unavailable.<br>
                    <span style="font-weight: 500; font-size: 0.75rem; color: #555;">Please use the manual file upload zone below.</span>
                </p>
            `;
        }
        showToast("Camera access rejected. Use file upload fallback.", "warning");
    }
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    const video = document.getElementById('camera-video');
    if (video) {
        video.srcObject = null;
    }
}

async function toggleCameraFacingMode() {
    currentFacingMode = (currentFacingMode === 'user') ? 'environment' : 'user';
    showToast(`Switching camera alignment...`, 'info');
    await startCamera();
}

// ----------------------------------------------------
// CLASSIFICATION WORKFLOWS
// ----------------------------------------------------

// Take photo from canvas and run classifier
async function capturePhotoAndClassify() {
    const video = document.getElementById('camera-video');
    const canvas = document.getElementById('preview-canvas');
    if (!video || !canvas) return;

    // Check if camera is active and feeding stream
    if (!cameraStream) {
        showToast("No active camera stream to capture from. Try file upload.", "warning");
        return;
    }

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imgDataUrl = canvas.toDataURL('image/jpeg');

    showLoading("EcoSort AI classifying waste...");

    try {
        const predictions = await classifyImage(canvas);
        const results = processClassificationResults(predictions);

        // Update statistics
        saveScanStats(results.categoryKey);

        // Turn off camera and render
        stopCamera();
        renderResults(results.categoryKey, results.matchedLabel, results.confidence, results.isFallback, imgDataUrl);
        router.navigate('results');
    } catch (err) {
        console.error("AI classify failed:", err);
        showToast(`AI analysis failed: ${err.message}`, "error");
    } finally {
        hideLoading();
    }
}

// Process direct manual file upload
async function handleFileUpload(file) {
    if (!file) return;

    // Validate size or type
    if (!file.type.startsWith('image/')) {
        showToast("Invalid format. Please select an image file.", "error");
        return;
    }

    showLoading("Reading image file contents...");

    const reader = new FileReader();
    reader.onload = (event) => {
        const imgUrl = event.target.result;
        
        // Create virtual image element to pass to ml5
        const img = new Image();
        img.src = imgUrl;
        img.onload = async () => {
            showLoading("EcoSort AI classifying upload...");
            try {
                const predictions = await classifyImage(img);
                const results = processClassificationResults(predictions);

                // Save stats
                saveScanStats(results.categoryKey);

                renderResults(results.categoryKey, results.matchedLabel, results.confidence, results.isFallback, imgUrl);
                router.navigate('results');
            } catch (err) {
                console.error("File processing failed:", err);
                showToast(`Analysis failed: ${err.message}`, "error");
            } finally {
                hideLoading();
            }
        };
    };
    reader.readAsDataURL(file);
}

// ----------------------------------------------------
// LOCATION & RECYCLING FINDER
// ----------------------------------------------------

async function runGPSStationLookup() {
    showLoading("Retrieving GPS coordinates...");
    try {
        const coords = await getUserLocation();
        showLoading("Finding nearby recycle stations...");
        const stations = await fetchNearbyStations(coords.latitude, coords.longitude);
        renderRecycleStations(stations, 'gps');
        showToast(`Located ${stations.length} collection stations!`, 'success');
    } catch (err) {
        console.error("GPS fetch error:", err);
        showToast(err.message + " Try searching your city below.", "warning");
    } finally {
        hideLoading();
    }
}

async function runCityStationLookup() {
    const input = document.getElementById('input-city');
    if (!input) return;

    const cityName = input.value.trim();
    if (!cityName) {
        showToast("Please type a city name first.", "warning");
        return;
    }

    showLoading(`Searching centers in ${cityName}...`);
    try {
        const stations = await searchStationsByCity(cityName);
        renderRecycleStations(stations, 'city', cityName);
        showToast(`Located ${stations.length} recycling centers in ${cityName}!`, 'success');
    } catch (err) {
        console.error("City search error:", err);
        showToast(`Search failed: ${err.message}`, "error");
    } finally {
        hideLoading();
    }
}

// ----------------------------------------------------
// STATE / STATS STORAGE
// ----------------------------------------------------

function loadStatsFromStorage() {
    const scanned = parseInt(localStorage.getItem('ecosort_scanned_count') || '0', 10);
    const diy = parseInt(localStorage.getItem('ecosort_diy_read_count') || '0', 10);

    const scanEl = document.getElementById('stat-scanned');
    const diyEl = document.getElementById('stat-recycled');

    if (scanEl) scanEl.textContent = scanned;
    if (diyEl) diyEl.textContent = diy;
}

function saveScanStats(categoryKey) {
    const scanned = parseInt(localStorage.getItem('ecosort_scanned_count') || '0', 10) + 1;
    localStorage.setItem('ecosort_scanned_count', scanned.toString());

    // If organic/recyclable, count as reading a DIY upcycling idea
    let diy = parseInt(localStorage.getItem('ecosort_diy_read_count') || '0', 10);
    if (categoryKey === 'wet' || categoryKey === 'dry') {
        diy += 1;
        localStorage.setItem('ecosort_diy_read_count', diy.toString());
    }

    loadStatsFromStorage();
}

function setActiveNavigationTab(routeKey) {
    const navLinks = document.querySelectorAll('.bottom-nav .nav-link');
    navLinks.forEach((link) => {
        if (link.getAttribute('data-route') === routeKey) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ----------------------------------------------------
// INITIALIZATION
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // Setup client-side routes
    const routes = {
        gateway: {
            elementId: 'view-gateway',
            onEnter: () => {
                document.getElementById('app-nav').style.display = 'none';
            }
        },
        dashboard: {
            elementId: 'view-dashboard',
            onEnter: () => {
                document.getElementById('app-nav').style.display = 'flex';
                setActiveNavigationTab('dashboard');
                loadStatsFromStorage();
            }
        },
        vision: {
            elementId: 'view-vision',
            onEnter: async () => {
                document.getElementById('app-nav').style.display = 'flex';
                setActiveNavigationTab('vision');
                await startCamera();
            },
            onLeave: () => {
                stopCamera();
            }
        },
        results: {
            elementId: 'view-results',
            onEnter: () => {
                document.getElementById('app-nav').style.display = 'flex';
                setActiveNavigationTab(''); // Clear tab selection for results page
            }
        },
        'recycle-stations': {
            elementId: 'view-recycle-stations',
            onEnter: () => {
                document.getElementById('app-nav').style.display = 'flex';
                setActiveNavigationTab('recycle-stations');
            }
        }
    };

    // Instantiate and trigger Router
    router = new Router(routes, 'gateway');
    router.init();

    // 1. Gateway view event listener
    document.getElementById('btn-enter-app').addEventListener('click', () => {
        router.navigate('dashboard');
    });

    // 2. Dashboard view event listeners
    document.getElementById('btn-dash-scan').addEventListener('click', () => {
        router.navigate('vision');
    });
    document.getElementById('btn-dash-stations').addEventListener('click', () => {
        router.navigate('recycle-stations');
    });

    // 3. Vision view event listeners
    document.getElementById('btn-camera-capture').addEventListener('click', capturePhotoAndClassify);
    document.getElementById('btn-camera-toggle').addEventListener('click', toggleCameraFacingMode);
    
    // File upload triggers
    const dropzone = document.getElementById('file-dropzone');
    const fileInput = document.getElementById('file-input');
    
    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
        }
    });

    // Drag-over styling
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--primary)';
        dropzone.style.background = '#e8f8e8';
    });
    
    dropzone.addEventListener('dragleave', () => {
        dropzone.style.borderColor = 'var(--border-color)';
        dropzone.style.background = '#ffffff';
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--border-color)';
        dropzone.style.background = '#ffffff';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });

    // 4. Results view delegate listener
    document.getElementById('results-content').addEventListener('click', (e) => {
        if (e.target) {
            if (e.target.id === 'btn-results-scan') {
                router.navigate('vision');
            } else if (e.target.id === 'btn-results-stations') {
                router.navigate('recycle-stations');
                // Automatically run nearby stations lookup on arrival
                runGPSStationLookup();
            }
        }
    });

    // 5. Recycle Stations view event listeners
    document.getElementById('btn-gps-search').addEventListener('click', runGPSStationLookup);
    document.getElementById('btn-city-search').addEventListener('click', runCityStationLookup);
    
    // Bind enter key on city input
    document.getElementById('input-city').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            runCityStationLookup();
        }
    });

    // 6. Bottom navbar navigation clicks
    const navLinks = document.querySelectorAll('.bottom-nav .nav-link');
    navLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const route = link.getAttribute('data-route');
            router.navigate(route);
        });
    });
});
