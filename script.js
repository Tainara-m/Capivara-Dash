// Capivara Dash - script.js melhorado

let capivara, comidaImg, ovoImg, fundoImg;
let coracaoCheio, coracaoVazio;
let comidinhas = [];
let ovos = [];
let vidasDrop = [];
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
let comidaInterval, ovoInterval, vidaInterval;

const MAX_WIDTH = 600;
const MAX_HEIGHT = 500;
let toastTimer = null;

function preload() {
  capivara = loadImage('assets/capivara.png');
  comidaImg = loadImage('assets/comida.png');
  ovoImg = loadImage('assets/ovo.png');
  fundoPadrao = loadImage('assets/fundo.jpeg');
  fundoNoturno = loadImage('assets/fundo_noturno.png');
  fundoFloresta = loadImage('assets/fundo_floresta.png');
  fundoImg = fundoPadrao;
  coracaoCheio = loadImage('assets/coracaoCheio.png');
  coracaoVazio = loadImage('assets/coracaoVazio.png');
  musicaFundo  = loadSound('assets/fundo.mp3');
  somComida    = loadSound('assets/comida.mp3');
  somPerdeVida = loadSound('assets/vida.mp3');
  somGameOver  = loadSound('assets/gameover.mp3');
}

function setup() {
  let w = min(windowWidth, MAX_WIDTH);
  let h = min(windowHeight * 0.7, MAX_HEIGHT);
  let canvas = createCanvas(w, h);
  canvas.parent('game-canvas');
  capivaraX = width / 2 - 35;
  capivaraY = height - 70;
  textFont('Luckiest Guy');
}

function windowResized() {
  let w = min(windowWidth, MAX_WIDTH);
  let h = min(windowHeight * 0.7, MAX_HEIGHT);
  resizeCanvas(w, h);
  capivaraX = constrain(capivaraX, 0, width - 70);
  capivaraY = height - 70;
}

function draw() {
  if (!gameStarted) return;

  image(fundoImg, 0, 0, width, height);

  if (leftPressed)  capivaraX = max(0, capivaraX - velocidadeCapivara);
  if (rightPressed) capivaraX = min(width - 70, capivaraX + velocidadeCapivara);

  image(capivara, capivaraX, capivaraY, 70, 70);

  // Comida
  for (let i = comidinhas.length - 1; i >= 0; i--) {
    let comida = comidinhas[i];
    comida.y += velocidadeItens;
    image(comidaImg, comida.x, comida.y, 40, 40);

    if (collideRectRect(capivaraX, capivaraY, 70, 70, comida.x, comida.y, 40, 40)) {
      score += 10;
      comidinhas.splice(i, 1);
      somComida.play();
      updateFase();
      updateHUD();
      continue;
    } else if (comida.y > height) {
      lives--;
      comidinhas.splice(i, 1);
      somPerdeVida.play();
      flashDano();
      if (lives <= 0) gameOver();
      updateHUD();
    }
  }

  // Ovos
  for (let i = ovos.length - 1; i >= 0; i--) {
    let ovo = ovos[i];
    ovo.y += velocidadeItens;
    image(ovoImg, ovo.x, ovo.y, 40, 40);

    if (collideRectRect(capivaraX, capivaraY, 70, 70, ovo.x, ovo.y, 40, 40)) {
      lives--;
      ovos.splice(i, 1);
      somPerdeVida.play();
      flashDano();
      if (lives <= 0) gameOver();
      updateHUD();
    } else if (ovo.y > height) {
      ovos.splice(i, 1);
    }
  }

  // Vidas extras
  for (let i = vidasDrop.length - 1; i >= 0; i--) {
    let vida = vidasDrop[i];
    vida.y += velocidadeItens * 0.7;

    // Pulsar o coração
    let escala = 30 + sin(frameCount * 0.15 + i) * 4;
    image(coracaoCheio, vida.x, vida.y, escala, escala);

    if (collideRectRect(capivaraX, capivaraY, 70, 70, vida.x, vida.y, 30, 30)) {
      if (lives < 3) {
        lives++;
        showToast('❤️ Vida recuperada!');
        somComida.play();
        updateHUD();
      }
      vidasDrop.splice(i, 1);
    } else if (vida.y > height) {
      vidasDrop.splice(i, 1);
    }
  }

  updatePlacarAnimado();
  drawVidasEstiloCoracao(10, 10);
}

// Flash vermelho ao perder vida
let flashFrames = 0;
function flashDano() {
  flashFrames = 8;
}

// Sobrescreve draw para adicionar flash
const _origDraw = draw;

// Efeito de flash de dano
function drawFlash() {
  if (flashFrames > 0) {
    fill(255, 0, 0, map(flashFrames, 0, 8, 0, 100));
    noStroke();
    rect(0, 0, width, height);
    flashFrames--;
  }
}

