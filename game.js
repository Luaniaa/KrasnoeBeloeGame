// Определение мобильного устройства
const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

// Мобильное управление
let joystickActive = false;
let joystickBaseX = 0;
let joystickBaseY = 0;
let joystickMoveX = 0;

function initMobileControls() {
    if (!isMobile) return;
    
    const joystickArea = document.getElementById('joystick-area');
    const joystickThumb = document.querySelector('.joystick-thumb');
    const shootBtn = document.getElementById('mobile-shoot');
    
    // Джойстик - начало касания
    joystickArea.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const rect = joystickArea.getBoundingClientRect();
        joystickBaseX = rect.left + rect.width/2;
        joystickBaseY = rect.top + rect.height/2;
        joystickActive = true;
        updateJoystick(e.touches[0].clientX, e.touches[0].clientY);
    }, {passive: false});
    
    // Джойстик - движение
    document.addEventListener('touchmove', (e) => {
        if (!joystickActive) return;
        e.preventDefault();
        updateJoystick(e.touches[0].clientX, e.touches[0].clientY);
    }, {passive: false});
    
    // Джойстик - окончание
    document.addEventListener('touchend', () => {
        joystickActive = false;
        joystickThumb.style.transform = 'translate(0, 0)';
    }, {passive: true});
    
    // Кнопка стрельбы
    shootBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        fireBullet();
    }, {passive: false});
    
    function updateJoystick(touchX, touchY) {
        const dx = touchX - joystickBaseX;
        const dy = touchY - joystickBaseY;
        const distance = Math.sqrt(dx*dx + dy*dy);
        const maxDistance = 35;
        
        if (distance > maxDistance) {
            const angle = Math.atan2(dy, dx);
            joystickMoveX = Math.cos(angle) * maxDistance;
            const moveY = Math.sin(angle) * maxDistance;
            joystickThumb.style.transform = `translate(${joystickMoveX}px, ${moveY}px)`;
        } else {
            joystickMoveX = dx;
            joystickThumb.style.transform = `translate(${dx}px, ${dy}px)`;
        }
        
        // Движение игрока
        playerX = Math.max(30, Math.min(window.innerWidth - 30, playerX + joystickMoveX * 0.5));
        player.style.left = playerX + 'px';
    }
}

// Инициализация при загрузке
window.addEventListener('DOMContentLoaded', function() {
    initMobileControls();
    
    // Для iOS - активация звуков
    document.addEventListener('touchstart', function() {
        // Пустая функция для активации аудио
    }, { once: true });
});
// Игровые элементы
const player = document.getElementById('player');
const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');
const healthDisplay = document.getElementById('health');
const gameOverDisplay = document.getElementById('game-over');
const finalScoreDisplay = document.getElementById('final-score');
const restartBtn = document.getElementById('restart');
const laserSound = document.getElementById('laser-sound');
const explosionSound = document.getElementById('explosion-sound');
const beerSound = document.getElementById('beer-sound');
const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');

// Игровые переменные
let score = 0;
let health = 3;
let isGameOver = false;
let playerX = window.innerWidth / 2;
let asteroids = [];
let bonuses = [];
let bullets = [];
let keys = {};
let gameSpeed = 1;
let spawnRate = 2000;

// Обработчики событий
document.addEventListener('keydown', (e) => keys[e.code] = true);
document.addEventListener('keyup', (e) => keys[e.code] = false);
restartBtn.addEventListener('click', restartGame);
startBtn.addEventListener('click', startGame);



function startGame() {
    startScreen.style.display = 'none';
    spawnAsteroid();
    spawnBonus();
    gameLoop();
}

// Основной игровой цикл
function gameLoop() {
    if (isGameOver) return;
    
    updatePlayer();
    updateBullets();
    updateAsteroids();
    updateBonuses();
    checkCollisions();
    
    requestAnimationFrame(gameLoop);
}


// Управление кораблём
function updatePlayer() {
    if (keys['ArrowLeft'] && playerX > 30) playerX -= 10;
    if (keys['ArrowRight'] && playerX < window.innerWidth - 30) playerX += 10;
    if (keys['Space']) fireBullet();
    
    player.style.left = playerX + 'px';
}

// Стрельба
function fireBullet() {
    if (Date.now() - (bullets[bullets.length - 1]?.lastFired || 0) < 300) return;
    
    const bullet = document.createElement('div');
    bullet.className = 'bullet';
    bullet.style.left = (playerX + 27) + 'px';
    bullet.style.bottom = '110px';
    gameContainer.appendChild(bullet);
    
    bullets.push({
        element: bullet,
        x: playerX + 27,
        y: 110,
        lastFired: Date.now()
    });
    
    laserSound.currentTime = 0;
    laserSound.play();
}

