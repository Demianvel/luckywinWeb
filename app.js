(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const menu = $('#menu');
  const mobileNav = $('#mobile-nav');
  const heroVisual = $('#hero-visual');
  const scene = $('.scene-3d');
  const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointerOK = window.matchMedia('(pointer: fine)').matches;

  const setMenu = (open) => {
    mobileNav?.classList.toggle('open', open);
    menu?.setAttribute('aria-expanded', String(open));
    menu?.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  };
  menu?.addEventListener('click', () => setMenu(!mobileNav?.classList.contains('open')));
  $$('.mobile-nav a').forEach((link) => link.addEventListener('click', () => setMenu(false)));

  if (scene && heroVisual && motionOK && pointerOK) {
    heroVisual.addEventListener('pointermove', (event) => {
      const rect = heroVisual.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      scene.style.transform = `rotateX(${-y * 4}deg) rotateY(${x * 5}deg)`;
    });
    heroVisual.addEventListener('pointerleave', () => { scene.style.transform = ''; });
  }

  const modal = $('#game-modal');
  const area = $('#game-area');
  const title = $('#modal-title');
  const close = $('#close-modal');
  const toast = $('#toast');
  let toastTimer;
  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  };
  const closeModal = () => { if (modal?.open) modal.close(); };
  close?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });

  const gameNames = {
    roulette: 'Neon Roulette', blackjack: 'Royal Blackjack', slots: 'Cosmic Slots', baccarat: 'Golden Baccarat',
    coinflip: 'Lucky Coinflip', crash: 'Velocity Crash', mines: 'Quantum Mines'
  };

  const roulette = () => {
    area.innerHTML = `<div class="mini-game"><p>Elegí un número y activá la simulación.</p><div class="result" id="rr">—</div><div class="game-controls">${[0,7,13,21,32].map((n) => `<button type="button" data-pick="${n}">${n}</button>`).join('')}<button class="primary" id="spin" type="button">Girar</button></div></div>`;
    let pick = null;
    $$('.game-controls [data-pick]', area).forEach((button) => button.addEventListener('click', () => { pick = button.dataset.pick; $('#rr', area).textContent = `Elegiste ${pick}`; }));
    $('#spin', area)?.addEventListener('click', () => { const result = [0,7,13,21,32,4,18,29][Math.floor(Math.random() * 8)]; $('#rr', area).textContent = `${result}${String(result) === pick ? ' · coincidencia demo' : ' · resultado demo'}`; });
  };

  const blackjack = () => {
    area.innerHTML = `<div class="mini-game"><p>Pedí cartas hasta acercarte a 21.</p><div class="result" id="bj">0</div><div class="game-controls"><button class="primary" id="hit" type="button">Pedir carta</button><button id="stand" type="button">Plantarse</button><button id="reset" type="button">Reiniciar</button></div></div>`;
    let total = 0;
    $('#hit', area)?.addEventListener('click', () => { if (total > 21) return; total += Math.floor(Math.random() * 10) + 2; $('#bj', area).textContent = total; if (total > 21) showToast('Pasaste 21 · ronda demo terminada'); });
    $('#stand', area)?.addEventListener('click', () => showToast(`Plantado en ${total} · resultado demo`));
    $('#reset', area)?.addEventListener('click', () => { total = 0; $('#bj', area).textContent = '0'; });
  };

  const slots = () => {
    area.innerHTML = `<div class="mini-game"><p>Tres símbolos. Una animación. Cero dinero real.</p><div class="slot-window"><span id="s1">7</span><span id="s2">7</span><span id="s3">7</span></div><button class="button button-gold" id="roll" type="button">Girar 777</button></div>`;
    const symbols = ['7', '★', '◆', '✦'];
    $('#roll', area)?.addEventListener('click', () => { ['s1', 's2', 's3'].forEach((id) => { $(`#${id}`, area).textContent = symbols[Math.floor(Math.random() * symbols.length)]; }); showToast('Resultado generado en modo demo'); });
  };

  const baccarat = () => {
    area.innerHTML = `<div class="mini-game"><p>Simulá una mano sin valor monetario.</p><div class="result" id="bc">—</div><div class="game-controls"><button class="primary" id="deal" type="button">Simular ronda</button></div></div>`;
    $('#deal', area)?.addEventListener('click', () => { $('#bc', area).textContent = ['PLAYER', 'BANKER', 'TIE'][Math.floor(Math.random() * 3)]; });
  };

  const coinflip = () => {
    area.innerHTML = `<div class="mini-game"><p>Elegí un lado y lanzá una moneda virtual.</p><div class="result" id="coin-result">—</div><div class="coin-controls"><button type="button" data-side="HEADS">HEADS</button><button type="button" data-side="TAILS">TAILS</button></div><button class="button button-gold" id="flip" type="button" style="margin-top:12px;width:100%">Lanzar moneda</button></div>`;
    let side = null;
    $$('[data-side]', area).forEach((button) => button.addEventListener('click', () => { side = button.dataset.side; $$('[data-side]', area).forEach((b) => b.classList.toggle('selected', b === button)); }));
    $('#flip', area)?.addEventListener('click', () => { const result = Math.random() < .5 ? 'HEADS' : 'TAILS'; $('#coin-result', area).textContent = `${result}${side ? result === side ? ' · acertaste' : ' · no coincidió' : ''}`; });
  };

  const crash = () => {
    area.innerHTML = `<div class="mini-game"><p>El multiplicador sube durante una simulación breve. No existe cashout real.</p><div class="crash-board"><div class="crash-line"></div><div class="crash-value" id="crash-value">1.00×</div></div><div class="game-controls"><button class="primary" id="crash-start" type="button">Iniciar ronda</button></div></div>`;
    let timer = null;
    let value = 1;
    $('#crash-start', area)?.addEventListener('click', () => {
      clearInterval(timer); value = 1; $('#crash-value', area).textContent = '1.00×';
      timer = setInterval(() => { value += .11 + Math.random() * .18; $('#crash-value', area).textContent = `${value.toFixed(2)}×`; if (value >= 3 + Math.random() * 2) { clearInterval(timer); showToast(`Ronda demo finalizada en ${value.toFixed(2)}×`); } }, 140);
    });
  };

  const mines = () => {
    const mineIndex = Math.floor(Math.random() * 25);
    area.innerHTML = `<div class="mini-game"><p>Descubrí casillas virtuales. Una mina termina la ronda.</p><div class="mine-board">${Array.from({length:25}, (_, i) => `<button class="mine-tile" type="button" data-mine-index="${i}">?</button>`).join('')}</div><div class="result" id="mine-result">0 gemas</div></div>`;
    let found = 0;
    $$('.mine-tile', area).forEach((button) => button.addEventListener('click', () => {
      if (button.disabled) return;
      button.disabled = true;
      const index = Number(button.dataset.mineIndex);
      if (index === mineIndex) { button.classList.add('mine'); button.textContent = '✦'; $$('.mine-tile', area).forEach((b) => { b.disabled = true; if (Number(b.dataset.mineIndex) === mineIndex) b.classList.add('mine'); }); $('#mine-result', area).textContent = `Mina · ${found} gemas`; showToast('Mina encontrada · demo terminada'); return; }
      found += 1; button.classList.add('revealed'); button.textContent = '◆'; $('#mine-result', area).textContent = `${found} gema${found === 1 ? '' : 's'}`;
    }));
  };

  const games = { roulette, blackjack, slots, baccarat, coinflip, crash, mines };
  const openGame = (type) => {
    if (!modal || !area || !title) return;
    title.textContent = gameNames[type] || 'LuckyWin Game';
    if (typeof modal.showModal === 'function') modal.showModal(); else modal.setAttribute('open', '');
    (games[type] || roulette)();
  };
  $$('[data-game]').forEach((button) => button.addEventListener('click', () => openGame(button.dataset.game)));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal(); });

  $$('.sports-tab').forEach((tab) => tab.addEventListener('click', () => { $$('.sports-tab').forEach((item) => item.classList.remove('active')); tab.classList.add('active'); showToast(`${tab.textContent} · cuotas demo cargadas`); }));
  $('#login')?.addEventListener('click', () => showToast('Autenticación de demostración · próximamente conectada al sistema privado'));
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
