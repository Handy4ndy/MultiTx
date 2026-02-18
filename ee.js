// ee.js - XRPL MultiTx Easter Egg Madness
// This script blocks second transaction attempts with multiplying popups

(function () {
    let popupCount = 0;
    let active = false;
    const popupTexts = [
        "Platform fee required!",
        "Did you know? 0.09 XRP goes to the platform!",
        "Please acknowledge the platform fee!",
        "Platform fee: It's important!",
        "You must accept the platform fee!",
        "Platform fee again!",
        "Platform fee, please!",
        "Another platform fee notice!"
    ];

    function randomText() {
        return popupTexts[Math.floor(Math.random() * popupTexts.length)];
    }

    function randomPosition(width, height) {
        const x = Math.floor(Math.random() * (window.innerWidth - width));
        const y = Math.floor(Math.random() * (window.innerHeight - height));
        return { left: x, top: y };
    }

    function createPopup() {
        const popup = document.createElement('div');
        popup.className = 'ee-popup';
        popup.innerHTML = `
            <div class="ee-popup-content">
                <h3>Platform Fee Notice</h3>
                <p>${randomText()}</p>
                <button>Accept</button>
            </div>
        `;
        const { left, top } = randomPosition(320, 140);
        popup.style.position = 'fixed';
        popup.style.left = left + 'px';
        popup.style.top = top + 'px';
        popup.style.zIndex = 10000 + popupCount;
        document.body.appendChild(popup);
        popup.querySelector('button').onclick = function () {
            // On accept, spawn two more popups
            setTimeout(() => {
                createPopup();
                createPopup();
            }, 100);
            popup.remove();
        };
        popupCount++;
    }

    // Attach to the sendForm submit event after first transaction
    function activateEasterEgg() {
        if (active) return;
        active = true;
        const form = document.getElementById('sendForm');
        if (!form) return;
        form.onsubmit = function (e) {
            e.preventDefault();
            // Madness begins!
            createPopup();
        };
    }

    // Expose a global to trigger the easter egg after first transaction
    window.activateMultiTxEasterEgg = activateEasterEgg;

    // Add basic styles for popups
    const style = document.createElement('style');
    style.innerHTML = `
    .ee-popup {
        width: 320px;
        height: 140px;
        background: #23272a;
        color: #ffb347;
        border: 2px solid #ffb347;
        border-radius: 10px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: box-shadow 0.2s;
        user-select: none;
    }
    .ee-popup-content {
        text-align: center;
    }
    .ee-popup button {
        margin-top: 16px;
        background: #7289da;
        color: #fff;
        border: none;
        padding: 8px 18px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 15px;
    }
    `;
    document.head.appendChild(style);
})();
