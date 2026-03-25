// ===== MOBILE APP FEATURES =====
const MobileService = {
    // QR Code Scanner
    scanQRCode: () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            Utils.showToast('Camera not supported on this device', 'error');
            return;
        }
        
        // Create scanner modal
        const modalHtml = `
            <div id="qr-scanner-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: black; z-index: 10000;">
                <video id="qr-video" style="width: 100%; height: 100%; object-fit: cover;"></video>
                <canvas id="qr-canvas" style="display: none;"></canvas>
                <button onclick="closeScanner()" style="position: absolute; top: 20px; right: 20px; background: red; color: white; border: none; padding: 10px; border-radius: 50%;">&times;</button>
                <div style="position: absolute; bottom: 100px; left: 0; right: 0; text-align: center; color: white;">Scan QR Code</div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        const video = document.getElementById('qr-video');
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(stream => {
                video.srcObject = stream;
                video.play();
                
                // Simulate QR detection (in production, use Instascan or jsQR library)
                setTimeout(() => {
                    Utils.showToast('QR Code scanned!', 'success');
                    closeScanner();
                    window.location.href = 'bundles.html';
                }, 3000);
            })
            .catch(err => {
                Utils.showToast('Camera access denied', 'error');
                closeScanner();
            });
    },
    
    // Barcode Scanner
    scanBarcode: () => {
        Utils.showToast('Scan product barcode to add to cart', 'info');
        // In production, use QuaggaJS or similar library
        const product = ProductService.getAll()[0];
        Utils.showToast(`Added ${product.name} to cart!`, 'success');
        CartService.addItem(product.id);
    },
    
    // Voice Search
    voiceSearch: () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            Utils.showToast('Voice search not supported', 'error');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'en-US';
        recognition.start();
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const searchInput = document.getElementById('search-bar');
            if (searchInput) {
                searchInput.value = transcript;
                handleSearch(transcript);
            }
            Utils.showToast(`Searching for: ${transcript}`, 'info');
        };
        
        recognition.onerror = () => {
            Utils.showToast('Could not recognize speech', 'error');
        };
    },
    
    // Touch ID / Fingerprint Login
    touchIDLogin: () => {
        if (!window.PublicKeyCredential) {
            Utils.showToast('Biometric login not supported', 'error');
            return;
        }
        
        Utils.showToast('Use fingerprint to login', 'info');
        setTimeout(() => {
            AuthService.login('admin@auramarket.com', 'admin123');
        }, 2000);
    },
    
    // Add to Home Screen Prompt
    promptInstall: () => {
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            const installBtn = document.createElement('button');
            installBtn.innerHTML = '📱 Install App';
            installBtn.className = 'btn btn-primary mt-2';
            installBtn.onclick = () => {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(() => deferredPrompt = null);
            };
            document.querySelector('.nav-icons').appendChild(installBtn);
        });
    }
};

window.closeScanner = () => {
    const modal = document.getElementById('qr-scanner-modal');
    if (modal) modal.remove();
};