// Обновление пуль
function updateBullets() {
    bullets.forEach((bullet, index) => {
        bullet.y += 15;
        bullet.element.style.bottom = bullet.y + 'px';
        
        if (bullet.y > window.innerHeight) {
            bullet.element.remove();
            bullets.splice(index, 1);
        }
    });
}

// Создание астероидов
function spawnAsteroid() {
    if (isGameOver) return;
    
    const asteroid = document.createElement('div');
    asteroid.className = 'asteroid';
    const x = Math.random() * (window.innerWidth - 50);
    asteroid.style.left = x + 'px';
    asteroid.style.top = '-50px';
    gameContainer.appendChild(asteroid);
    
    asteroids.push({
        element: asteroid,
        x: x,
        y: -50,
        speed: 2 + Math.random() * 2 * gameSpeed
    });
    
    setTimeout(spawnAsteroid, spawnRate);
}

// Обновление астероидов
function updateAsteroids() {
    asteroids.forEach((asteroid, index) => {
        asteroid.y += asteroid.speed;
        asteroid.element.style.top = asteroid.y + 'px';
        
        if (asteroid.y > window.innerHeight) {
            asteroid.element.remove();
            asteroids.splice(index, 1);
        }
    });
}

// Создание бонусов
function spawnBonus() {
    if (isGameOver) return;
    
    const bonus = document.createElement('div');
    bonus.className = 'bonus';
    const x = Math.random() * (window.innerWidth - 40);
    bonus.style.left = x + 'px';
    bonus.style.top = '-40px';
    gameContainer.appendChild(bonus);
    
    bonuses.push({
        element: bonus,
        x: x,
        y: -40,
        speed: 3 * gameSpeed
    });
    
    setTimeout(spawnBonus, 10000);
}

// Обновление бонусов
function updateBonuses() {
    bonuses.forEach((bonus, index) => {
        bonus.y += bonus.speed;
        bonus.element.style.top = bonus.y + 'px';
        
        if (bonus.y > window.innerHeight) {
            bonus.element.remove();
            bonuses.splice(index, 1);
        }
    });
}

// Проверка столкновений
function checkCollisions() {
    // Пули с астероидами
    bullets.forEach((bullet, bIndex) => {
        asteroids.forEach((asteroid, aIndex) => {
            if (isColliding(bullet, asteroid)) {
                explosionSound.play();
                asteroid.element.remove();
                bullet.element.remove();
                asteroids.splice(aIndex, 1);
                bullets.splice(bIndex, 1);
                score += 10;
                scoreDisplay.textContent = `Очки: ${score}`;
                
                // Увеличение сложности
                if (score % 50 === 0) {
                    gameSpeed += 0.2;
                    spawnRate = Math.max(500, spawnRate - 200);
                }
            }
        });
    });
    
    // Игрок с астероидами
    asteroids.forEach((asteroid, index) => {
        if (isColliding({x: playerX, y: 50, element: player}, asteroid)) {
            explosionSound.play();
            asteroid.element.remove();
            asteroids.splice(index, 1);
            health--;
            healthDisplay.textContent = '❤️'.repeat(health);
            
            if (health <= 0) endGame();
        }
    });
    
    // Игрок с бонусами
    bonuses.forEach((bonus, index) => {
        if (isColliding({x: playerX, y: 50, element: player}, bonus)) {
            beerSound.play();
            bonus.element.remove();
            bonuses.splice(index, 1);
            health = Math.min(3, health + 1);
            healthDisplay.textContent = '❤️'.repeat(health);
            score += 20;
            scoreDisplay.textContent = `Очки: ${score}`;
        }
    });
}

// Проверка столкновения объектов
function isColliding(obj1, obj2) {
    const rect1 = obj1.element.getBoundingClientRect();
    const rect2 = obj2.element.getBoundingClientRect();
    
    return !(
        rect1.right < rect2.left || 
        rect1.left > rect2.right || 
        rect1.bottom < rect2.top || 
        rect1.top > rect2.bottom
    );
}

// Конец игры
function endGame() {
    isGameOver = true;
    finalScoreDisplay.textContent = score;
    gameOverDisplay.style.display = 'block';
}

// Новая игра
function restartGame() {
    // Очистка игровых объектов
    asteroids.forEach(a => a.element.remove());
    bonuses.forEach(b => b.element.remove());
    bullets.forEach(b => b.element.remove());
    
    // Сброс переменных
    asteroids = [];
    bonuses = [];
    bullets = [];
    score = 0;
    health = 3;
    gameSpeed = 1;
    spawnRate = 2000;
    isGameOver = false;
    
    // Обновление интерфейса
    scoreDisplay.textContent = `Очки: ${score}`;
    healthDisplay.textContent = '❤️'.repeat(health);
    gameOverDisplay.style.display = 'none';
    
    // Запуск игры
    spawnAsteroid();
    spawnBonus();
    gameLoop();
}

// Запуск игры
startScreen.style.display = 'flex';