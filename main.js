// List of all your game files
const games = [
    "Peripheral Detection SA.html", "Focus Recovery SA.html", "Time-to-Impact SA.html",
    "Spatial Orientation Recall.html", "Target vs. Distractor SA.html", "Priority Switching Task.html",
    "Change Detection SA.html", "NeuroTracker SA.html", "Color Sequence Memory Game SA.html",
    "Dual N-Back SA.html", "Rule-Based Alert System SA.html", "Information Monitoring Dashboard SA - Copy.html"
];

// Generate Game Buttons Dynamically
const hub = document.getElementById('simulation-hub');
games.forEach(game => {
    const btn = document.createElement('button');
    btn.innerText = game.replace('.html', '');
    btn.onclick = () => document.getElementById('game-frame').src = `games/${game}`;
    hub.appendChild(btn);
});

// Plane Cursor Animation
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', (e) => {
    cursor.style.left = (e.clientX - 12) + 'px';
    cursor.style.top = (e.clientY - 12) + 'px';
});