// Arquivo script.js LIMPO e FUNCIONAL

let capivara, comidaImg, ovoImg, fundoImg;
let coracaoCheio, coracaoVazio;
let comidinhas = [];
let ovos = [];
let score = 0;
let displayedScore = 0;
let lives = 3;
let fase = 1;
let gameStarted = false;
let capivaraX, capivaraY;
let jogoPausado = false;

let velocidadeCapivara = 8;
let velocidadeItens = 1;

let leftPressed = false;
let rightPressed = false;

let musicaFundo, somComida, somPerdeVida, somGameOver;

let fundoPadrao, fundoNoturno, fundoFloresta;

let comidaInterval, ovoInterval;

const MAX_WIDTH = 600;
const MAX_HEIGHT = 500;

function preload() {
  capivara = loadImage('assets/capivara.png ');
  comidaImg = loadImage('assets/comida.png');
  ovoImg = loadImage('assets/ovo.png');
  fundoPadrao = loadImage('assets/fundo.jpeg');
  fundoNoturno = loadImage('assets/fundo_noturno.png');
  fundoFloresta = loadImage('assets/fundo_floresta.png');
  fundoImg = fundoPadrao;
  coracaoCheio = loadImage('assets/coracaoCheio.png');
  coracaoVazio = loadImage('assets/coracaoVazio.png');
  // Sons
  musicaFundo = loadSound('assets/fundo.mp3');
  somComida = loadSound('assets/comida.mp3');
  somPerdeVida = loadSound('assets/vida.mp3');
  somGameOver = loadSound('assets/gameover.mp3');
}

function setup() {
  let w = min(windowWidth, MAX_WIDTH);
  let h = min(windowHeight, MAX_HEIGHT);
  let canvas = createCanvas(w, h);
  canvas.parent('game-canvas');
  capivaraX = width / 2 - 35;
  capivaraY = height - 70;
  textFont('Luckiest Guy');
}

function windowResized() {
  let w = min(windowWidth, MAX_WIDTH);
  let h = min(windowHeight, MAX_HEIGHT);
  resizeCanvas(w, h);
  capivaraX = constrain(capivaraX, 0, width - 70);
  capivaraY = height - 70;
}

function draw() {
  if (!gameStarted) return;

  image(fundoImg, 0, 0, width, height);

  if (leftPressed) capivaraX = max(0, capivaraX - velocidadeCapivara);
  if (rightPressed) capivaraX = min(width - 70, capivaraX + velocidadeCapivara);

  image(capivara, capivaraX, capivaraY, 70, 70);

  for (let i = comidinhas.length - 1; i >= 0; i--) {
    let comida = comidinhas[i];
    comida.y += velocidadeItens;
    image(comidaImg, comida.x, comida.y, 40, 40);

    // Primeiro testa se pegou a comida
    if (collideRectRect(capivaraX, capivaraY, 70, 70, comida.x, comida.y, 40, 40)) {
      score += 10;
      comidinhas.splice(i, 1);
      somComida.play();
      updateFase();
      updateHUD();
      continue;
    }
    // Só testa se perdeu vida se NÃO pegou a comida
    else if (comida.y > height) {
      lives--;
      comidinhas.splice(i, 1);
      somPerdeVida.play();
      if (lives <= 0) gameOver();
      updateHUD();
    }
  }

  for (let i = ovos.length - 1; i >= 0; i--) {
    let ovo = ovos[i];
    ovo.y += velocidadeItens;
    image(ovoImg, ovo.x, ovo.y, 40, 40);

    if (collideRectRect(capivaraX, capivaraY, 70, 70, ovo.x, ovo.y, 40, 40)) {
      lives--;
      ovos.splice(i, 1);
      somPerdeVida.play();
      if (lives <= 0) gameOver();
      updateHUD();
    } else if (ovo.y > height) {
      ovos.splice(i, 1);
    }
  }

  updatePlacarAnimado();
  drawVidasEstiloCoracao(20, 20);
}

