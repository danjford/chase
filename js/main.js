var gameLoopOne;
var gameLoopTwo;

var collectMusic = document.getElementById('playerCollect');
var soundTrack = document.getElementById('soundtrack');
var hitMusic = document.getElementById('playerHit');

soundtrack.volume=0.4;
hitMusic.volume = 0.4;
collectMusic.volume = 0.4;


function startGame() {


    $('.wellDone').hide();
    $('.modal').hide();

    soundTrack.loop = true;
    soundTrack.play();

    clearInterval(gameLoopOne);
    clearInterval(gameLoopTwo);

    var canvas = $('#mainCanvas')[0];
    var context = canvas.getContext("2d");
    var playerSpeed = 4;
    var enemySpeed = 0.2;
    var powerUpChance = 0;
    var oldSpeed = 0;
    var freezeActive = true;

    var bestScore = localStorage.getItem("blockgame-score");
    if(bestScore == NaN || bestScore == null){
        bestScore = 0;
    }
    var alive = true;
    var keys = [];
    var colors = ["green", "blue", "pink", "yellow"];
    var powerUps = ["slowEnemy", "speedBoost", "freezeEnemy", "addLife"];
    var randomPowerUp = "";
    var randomColor = colors[Math.floor((Math.random()) * colors.length)];


    var player = {
        x: 30,
        y: 30,
        width: 20,
        height: 40
    };

    var currentScore = 0;
    var life = 5;

    var collect = {
        x: Math.random() * (600 - 20),
        y: Math.random() * (400 - 20),
        width: 20,
        height: 20,
        color: randomColor
    }

    var enemy = {
        x: Math.random() * (600 - 20),
        y: Math.random() * (400 - 20),
        width: 20,
        height: 20
    }

    var powerUp = {
        x: Math.random() * (600 - 20),
        y: Math.random() * (400 - 20),
        width : 20,
        height: 20
    }

    $(document).keydown(function(e){
        keys[e.which] = true;
        return false;
    })
    $(document).keyup(function(e){
        if(keys[38]) {
            $('.arrowUp').removeClass('activeButton');
        }
        if (keys[40]){
            $('.arrowDown').removeClass('activeButton');
        }
        if (keys[37]){
            $('.arrowLeft').removeClass('activeButton');
        }
        if (keys[39]){
            $('.arrowRight').removeClass('activeButton');
        }
        delete keys[e.which];
        return false;
    });

    function game(){
        update();
        render();
    }

    function update(){
        if (alive){
            if(keys[38]) {
                player.y-=playerSpeed;  //up
                $('.arrowUp').addClass('activeButton');
            }
            if (keys[40]){
                player.y+=playerSpeed; //down
                $('.arrowDown').addClass('activeButton');
            }
            if (keys[37]){
                player.x-=playerSpeed; //left
                $('.arrowLeft').addClass('activeButton');
            }
            if (keys[39]){
                player.x+=playerSpeed; //right
                $('.arrowRight').addClass('activeButton');
            }
            if (player.x < 0 ) player.x = 0;
            if (player.y < 0) player.y = 0;
            if (player.x >= 600 - player.width) player.x = 600 - player.width;
            if (player.y >= 400 - player.height) player.y = 400 - player.height;

            if (collision(player, collect)) processScore();

            if (collision(player, enemy)) processHit();

            if (collision(player, powerUp)) choosePower();

            //Follow the player
            if(enemy.y != player.y ){
                if(enemy.y >= player.y){
                    enemy.y = enemy.y - enemySpeed;
                } else{
                    enemy.y = enemy.y + enemySpeed;
                }
            }
            if(enemy.x != player.x ){
                if(enemy.x >= player.x){
                    enemy.x = enemy.x - enemySpeed;
                } else{
                    enemy.x = enemy.x + enemySpeed;
                }
            }
        }
    }

    function render(){
        context.clearRect(0,0, 600, 400);

        //create the player
        context.fillStyle = "black";
        context.fillRect(player.x, player.y, player.width, player.height);

        //Collectables
        context.fillStyle = collect.color;
        context.fillRect( collect.x, collect.y, collect.width, collect.height);

        //enemy
        context.fillStyle = "red";
        context.fillRect( enemy.x, enemy.y, enemy.width, enemy.height);

        //hit points
        context.fillStyle = "red";
        context.fillText(life, 580, 24);

        if(powerUpChance > 0.8){
            console.log('power up');
            context.fillStyle= "orange";
            context.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
        }

        //current score board
        context.fillStyle = "darkgrey";
        context.font = "bold 18pt helvetica";
        context.fillText(currentScore, 8, 24);

        //best score
        context.fillStyle = "green";
        context.font = "normal 16pt helvetica";
        context.fillText("Best score : " + bestScore, 60, 24);

        //current Powerup
        context.fillStyle = "blue";
        context.font = "normal 16pt helvetica";
        context.fillText(randomPowerUp, 350, 24);
    }

    function processScore(){
        currentScore++;
        collectMusic.load();
        collectMusic.play();
        if (currentScore > bestScore){
            bestScore = currentScore;
        }
        enemySpeed = enemySpeed + 0.2;
        collect.color = colors[Math.floor((Math.random()) * colors.length)];
        collect.x = Math.random() * (600 - 20);
        collect.y = Math.random() * (400 - 20);
    }

    function processHit(){
        life --;
        hitMusic.load();
        hitMusic.play();
        if ( life == 0){
            alive = false;
            $('.modal').show();
            $('.modal').fadeTo(200,1);
            if (currentScore == bestScore){
                $('.wellDone').show();
            }
            localStorage.setItem("blockgame-score", bestScore);
        } else {
            enemy.x = Math.random() * (600 - 20);
            enemy.y = Math.random() * (400 - 20);
        }
    }

    $('.tryAgain').on('click', function(){
        location.reload();
    });

    function choosePower(){
        collectMusic.load();
        collectMusic.play();
        randomPowerUp = powerUps[Math.floor((Math.random()) * powerUps.length)];
        powerUp.x = -100;
        powerUp.y = -100;
        switch(randomPowerUp){
            case "slowEnemy":
                enemySpeed = enemySpeed / 2;
                break;
            case "speedBoost":
                playerSpeed = playerSpeed + 1;
                setTimeout(function(){
                    playerSpeed = 4;
                }, 5000);
                break;
            case "freezeEnemy":
                freezeActive = true;
                if(freezeActive){
                    oldSpeed = enemySpeed;
                    enemySpeed = 0;
                    setTimeout(function(){
                        enemySpeed = oldSpeed;
                        freezeActive = false;
                    }, 5000);
                }

                break;
            case "addLife":
                life ++;
                break;
        }
    }

    function collision(first, second){
        return !(first.x > second.x + second.width || first.x + first.width < second.x || first.y > second.y + second.height || first.y + first.height < second.y);
    }

    gameLoopOne = setInterval( function(){
        powerUpChance = Math.random();
        powerUp.x = Math.random() * (600 - player.x);
        powerUp.y = Math.random() * (400 - player.y);
        if (powerUp.x > 600){
            powerUp.x = 600;
        }
        if (powerUp.x < 0){
            powerUp.x = 0;
        }
        if (powerUp.y > 400){
            powerUp.y = 400;
        }
        if (powerUp.y < 0){
            powerUp.y = 0;
        }
    }, 5000);
  
    gameLoopTwo = setInterval(function(){
        game();
    }, 1000/60);
}