// Injetar flash após o draw principal
const originalDraw = window.draw || draw;
window.draw = function() {
  originalDraw();
  drawFlash();
};

function updatePlacarAnimado() {
  if (displayedScore < score) {
    displayedScore += 2;
    if (displayedScore > score) displayedScore = score;
  }
}

function drawVidasEstiloCoracao(x, y) {
  let espacamento = 36;
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
    showToast('🚀 Fase ' + fase + '!');
  }
}

// ===== TOAST =====
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.style.display = 'block';
  requestAnimationFrame(() => toast.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => { toast.style.display = 'none'; }, 350);
  }, 1800);
}

// ===== VIDAS NO HUD HTML =====
function renderVidasHTML() {
  const el = document.getElementById('vidas-html');
  if (!el) return;
  let html = '';
  for (let i = 0; i < 3; i++) {
    html += i < lives ? '❤️' : '🖤';
  }
  el.innerHTML = html;
}

// ===== BARRA DE FASE =====
function updateFaseBar() {
  const pontosFase = score % 100;
  const pct = (pontosFase / 100) * 100;
  const bar = document.getElementById('fase-bar-fill');
  if (bar) bar.style.width = pct + '%';
}

// ===== TECLADO =====
function keyPressed() {
  if (keyCode === LEFT_ARROW)  leftPressed = true;
  if (keyCode === RIGHT_ARROW) rightPressed = true;

  if (key === 'p' || key === 'P') {
    togglePause();
    const toggle = document.getElementById('pause-toggle');
    if (toggle) toggle.checked = jogoPausado;
  }

  if (key === 'm' || key === 'M') toggleMute();
}

function keyReleased() {
  if (keyCode === LEFT_ARROW)  leftPressed = false;
  if (keyCode === RIGHT_ARROW) rightPressed = false;
}

// ===== TOUCH =====
function touchStarted() {
  if (!gameStarted) return;
  return false;
}

function touchEnded() {
  return false;
}

// ===== SOM =====
let somMutado = false;

function toggleMute() {
  somMutado = !somMutado;
  somMutado ? getAudioContext().suspend() : getAudioContext().resume();

  const icon   = document.getElementById('mute-icon');
  const tIcon  = document.getElementById('touch-mute-icon');
  const button = document.getElementById('mute-button');
  const cls    = somMutado ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';

  if (icon)   icon.className  = cls;
  if (tIcon)  tIcon.className = cls;
  if (button) button.title    = somMutado ? "Ligar som" : "Desligar som";
}

// ===== PAUSE =====
function handlePauseToggle() {
  togglePause();
}

function togglePause() {
  jogoPausado = !jogoPausado;
  const status    = document.getElementById("pause-status");
  const toggle    = document.getElementById("pause-toggle");
  const pIcon     = document.getElementById("touch-pause-icon");

  if (jogoPausado) {
    noLoop();
    if (status) status.innerText = "Pausado";
    if (toggle) toggle.checked  = true;
    if (pIcon)  pIcon.className = 'fa-solid fa-play';
  } else {
    loop();
    if (status) status.innerText = "Jogando";
    if (toggle) toggle.checked  = false;
    if (pIcon)  pIcon.className = 'fa-solid fa-pause';
  }
}

// ===== INICIAR JOGO =====
function startGame() {
  document.body.classList.remove("inicio");
  document.body.classList.add("jogo");

  document.getElementById('start-screen').style.display      = 'none';
  document.getElementById('game-ui').style.display           = 'flex';
  document.getElementById('game-over-popup').style.display   = 'none';

  setTimeout(() => {
    document.getElementById('game-ui').classList.add('ui-visible');
    document.getElementById('game-canvas').classList.add('canvas-visible');
  }, 50);

  if (musicaFundo.isPlaying()) musicaFundo.stop();
  musicaFundo.loop();

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
  vidasDrop = [];
  flashFrames = 0;

  clearInterval(comidaInterval);
  clearInterval(ovoInterval);
  clearInterval(vidaInterval);

  comidaInterval = setInterval(() => {
    let newX = random(width - 40);
    if (podeNascer(newX, comidinhas, 100) && podeNascer(newX, ovos, 100) && random() < 0.5) {
      comidinhas.push({ x: newX, y: -random(40, 120) });
    }
  }, 1200);

  ovoInterval = setInterval(() => {
    let newX = random(width - 40);
    if (podeNascer(newX, ovos, 100) && podeNascer(newX, comidinhas, 100) && random() < 0.3) {
      ovos.push({ x: newX, y: -random(40, 120) });
    }
  }, 2000);

  vidaInterval = setInterval(() => {
    let newX = random(width - 40);
    if (random() < 0.2) {
      vidasDrop.push({ x: newX, y: -random(40, 120) });
    }
  }, 20000);

  loop();
  updateHUD();
  trocarTema();
}

