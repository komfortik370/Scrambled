const canvas = document.getElementById('animation-canvas');
const ctx = canvas.getContext('2d');

// Масштабирование canvas под Retina
canvas.width = canvas.offsetWidth * window.devicePixelRatio;
canvas.height = canvas.offsetHeight * window.devicePixelRatio;
ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

let rubikX = 250, rubikY = 180;
let pulse = 0;
let isSolving = false;
let solveProgress = 0;
let sparkles = [];

// Эмуляция "живого" кубика (цвета меняются хаотично)
let cubeState = [
    ['red', 'red', 'red'],
    ['red', 'red', 'red'],
    ['red', 'red', 'red']
]; // Упрощенно для примера

function drawPlatform() {
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.ellipse(300, 350, 250, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Тень платформы
    ctx.shadowColor = 'rgba(100, 255, 218, 0.2)';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawRubik() {
    const size = 80;
    const offset = size / 3;
    
    // Пульсация (кубик "дышит")
    const scale = 1 + Math.sin(pulse) * 0.05;
    
    ctx.save();
    ctx.translate(rubikX, rubikY);
    ctx.scale(scale, scale);
    
    // Тень кубика
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 10;
    
    // Рисуем грани (упрощенно)
    ctx.fillStyle = '#4ecdc4'; // Front
    ctx.fillRect(-offset, -offset, size, size);
    
    ctx.fillStyle = '#45b7d1'; // Top
    ctx.beginPath();
    ctx.moveTo(-offset, -offset);
    ctx.lineTo(0, -offset - 15);
    ctx.lineTo(size, -offset - 15);
    ctx.lineTo(size, -offset);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#f9c74f'; // Right
    ctx.beginPath();
    ctx.moveTo(size, -offset);
    ctx.lineTo(size + 15, 0);
    ctx.lineTo(size + 15, size);
    ctx.lineTo(size, size);
    ctx.closePath();
    ctx.fill();

    // Грани кубика (наклейки)
    ctx.shadowBlur = 0;
    const colors = ['#ff6b6b', '#4ecdc4', '#f9c74f'];
    for(let i=0; i<3; i++) {
        for(let j=0; j<3; j++) {
            ctx.fillStyle = colors[(i+j)%3];
            ctx.fillRect(-offset + i*27 + 2, -offset + j*27 + 2, 23, 23);
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.strokeRect(-offset + i*27 + 2, -offset + j*27 + 2, 23, 23);
        }
    }
    
    // "Глаза" кубика (чтобы он казался живым)
    if(!isSolving) {
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-15, -15, 5, 0, Math.PI * 2);
        ctx.arc(15, -15, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Моргает
        if(Math.random() > 0.98) {
            ctx.fillStyle = 'transparent';
            ctx.fillRect(-20, -20, 40, 5);
        }
    }
    
    ctx.restore();
}

function drawSparkles() {
    ctx.fillStyle = '#f59e0b';
    sparkles.forEach((s, i) => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        s.y -= s.speed;
        s.x += Math.sin(Date.now() * 0.002 + i) * 0.2;
        if(s.y < 0) sparkles.splice(i, 1);
    });
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawPlatform();
    
    // Эффект ожидания поезда (свет фонаря)
    const gradient = ctx.createRadialGradient(300, 300, 50, 300, 300, 200);
    gradient.addColorStop(0, 'rgba(245, 158, 11, 0.3)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawSparkles();
    drawRubik();
    
    pulse += 0.05;
    
    // Генерация искр
    if(Math.random() > 0.9) {
        sparkles.push({ x: rubikX + (Math.random()-0.5)*40, y: rubikY + 50, size: Math.random()*3+1, speed: Math.random()*1+0.5 });
    }
    
    // Анимация сборки
    if(isSolving) {
        solveProgress += 0.01;
        if(solveProgress > 1) {
            isSolving = false;
            solveProgress = 0;
        } else {
            // Кубик становится "чистым" (одного цвета)
            ctx.save();
            ctx.translate(rubikX, rubikY);
            const clearColor = '#4ecdc4';
            ctx.fillStyle = clearColor;
            ctx.globalAlpha = solveProgress * 0.5;
            ctx.fillRect(-40, -40, 80, 80);
            ctx.restore();
        }
    }

    requestAnimationFrame(animate);
}

// Интерактив
document.getElementById('btn-look').addEventListener('click', () => {
    // Камера "оглядывается" на станцию
    rubikX = 400;
    setTimeout(() => { rubikX = 250; }, 1500);
});

document.getElementById('btn-solve').addEventListener('click', () => {
    isSolving = true;
    // Очищаем искры, когда начинается сборка
    sparkles = [];
});

// Запуск
animate();