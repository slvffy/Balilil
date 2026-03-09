const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const gameUI = document.getElementById('game-ui');
        const scoreDisplay = document.getElementById('current-score');
        const topScoreInGame = document.getElementById('top-score-ingame');
        
        const overlays = document.querySelectorAll('.overlay');
        const startScreen = document.getElementById('start-screen');
        const difficultyMenu = document.getElementById('difficulty-menu');
        const gameOverMenu = document.getElementById('game-over-menu');

        canvas.width = window.innerWidth > 500 ? 500 : window.innerWidth;
        canvas.height = window.innerHeight;

        const playerImg = new Image();
        playerImg.src = 'balil.png';
        const foodImg = new Image();
        foodImg.src = 'etanol';

        let score = 0;
        let isPlaying = false;
        let foods = [];
        let foodTimer = 0;
        let difficulty = 'normal';
        let highscore = localStorage.getItem('bahlilHighscore') || 0;

        document.getElementById('main-highscore').innerText = highscore;

        const player = {
            x: canvas.width / 2 - 100,
            y: canvas.height - 210,
            width: 200,
            height: 200,
            speed: 12
        };

        const keys = {};
        window.addEventListener('keydown', e => keys[e.code] = true);
        window.addEventListener('keyup', e => keys[e.code] = false);

        let touchX = null;
        window.addEventListener('touchstart', e => { if(isPlaying) touchX = e.touches[0].clientX; });
        window.addEventListener('touchend', () => touchX = null);

        function hideAllOverlays() { overlays.forEach(el => el.classList.remove('active')); }

        function showStartScreen() {
            hideAllOverlays();
            setTimeout(() => {
                document.getElementById('main-highscore').innerText = highscore;
                startScreen.classList.add('active');
            }, 100); 
        }

        function showDifficultyMenu() {
            hideAllOverlays();
            setTimeout(() => { difficultyMenu.classList.add('active'); }, 100);
        }

        function startGame(mode) {
            hideAllOverlays();
            difficulty = mode;
            score = 0;
            foods = [];
            foodTimer = 0;
            isPlaying = true;
            player.x = canvas.width / 2 - player.width / 2;
            scoreDisplay.innerText = `SKOR: ${score}`;
            topScoreInGame.innerText = `🏆 ${highscore}`;
            gameUI.style.display = 'flex';
        }

        function triggerGameOver() {
            if (!isPlaying) return; 
            isPlaying = false;
            gameUI.style.display = 'none';
            if (score > highscore) {
                highscore = score;
                localStorage.setItem('bahlilHighscore', highscore);
            }
            document.getElementById('total-score').innerText = score;
            document.getElementById('over-highscore').innerText = highscore;
            setTimeout(() => { gameOverMenu.classList.add('active'); }, 300);
        }

        function spawnFood() {
            let bonusSpeed = Math.floor(score / 200);
            let baseSpeed = (difficulty === 'wni') ? 22 : 10;
            foods.push({
                x: Math.random() * (canvas.width - 60),
                y: -70,
                width: 70,
                height: 70,
                speed: baseSpeed + (Math.random() * 4) + bonusSpeed
            });
        }

        function update() {
            if (!isPlaying) return;
            if ((keys['ArrowLeft'] || keys['KeyA']) && player.x > -50) player.x -= player.speed;
            if ((keys['ArrowRight'] || keys['KeyD']) && player.x < canvas.width - player.width + 50) player.x += player.speed;

            if (touchX !== null) {
                if (touchX < window.innerWidth / 2 && player.x > -50) player.x -= player.speed;
                if (touchX > window.innerWidth / 2 && player.x < canvas.width - player.width + 50) player.x += player.speed;
            }

            foodTimer++;
            if (foodTimer % 40 === 0) spawnFood();

            for (let i = foods.length - 1; i >= 0; i--) {
                const f = foods[i];
                f.y += f.speed;
                if (f.x + 20 < player.x + player.width - 20 && f.x + f.width - 20 > player.x + 20 &&
                    f.y + 20 < player.y + player.height && f.y + f.height > player.y + 40) {
                    foods.splice(i, 1);
                    score += 10;
                    scoreDisplay.innerText = `SKOR: ${score}`;
                    if(score > highscore) topScoreInGame.innerText = `🏆 ${score}`;
                } else if (f.y > canvas.height) {
                    triggerGameOver();
                }
            }
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
            foods.forEach(f => ctx.drawImage(foodImg, f.x, f.y, f.width, f.height));
            update();
            requestAnimationFrame(draw);
        }

        playerImg.onload = () => { draw(); };