function updatePlacarAnimado() {
  if (displayedScore < score) {
    displayedScore += 2;
    if (displayedScore > score) displayedScore = score;
  }
}

function drawPlacarEstiloRoleta(x, y) {
  textSize(32);
  fill(0);
  textAlign(LEFT, TOP);
  text(`Pontos: ${nf(displayedScore, 4)}`, x, y);
}

function drawVidasEstiloCoracao(x, y) {
  let espacamento = 35;
  for (let i = 0; i < 3; i++) {
    let img = i < lives ? coracaoCheio : coracaoVazio;
    image(img, x + i * espacamento, y, 30, 30);
  }
}

function updateFase() {
  let novaFase = Math.floor(score / 100) + 1;
  if (novaFase > fase) {
    fase = novaFase;
    velocidadeCapivara += 0.5;
    velocidadeItens += 0.3;
  }
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) leftPressed = true;
  if (keyCode === RIGHT_ARROW) rightPressed = true;

  if (key === 'p' || key === 'P') {
    togglePause();
    const toggle = document.getElementById('pause-toggle');
    if (toggle) toggle.checked = jogoPausado;
  }

  if (key === 'm' || key === 'M') {
    
      toggleMute();
    }
  }

let somMutado = false;

function toggleMute() {
  somMutado = !somMutado;

  // Mutar ou ativar o contexto de áudio
  if (somMutado) {
    getAudioContext().suspend();
  } else {
    getAudioContext().resume();
  }

  const icon = document.getElementById('mute-icon');
  const button = document.getElementById('mute-button');

  if (icon && button) {
    icon.className = somMutado
      ? 'fa-solid fa-volume-xmark'
      : 'fa-solid fa-volume-high';
    button.title = somMutado ? "Ligar som" : "Desligar som";
  }
}

function touchStarted() {
  if (!gameStarted) return;
  leftPressed = touches[0].x < width / 2;
  rightPressed = !leftPressed;
  return false;
}

function keyReleased() {
  if (keyCode === LEFT_ARROW) leftPressed = false;
  if (keyCode === RIGHT_ARROW) rightPressed = false;
}

function touchStarted() {
  if (!gameStarted) return;
  if (touches.length > 0) {
    let tx = touches[0].x;
    if (tx < width / 2) {
      leftPressed = true;
      rightPressed = false;
    } else {
      rightPressed = true;
      leftPressed = false;
    }
  }
  return false; // previne scroll
}

function touchEnded() {
  leftPressed = false;
  rightPressed = false;
  return false;
}

function startGame() {
  // Troca a classe do body
  document.body.classList.remove("inicio");
  document.body.classList.add("jogo");

  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('game-ui').style.display = 'flex';
  document.getElementById('game-over-popup').style.display = 'none';

  // Aguarda um pequeno tempo para garantir que o display mudou antes de aplicar a classe
  setTimeout(() => {
    document.getElementById('game-ui').classList.add('ui-visible');
    document.getElementById('game-canvas').classList.add('canvas-visible');
  }, 50);

  if (musicaFundo.isPlaying()) musicaFundo.stop();
  musicaFundo.loop();

  document.getElementById('game-header').style.display = 'block';

  gameStarted = true;
  score = 0;
  displayedScore = 0;
  lives = 3;
  fase = 1;
  velocidadeCapivara = 8;
  velocidadeItens = 1;
  capivaraX = width / 2 - 35;
  capivaraY = height - 70;
  comidinhas = [];
  ovos = [];

  // Limpa intervalos antigos se existirem
  clearInterval(comidaInterval);
  clearInterval(ovoInterval);

  // Gera comida a cada 1.2 segundos
  comidaInterval = setInterval(() => {
    let newX = random(width - 40);
    let minDist = 100;
    // Checa espaçamento mínimo entre comidinhas e ovos
    if (
      podeNascer(newX, comidinhas, minDist) &&
      podeNascer(newX, ovos, minDist) &&
      random() < 0.5
    ) {
      // y inicial negativo para dar delay visual (opcional)
      comidinhas.push({ x: newX, y: -random(40, 120) });
    }
  }, 1200);

  // Gera ovo a cada 2 segundos
  ovoInterval = setInterval(() => {
    let newX = random(width - 40);
    let minDist = 100;
    if (
      podeNascer(newX, ovos, minDist) &&
      podeNascer(newX, comidinhas, minDist) &&
      random() < 0.3
    ) {
      ovos.push({ x: newX, y: -random(40, 120) });
    }
  }, 2000);

  loop();
  updateHUD();
  trocarTema(); // <-- aplica o tema selecionado ao iniciar
}