function restartGame() { startGame(); }

// ===== GAME OVER =====
function gameOver() {
  noLoop();
  gameStarted = false;

  clearInterval(comidaInterval);
  clearInterval(ovoInterval);
  clearInterval(vidaInterval);

  comidinhas = [];
  ovos = [];
  vidasDrop = [];
  leftPressed  = false;
  rightPressed = false;
  capivaraX = width / 2 - 35;
  capivaraY = height - 70;

  if (musicaFundo && musicaFundo.isPlaying()) musicaFundo.stop();
  if (somGameOver) somGameOver.play();

  let best = Number(localStorage.getItem('bestScore') || 0);
  let novoRecorde = false;
  if (score > best) {
    best = score;
    localStorage.setItem('bestScore', best);
    novoRecorde = true;
  }

  updateHUD();

  document.getElementById('final-score').innerText = score;
  document.getElementById('final-best').innerText  = best;
  const badge = document.getElementById('new-record-badge');
  if (badge) badge.style.display = novoRecorde ? 'block' : 'none';

  document.getElementById('game-over-popup').style.display = 'flex';
}

// ===== HUD =====
function updateHUD() {
  const best = Number(localStorage.getItem('bestScore') || 0);

  // HUD top (mobile)
  const elScore = document.getElementById('hud-score');
  const elFase  = document.getElementById('hud-fase');
  const elBest  = document.getElementById('hud-best');
  if (elScore) elScore.innerText = score;
  if (elFase)  elFase.innerText  = fase;
  if (elBest)  elBest.innerText  = best;

  // Sidebar (desktop)
  const elScoreSide = document.getElementById('hud-score-side');
  const elFaseSide  = document.getElementById('hud-fase-side');
  const elBestSide  = document.getElementById('hud-best-side');
  if (elScoreSide) elScoreSide.innerText = score;
  if (elFaseSide)  elFaseSide.innerText  = fase;
  if (elBestSide)  elBestSide.innerText  = best;

  renderVidasHTML();
  updateFaseBar();
}

// ===== HELPERS =====
function collideRectRect(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

function podeNascer(xNovo, fila, minDist) {
  return !fila.some(item => Math.abs(item.x - xNovo) < minDist);
}

// ===== TEMAS =====
function trocarTema() {
  const tema   = document.getElementById('tema').value;
  const hud    = document.getElementById('right-bar');
  const left   = document.getElementById('left-bar');
  const body   = document.body;
  const hudTop = document.getElementById('game-header');

  if (tema === 'padrao') {
    if (fundoImg !== undefined) fundoImg = fundoPadrao;
    body.style.background     = '#fd7a00';
    if (hud)    { hud.style.color = '#003366'; hud.style.background = 'rgba(255,255,255,0.7)'; hud.style.borderColor = 'rgba(0,100,200,0.4)'; }
    if (left)   { left.style.color = '#003366'; left.style.background = 'rgba(230,247,255,0.6)'; }
    if (hudTop) { hudTop.style.background = 'rgba(0,0,0,0.35)'; }
  } else if (tema === 'noturno') {
    if (fundoImg !== undefined) fundoImg = fundoNoturno;
    body.style.background     = '#0d0d1a';
    if (hud)    { hud.style.color = '#fff'; hud.style.background = 'rgba(20,20,40,0.85)'; hud.style.borderColor = 'rgba(100,100,255,0.4)'; }
    if (left)   { left.style.color = '#aaa'; left.style.background = 'rgba(20,20,40,0.6)'; }
    if (hudTop) { hudTop.style.background = 'rgba(10,10,30,0.6)'; }
  } else if (tema === 'floresta') {
    if (fundoImg !== undefined) fundoImg = fundoFloresta;
    body.style.background     = '#1a3a1a';
    if (hud)    { hud.style.color = '#145c1b'; hud.style.background = 'rgba(7,92,7,0.7)'; hud.style.borderColor = 'rgba(7,180,7,0.5)'; }
    if (left)   { left.style.color = '#145c1b'; left.style.background = 'rgba(210,245,210,0.5)'; }
    if (hudTop) { hudTop.style.background = 'rgba(0,40,0,0.5)'; }
  }
}

function voltarParaInicio() {
  document.body.classList.remove("jogo");
  document.body.classList.add("inicio");
  document.getElementById('start-screen').style.display    = 'block';
  document.getElementById('game-ui').style.display         = 'none';
  document.getElementById('game-over-popup').style.display = 'none';
  document.getElementById('game-ui').classList.remove('ui-visible');
}

window.onload = trocarTema;
