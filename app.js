(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const menu = $('#menu');
  const mobileNav = $('#mobile-nav');
  const heroVisual = $('#hero-visual');
  const scene = $('.scene-3d');

  // Mobile navigation
  const setMenu = (open) => {
    mobileNav?.classList.toggle('open', open);
    menu?.setAttribute('aria-expanded', String(open));
    menu?.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  };
  menu?.addEventListener('click', () => setMenu(!mobileNav?.classList.contains('open')));
  $$('.mobile-nav a').forEach((link) => link.addEventListener('click', () => setMenu(false)));

  // Subtle real-time 3D tilt. Disabled on touch/reduced-motion for stability and battery.
  const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointerOK = window.matchMedia('(pointer: fine)').matches;
  if (scene && heroVisual && motionOK && pointerOK) {
    heroVisual.addEventListener('pointermove', (event) => {
      const rect = heroVisual.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      scene.style.transform = `rotateX(${-y * 4}deg) rotateY(${x * 5}deg)`;
    });
    heroVisual.addEventListener('pointerleave', () => { scene.style.transform = ''; });
  }

  // Demo game modal
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

  const closeModal = () => {
    if (modal?.open) modal.close();
  };
  close?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });

  const gameNames = {
    roulette: 'Neon Roulette',
    blackjack: 'Royal Blackjack',
    slots: 'Cosmic Slots',
    baccarat: 'Golden Baccarat'
  };

  const roulette = () => {
    area.innerHTML = `<div class="mini-game"><p>Elegí un número y activá la simulación.</p><div class="result" id="rr">—</div><div class="game-controls">${[0,7,13,21,32].map((n) => `<button type="button" data-pick="${n}">${n}</button>`).join('')}<button class="primary" id="spin" type="button">Girar</button></div></div>`;
    let pick = null;
    $$('.game-controls [data-pick]', area).forEach((button) => button.addEventListener('click', () => {
      pick = button.dataset.pick;
      $('#rr', area).textContent = `Elegiste ${pick}`;
    }));
    $('#spin', area)?.addEventListener('click', () => {
      const result = [0,7,13,21,32,4,18,29][Math.floor(Math.random() * 8)];
      $('#rr', area).textContent = `${result}${String(result) === pick ? ' · coincidencia demo' : ' · resultado demo'}`;
    });
  };

  const blackjack = () => {
    area.innerHTML = `<div class="mini-game"><p>Pedí cartas hasta acercarte a 21.</p><div class="result" id="bj">0</div><div class="game-controls"><button class="primary" id="hit" type="button">Pedir carta</button><button id="stand" type="button">Plantarse</button><button id="reset" type="button">Reiniciar</button></div></div>`;
    let total = 0;
    $('#hit', area)?.addEventListener('click', () => {
      if (total > 21) return;
      total += Math.floor(Math.random() * 10) + 2;
      $('#bj', area).textContent = total;
      if (total > 21) showToast('Pasaste 21 · ronda demo terminada');
    });
    $('#stand', area)?.addEventListener('click', () => showToast(`Plantado en ${total} · resultado demo`));
    $('#reset', area)?.addEventListener('click', () => { total = 0; $('#bj', area).textContent = '0'; });
  };

  const slots = () => {
    area.innerHTML = `<div class="mini-game"><p>Tres símbolos. Una animación. Cero dinero real.</p><div class="slot-window"><span id="s1">7</span><span id="s2">7</span><span id="s3">7</span></div><button class="button button-gold" id="roll" type="button">Girar 777</button></div>`;
    const symbols = ['7', '★', '◆', '✦'];
    $('#roll', area)?.addEventListener('click', () => {
      ['s1', 's2', 's3'].forEach((id) => { $(`#${id}`, area).textContent = symbols[Math.floor(Math.random() * symbols.length)]; });
      showToast('Resultado generado en modo demo');
    });
  };

  const baccarat = () => {
    area.innerHTML = `<div class="mini-game"><p>Simulá una mano sin valor monetario.</p><div class="result" id="bc">—</div><div class="game-controls"><button class="primary" id="deal" type="button">Simular ronda</button></div></div>`;
    $('#deal', area)?.addEventListener('click', () => { $('#bc', area).textContent = ['PLAYER', 'BANKER', 'TIE'][Math.floor(Math.random() * 3)]; });
  };

  const openGame = (type) => {
    if (!modal || !area || !title) return;
    title.textContent = gameNames[type] || 'LuckyWin Game';
    if (typeof modal.showModal === 'function') modal.showModal();
    else modal.setAttribute('open', '');
    ({ roulette, blackjack, slots, baccarat }[type] || roulette)();
  };

  $$('[data-game]').forEach((button) => button.addEventListener('click', () => openGame(button.dataset.game)));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal(); });

  // Keep the demo clearly virtual and update the footer year automatically.
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();