function restartGame() {
  startGame();
}

function gameOver() {
  document.getElementById('game-header').style.display = 'none';

  // Para o loop do p5.js e evita sobreposição
  noLoop();
  gameStarted = false;

  // Limpa intervalos de spawn
  clearInterval(comidaInterval);
  clearInterval(ovoInterval);

  // Limpa listas de itens
  comidinhas = [];
  ovos = [];

  // Reseta controles
  leftPressed = false;
  rightPressed = false;

  // Reseta posição da capivara
  capivaraX = width / 2 - 35;
  capivaraY = height - 70;

  // Para sons
  if (musicaFundo && musicaFundo.isPlaying()) musicaFundo.stop();
  if (somGameOver) somGameOver.play();

  // Salva melhor pontuação no localStorage
  let best = Number(localStorage.getItem('bestScore') || 0);
  if (score > best) {
    best = score;
    localStorage.setItem('bestScore', best);
  }

  // Atualiza HUD e mostra popup
  updateHUD();
  document.getElementById('final-score').innerText = score;
  document.getElementById('game-over-popup').style.display = 'block';
}

function updateHUD() {
  document.getElementById('hud-score').innerText = score;
  document.getElementById('hud-fase').innerText = fase;
  // Atualiza melhor pontuação
  let best = Number(localStorage.getItem('bestScore') || 0);
  document.getElementById('hud-best').innerText = best;
}

function collideRectRect(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2 + w2 && x1 + w1 > x2 &&
         y1 < y2 + h2 && y1 + h1 > y2;
}

// Função utilitária para checar espaçamento mínimo horizontal
function podeNascer(xNovo, fila, minDist) {
  return !fila.some(item => Math.abs(item.x - xNovo) < minDist);
}

// Função para trocar tema
function trocarTema() {
  const tema = document.getElementById('tema').value;
  const hud = document.getElementById('right-bar');
  const leftBar = document.getElementById('left-bar');
  const body = document.body;

  if (tema === 'padrao') {
    fundoImg = fundoPadrao;
    hud.style.color = '#003366';
    hud.style.background = 'rgba(255,255,255,0.7)';
    leftBar.style.background = '#e6f7ff';
    leftBar.style.color = '#003366';
    body.style.background = '#e6f7ff';
  } else if (tema === 'noturno') {
    fundoImg = fundoNoturno;
    hud.style.color = '#fff';
    hud.style.background = 'rgba(20,20,40,0.8)';
    leftBar.style.background = '#181830';
    leftBar.style.color = '#fff';
    body.style.background = '#181830';
  } else if (tema === 'floresta') {
    fundoImg = fundoFloresta;
    hud.style.color = '#145c1b';
    hud.style.background = 'rgba(7, 92, 7, 0.7)';
    leftBar.style.background = '#d2f5d2';
    leftBar.style.color = '#145c1b';
    body.style.background = '#d2f5d2';
  }
}

function togglePause() {
  jogoPausado = !jogoPausado;
  const status = document.getElementById("pause-status");
  const toggle = document.getElementById("pause-toggle");

  if (jogoPausado) {
    noLoop();
    status.innerText = "Pausado";
    toggle.checked = true;
  } else {
    loop();
    status.innerText = "Rolando";
    toggle.checked = false;
  }
}

function voltarParaInicio() {
  document.body.classList.remove("jogo");
  document.body.classList.add("inicio");
}

window.onload = trocarTema;
