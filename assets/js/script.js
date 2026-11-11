/* =========================================================
   TEXTOR – interações (JS puro)
   ========================================================= */
(() => {
  const WA = 'https://wa.me/message/HAZHLOVJ4FPEL1';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Logo: fallback pixel-art se a imagem não existir ---------- */
  const PIX = {
    N: '#0A2E5C', Y: '#F5B716', y: '#D99A00', B: '#9C5F2A', b: '#D9A066',
    c: '#F4D3A6', K: '#0A2E5C', W: '#FFFFFF', P: '#E85A4F', G: '#8A97A6', g: '#5E6B7A', H: '#7A4A22'
  };
  const MAP = [
    '.......NNNNNNN..........',
    '.....NNYYYYYYYNN........',
    '....NYYYYYyYYYYYN.......',
    '...NYYYYYYyYYYYYYN......',
    '..NNNNNNNNNNNNNNNNN..NNN.',
    '..NBBbbbbbbbbbbbBBN.NGGGN',
    '.NBBbbbbbbbbbbbbbBBNNGGGN',
    '.NBbbWKbbbbbbbWKbbBN.NgN.',
    '.NBbbKKbbbbbbbKKbbBN.NHN.',
    '.NBbbbbbbccccbbbbbBN.NHN.',
    '..NBbbbbcNNNcbbbbBN..NHN.',
    '..NBbbbbccNccbbbbBN.NNHN.',
    '...NBbbbbcPcbbbbBN.NbbHN.',
    '....NNbbbbPbbbbNN..NbbNN.',
    '.....NNNNNNNNNNN...NNN...'
  ];
  function pixelSVG() {
    const w = Math.max(...MAP.map(r => r.length)), h = MAP.length;
    let r = '';
    MAP.forEach((row, y) => [...row].forEach((ch, x) => {
      if (PIX[ch]) r += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${PIX[ch]}"/>`;
    }));
    return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${r}</svg>`;
  }
  function logoFallback(img) {
    const span = document.createElement('span');
    span.className = 'logo-fallback' +
      (img.dataset.logoSize === 'lg' ? ' is-lg' : '') +
      (img.dataset.logoVariant === 'light' ? ' is-light' : '');
    span.setAttribute('role', 'img');
    span.setAttribute('aria-label', img.alt || 'Textor Serviços Residenciais');
    span.innerHTML = pixelSVG() + '<span class="wm"><b>TEXTOR</b><em>SERVIÇOS RESIDENCIAIS</em></span>';
    if (img.dataset.logoSize === 'lg') span.style.fontSize = 'clamp(14px,4vw,22px)';
    img.replaceWith(span);
  }
  $$('img[data-logo]').forEach(img => {
    if (img.complete && img.naturalWidth === 0) logoFallback(img);
    else img.addEventListener('error', () => logoFallback(img), { once: true });
  });

  /* ---------- Navbar: scroll + menu mobile + link ativo ---------- */
  const nav = $('#nav'), burger = $('#burger'), menu = $('#mobileMenu');
  const onScrollNav = () => nav.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScrollNav, { passive: true }); onScrollNav();

  const toggleMenu = (open = !menu.classList.contains('is-open')) => {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };
  burger.addEventListener('click', () => toggleMenu());
  $$('a', menu).forEach(a => a.addEventListener('click', () => toggleMenu(false)));

  const navLinks = $$('.nav__links a');
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));

  /* ---------- Reveal on scroll (fade-up + stagger) ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add('is-in'); io.unobserve(el);
      // depois da entrada, devolve as transições de hover originais
      if (el.classList.contains('reveal')) {
        const d = (+el.style.getPropertyValue('--d') || 0) * 110 + 750;
        setTimeout(() => el.classList.remove('reveal'), d);
      }
    });
  }, { threshold: .14, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach((el, i) => {
    // stagger automático para itens irmãos sem --d explícito
    if (!el.style.getPropertyValue('--d') && el.parentElement) {
      const sibs = $$(':scope > .reveal', el.parentElement);
      el.style.setProperty('--d', sibs.indexOf(el));
    }
    io.observe(el);
  });
  $$('.section__head').forEach(h => io.observe(h)); // sublinhados animados

  /* ---------- Contadores ---------- */
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || '';
      const t0 = performance.now(), dur = reduced ? 1 : 1200;
      const tick = t => {
        const p = Math.min(1, (t - t0) / dur);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countIO.unobserve(el);
    });
  }, { threshold: .6 });
  $$('[data-count]').forEach(el => countIO.observe(el));

  /* ---------- Carrosséis dos cards de serviço ---------- */
  $$('[data-carousel]').forEach((c, ci) => {
    const track = $('.carousel__track', c), slides = $$('img', track), dots = $('.carousel__dots', c);
    let i = 0, timer;
    slides.forEach((_, n) => {
      const b = document.createElement('button');
      b.setAttribute('role', 'tab'); b.setAttribute('aria-label', `Foto ${n + 1}`);
      b.addEventListener('click', () => { go(n); restart(); });
      dots.appendChild(b);
    });
    const go = n => {
      i = (n + slides.length) % slides.length;
      track.style.transform = `translateX(${-i * 100}%)`;
      $$('button', dots).forEach((d, k) => d.setAttribute('aria-selected', k === i));
    };
    const restart = () => { clearInterval(timer); if (!reduced) timer = setInterval(() => go(i + 1), 3500); };
    $('.prev', c).addEventListener('click', () => { go(i - 1); restart(); });
    $('.next', c).addEventListener('click', () => { go(i + 1); restart(); });
    c.addEventListener('mouseenter', () => clearInterval(timer));
    c.addEventListener('mouseleave', restart);
    swipe(c, dir => { go(i + dir); restart(); });
    go(0);
    setTimeout(restart, ci * 700);
  });

  function swipe(el, cb) {
    let x0 = null, y0 = null;
    el.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    el.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) cb(dx < 0 ? 1 : -1);
      x0 = null;
    }, { passive: true });
  }

  /* ---------- Galeria + filtros ---------- */
  const WORKS = [
    { src: 'assets/img/servicos/redes-de-protecao/varanda-telada-e-gatinho-feliz.jpg', cat: 'pets', label: 'Pets & Redes', title: 'Varanda telada e gatinho feliz', desc: 'Tela de proteção preta de alta resistência: segurança total sem esconder a vista.' },
    { src: 'assets/img/servicos/montagem-e-instalacoes/oficina-planejada-completa.jpg', cat: 'instalacoes', label: 'Instalações & Móveis', title: 'Oficina planejada completa', desc: 'Bancadas metálicas, prateleiras, painéis OSB e iluminação em LED linear.', wide: true },
    { src: 'assets/img/servicos/ar-condicionado/higienizacao-de-condensadora.jpg', cat: 'clima', label: 'Climatização', title: 'Higienização de condensadora', desc: 'Limpeza profunda com equipamento de pressão para ar puro e mais eficiência.' },
    { src: 'assets/img/servicos/drywall-e-pintura/sala-em-drywall.jpg', cat: 'reformas', label: 'Reformas & Drywall', title: 'Sala em drywall', desc: 'Divisória com janela de vidro e porta de madeira, acabamento liso pronto para pintura.' },
    { src: 'assets/img/servicos/redes-de-protecao/rede-branca-na-fachada.jpg', cat: 'pets', label: 'Pets & Redes', title: 'Rede branca na fachada', desc: 'Instalação discreta e bem esticada que combina com a fachada.' },
    { src: 'assets/img/servicos/montagem-e-instalacoes/guarda-corpo-no-deck.jpg', cat: 'instalacoes', label: 'Instalações & Móveis', title: 'Guarda-corpo no deck', desc: 'Guarda-corpo metálico preto em deck de madeira envernizado com vista para a natureza.' },
    { src: 'assets/img/servicos/redes-de-protecao/soneca-garantida.jpg', cat: 'pets', label: 'Pets & Redes', title: 'Soneca garantida', desc: 'Parapeito protegido por rede preta — o gato dorme, o tutor relaxa.' },
    { src: 'assets/img/servicos/montagem-e-instalacoes/corrimao-em-escada-de-concreto.jpg', cat: 'instalacoes', label: 'Instalações & Móveis', title: 'Corrimão em escada de concreto', desc: 'Guarda-corpo e corrimão metálico preto com fixação estrutural segura.' },
    { src: 'assets/img/servicos/redes-de-protecao/janela-100-telada.jpg', cat: 'pets', label: 'Pets & Redes', title: 'Janela 100% telada', desc: 'Rede branca em toda a janela: o pet curte a vista do prédio em segurança.' },
    { src: 'assets/img/servicos/montagem-e-instalacoes/bancada-em-l-de-madeira.jpg', cat: 'instalacoes', label: 'Instalações & Móveis', title: 'Bancada em L de madeira', desc: 'Bancada sob medida com prateleiras superiores e iluminação LED.' },
    { src: 'assets/img/servicos/ar-condicionado/condensadora-na-fachada.jpg', cat: 'clima', label: 'Climatização', title: 'Condensadora na fachada', desc: 'Suporte nivelado, tubulação embutida em canaleta e acabamento limpo.' },
    { src: 'assets/img/servicos/drywall-e-pintura/ambientes-em-drywall.jpg', cat: 'reformas', label: 'Reformas & Drywall', title: 'Ambientes em drywall', desc: 'Paredes novas criando ambientes, prontas para receber massa e pintura.' },
    { src: 'assets/img/servicos/redes-de-protecao/sacada-liberada-para-o-gato.jpg', cat: 'pets', label: 'Pets & Redes', title: 'Sacada liberada para o gato', desc: 'Rede branca de alta resistência: o gato toma sol e a família fica tranquila.' },
    { src: 'assets/img/servicos/montagem-e-instalacoes/garagem-organizada.jpg', cat: 'instalacoes', label: 'Instalações & Móveis', title: 'Garagem organizada', desc: 'Bancada robusta, painel de ferramentas e enroladores fixados na parede.' },
    { src: 'assets/img/servicos/montagem-e-instalacoes/guarda-corpo-em-escada.jpg', cat: 'instalacoes', label: 'Instalações & Móveis', title: 'Guarda-corpo em escada', desc: 'Guarda-corpo preto com montantes alinhados acompanhando os degraus.' },
    { src: 'assets/img/servicos/ar-condicionado/duas-condensadoras.jpg', cat: 'clima', label: 'Climatização', title: 'Duas condensadoras', desc: 'Instalação de duas unidades externas lado a lado, com fixação firme.' },
    { src: 'assets/img/servicos/drywall-e-pintura/estrutura-de-drywall.jpg', cat: 'reformas', label: 'Reformas & Drywall', title: 'Estrutura de drywall', desc: 'Perfis metálicos alinhados a laser antes do fechamento com placas.' },
    { src: 'assets/img/servicos/montagem-e-instalacoes/prateleiras-de-madeira.jpg', cat: 'instalacoes', label: 'Instalações & Móveis', title: 'Prateleiras de madeira', desc: 'Prateleiras maciças com mãos-francesas, niveladas e bem fixadas.' },
    { src: 'assets/img/servicos/drywall-e-pintura/pintura-com-piso-protegido.jpg', cat: 'reformas', label: 'Reformas & Drywall', title: 'Pintura com piso protegido', desc: 'Lona no chão e recortes precisos: pintura sem sujeira pela casa.' },
    { src: 'assets/img/servicos/redes-de-protecao/sacada-alta-telada.jpg', cat: 'pets', label: 'Pets & Redes', title: 'Sacada alta telada', desc: 'Proteção completa em sacada de andar alto, sem perder a vista.' },
    { src: 'assets/img/servicos/montagem-e-instalacoes/cantinho-de-trabalho.jpg', cat: 'instalacoes', label: 'Instalações & Móveis', title: 'Cantinho de trabalho', desc: 'Bancada em L com painel perfurado e nichos para ferramentas.' },
    { src: 'assets/img/servicos/ar-condicionado/condensadora-no-alto.jpg', cat: 'clima', label: 'Climatização', title: 'Condensadora no alto', desc: 'Instalação em altura com suporte reforçado e segurança.' },
    { src: 'assets/img/servicos/montagem-e-instalacoes/guarda-corpo-branco-na-varanda.jpg', cat: 'instalacoes', label: 'Instalações & Móveis', title: 'Guarda-corpo branco na varanda', desc: 'Guarda-corpo branco instalado em varanda com piso porcelanato.' },
    { src: 'assets/img/servicos/drywall-e-pintura/parede-em-drywall.jpg', cat: 'reformas', label: 'Reformas & Drywall', title: 'Parede em drywall', desc: 'Fechamento em placas com juntas alinhadas, pronta para o acabamento.' },
    { src: 'assets/img/servicos/montagem-e-instalacoes/bancada-com-painel-osb.jpg', cat: 'instalacoes', label: 'Instalações & Móveis', title: 'Bancada com painel OSB', desc: 'Bancada de madeira com painel OSB e iluminação para o hobby.' },
    { src: 'assets/img/servicos/ar-condicionado/manutencao-da-evaporadora.jpg', cat: 'clima', label: 'Climatização', title: 'Manutenção da evaporadora', desc: 'Evaporadora aberta para limpeza e revisão dos componentes.' },
    { src: 'assets/img/servicos/montagem-e-instalacoes/guarda-corpo-com-tela-metalica.jpg', cat: 'instalacoes', label: 'Instalações & Móveis', title: 'Guarda-corpo com tela metálica', desc: 'Guarda-corpo industrial com tela expandida em mezanino.' },
    { src: 'assets/img/servicos/drywall-e-pintura/pintura-finalizada.jpg', cat: 'reformas', label: 'Reformas & Drywall', title: 'Pintura finalizada', desc: 'Ambiente pintado com cor uniforme e moldura de gesso no teto.' },
    { src: 'assets/img/servicos/montagem-e-instalacoes/guarda-corpo-no-mezanino.jpg', cat: 'instalacoes', label: 'Instalações & Móveis', title: 'Guarda-corpo no mezanino', desc: 'Guarda-corpo preto acompanhando a escada até o andar de cima.' },
    { src: 'assets/img/servicos/ar-condicionado/instalacao-sobre-telhado.jpg', cat: 'clima', label: 'Climatização', title: 'Instalação sobre telhado', desc: 'Condensadora instalada junto à janela com tubulação embutida.' },
    { src: 'assets/img/servicos/drywall-e-pintura/divisorias-estruturadas.jpg', cat: 'reformas', label: 'Reformas & Drywall', title: 'Divisórias estruturadas', desc: 'Perfis metálicos montados para criar novas salas.' },
    { src: 'assets/img/servicos/montagem-e-instalacoes/montagem-de-armario.jpg', cat: 'instalacoes', label: 'Instalações & Móveis', title: 'Montagem de armário', desc: 'Ajuste fino de dobradiças para portas alinhadas e sem folga.' },
    { src: 'assets/img/servicos/montagem-e-instalacoes/corrimao-em-escada-escura.jpg', cat: 'instalacoes', label: 'Instalações & Móveis', title: 'Corrimão em escada escura', desc: 'Guarda-corpo metálico combinando com os degraus escuros.' },
    { src: 'assets/img/servicos/ar-condicionado/condensadora-em-area-tecnica.jpg', cat: 'clima', label: 'Climatização', title: 'Condensadora em área técnica', desc: 'Unidade externa instalada em espaço compacto com acabamento limpo.' },
    { src: 'assets/img/servicos/montagem-e-instalacoes/corrimao-de-inox.jpg', cat: 'instalacoes', label: 'Instalações & Móveis', title: 'Corrimão de inox', desc: 'Corrimão fixado na parede da escada: segurança no dia a dia.' },
    { src: 'assets/img/servicos/drywall-e-pintura/divisoria-com-vidro.jpg', cat: 'reformas', label: 'Reformas & Drywall', title: 'Divisória com vidro', desc: 'Estrutura para divisória com porta e visor de vidro.' },
    { src: 'assets/img/servicos/montagem-e-instalacoes/guarda-corpo-em-vao-de-escada.jpg', cat: 'instalacoes', label: 'Instalações & Móveis', title: 'Guarda-corpo em vão de escada', desc: 'Proteção metálica no vão da escada com piso de mármore.' },
    { src: 'assets/img/servicos/ar-condicionado/ar-condicionado-no-corredor.jpg', cat: 'clima', label: 'Climatização', title: 'Ar-condicionado no corredor', desc: 'Evaporadora instalada no alto, com tubulação discreta.' },
    { src: 'assets/img/servicos/drywall-e-pintura/perfis-de-drywall.jpg', cat: 'reformas', label: 'Reformas & Drywall', title: 'Perfis de drywall', desc: 'Montantes aprumados do piso ao forro.' }
  ];
  const gallery = $('#gallery');
  gallery.innerHTML = WORKS.map((w, n) => `
    <figure class="g-item${w.wide ? ' is-wide' : ''}" data-cat="${w.cat}" data-i="${n}" tabindex="0" role="button" aria-label="Ampliar foto: ${w.title}">
      <img src="${w.src}" alt="${w.title} – ${w.desc}" loading="lazy">
      <span class="g-item__zoom" aria-hidden="true">🔍</span>
      <figcaption class="g-item__cap">
        <span class="cat">${w.label}</span>
        <h3>${w.title}</h3>
        <p>${w.desc}</p>
        <a href="${WA}" target="_blank" rel="noopener" class="btn btn--accent">Quero um resultado assim</a>
      </figcaption>
    </figure>`).join('');

  const items = $$('.g-item', gallery);
  const moreBtn = $('#galleryMore');
  const STEP = () => (innerWidth >= 1024 ? 12 : innerWidth >= 700 ? 8 : 10);
  let visible = [], filter = 'all', limit = STEP(), shownCount = 0;

  // contador de fotos em cada aba
  $$('.filter').forEach(b => {
    const n = b.dataset.filter === 'all' ? WORKS.length : WORKS.filter(w => w.cat === b.dataset.filter).length;
    b.insertAdjacentHTML('beforeend', ` <span class="filter__n">${n}</span>`);
  });

  function render(animateFrom = 0) {
    visible = items.filter(it => filter === 'all' || it.dataset.cat === filter);
    items.forEach(it => it.classList.add('is-hidden'));
    // "limit" conta espaços do grid (foto larga = 2), para fechar linhas completas
    const wideOn = filter === 'all' && innerWidth >= 1024;
    let slots = 0, shown = 0;
    visible.forEach((it, k) => {
      const size = wideOn && WORKS[it.dataset.i].wide ? 2 : 1;
      const show = slots + size <= limit;
      if (show) { slots += size; shown++; }
      it.classList.toggle('is-hidden', !show);
      it.classList.toggle('is-wide', filter === 'all' && WORKS[it.dataset.i].wide === true);
      if (show && k >= animateFrom) {
        it.classList.remove('is-entering'); void it.offsetWidth;
        it.classList.add('is-entering'); it.style.animationDelay = (k - animateFrom) * 50 + 'ms';
      }
    });
    shownCount = shown;
    const rest = visible.length - shown;
    moreBtn.hidden = rest <= 0;
    moreBtn.textContent = `Ver mais trabalhos (+${rest})`;
  }

  $$('.filter').forEach(btn => btn.addEventListener('click', () => {
    $$('.filter').forEach(b => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-selected', b === btn); });
    filter = btn.dataset.filter; limit = STEP();
    render();
    gallery.scrollTo({ left: 0, behavior: 'smooth' });
    btn.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }));
  moreBtn.addEventListener('click', () => {
    const from = shownCount; limit += STEP(); render(from);
    if (innerWidth < 700 && visible[from]) gallery.scrollTo({ left: visible[from].offsetLeft - 16, behavior: 'smooth' });
  });
  render();

  /* ---------- Avaliações ----------
     Somente avaliações REAIS de clientes. Para adicionar uma nova,
     copie o modelo abaixo e preencha com os dados da avaliação:
     { name: 'Nome', date: 'AAAA-MM-DD', stars: 5, text: 'Texto exatamente como o cliente escreveu.', service: 'Serviço (opcional)' },
  */
  const REVIEWS = [
    { name: 'Cauã', date: '2026-11-06', stars: 5, text: 'Elizeu é um rapaz muito legal e rápido no serviço, fez tudo de forma muito profissional e claramente sabia o que estava fazendo. Excelente profissional.' }
  ];

  /* EXEMPLOS FICTÍCIOS – só para apresentar o layout ao cliente.
     Aparecem SOMENTE abrindo a página com ?exemplo no endereço
     (ex.: index.html?exemplo) e sempre com a etiqueta "Exemplo".
     Apague esta lista quando houver avaliações reais suficientes. */
  const DEMO = new URLSearchParams(location.search).has('exemplo');
  const EXAMPLE_REVIEWS = [
    { name: 'Mariana', date: '2026-10-28', stars: 5, service: 'Rede de proteção', text: 'Instalaram a rede na sacada e nas janelas do quarto. Trabalho caprichado, rede bem esticada e quase não dá pra ver. Agora meus dois gatos ficam na sacada e eu fico tranquila.' },
    { name: 'Rafael', date: '2026-10-15', stars: 5, service: 'Ar-condicionado', text: 'Fizeram a higienização dos dois aparelhos aqui de casa. Chegaram no horário, forraram tudo e não ficou sujeira nenhuma. O ar voltou a gelar como novo.' },
    { name: 'Juliana', date: '2026-09-30', stars: 5, service: 'Montagem de móveis', text: 'Montaram o guarda-roupa e a cômoda do quarto do meu filho em uma manhã. Tudo nivelado, portas alinhadas e ainda levaram as caixas embora. Recomendo demais!' },
    { name: 'Carlos', date: '2026-09-12', stars: 5, service: 'Drywall', text: 'Fizeram uma parede de drywall para dividir a sala e criar um escritório. Orçamento justo, cumpriram o prazo e o acabamento ficou perfeito para pintar.' },
    { name: 'Patrícia', date: '2026-08-22', stars: 4, service: 'Instalações', text: 'Instalaram o corrimão da escada e as cortinas da sala. Serviço bem feito e equipe educada. Só demorou um pouco para conseguir horário, mas valeu a espera.' }
  ];
  const ALL_REVIEWS = DEMO ? REVIEWS.concat(EXAMPLE_REVIEWS.map(r => ({ ...r, example: true }))) : REVIEWS;
  const reviewsEl = $('#reviews');
  const esc = t => String(t).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const fmtDate = d => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  reviewsEl.innerHTML = ALL_REVIEWS.map((r, k) => `
    <figure class="card review reveal${r.example ? ' is-example' : ''}" style="--d:${k % 3}">
      ${r.example ? '<span class="review__example">Exemplo</span>' : ''}
      <span class="review__quote" aria-hidden="true">“</span>
      <span class="review__heart" aria-hidden="true">♥</span>
      <div class="review__stars" role="img" aria-label="${r.stars} de 5 estrelas">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</div>
      <blockquote>${esc(r.text)}</blockquote>
      <figcaption>
        <span class="review__avatar" aria-hidden="true">${esc(r.name.trim()[0].toUpperCase())}</span>
        <span class="review__who">
          <strong>${esc(r.name)} <span class="review__verified">✓ Cliente</span></strong>
          <span>${r.service ? esc(r.service) + ' · ' : ''}${fmtDate(r.date)}</span>
        </span>
      </figcaption>
    </figure>`).join('') + `
    <div class="card review review--invite reveal" style="--d:${ALL_REVIEWS.length % 3}">
      <span class="review__paw" aria-hidden="true">🐾</span>
      <h3>Já contratou a Textor?</h3>
      <p>Conta pra gente como foi! Sua avaliação ajuda outras famílias a escolherem com segurança.</p>
      <a href="${WA}" target="_blank" rel="noopener" class="btn btn--accent">Deixar minha avaliação</a>
    </div>`;
  reviewsEl.classList.toggle('has-many', ALL_REVIEWS.length >= 2);
  if (DEMO) reviewsEl.insertAdjacentHTML('beforebegin', '<p class="demo-banner">⚠️ Modo de apresentação: os depoimentos marcados como <b>Exemplo</b> são fictícios e só aparecem com <code>?exemplo</code> no endereço.</p>');
  $$('.reveal', reviewsEl).forEach(el => io.observe(el));

  /* ---------- Lightbox ---------- */
  const lb = $('#lightbox'), lbImg = $('#lbImg');
  let cur = 0, lastFocus = null;
  const show = k => {
    cur = (k + visible.length) % visible.length;
    const w = WORKS[visible[cur].dataset.i];
    lbImg.src = w.src; lbImg.alt = w.title;
    $('#lbTitle').textContent = w.title;
    $('#lbDesc').textContent = w.desc;
    $('#lbCount').textContent = `${cur + 1} / ${visible.length}`;
  };
  const openLB = it => {
    lastFocus = document.activeElement;
    show(visible.indexOf(it));
    lb.hidden = false;
    requestAnimationFrame(() => lb.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
    $('.lightbox__close', lb).focus();
  };
  const closeLB = () => {
    lb.classList.remove('is-open');
    setTimeout(() => { lb.hidden = true; }, 300);
    document.body.style.overflow = '';
    lastFocus && lastFocus.focus();
  };
  items.forEach(it => {
    it.addEventListener('click', e => { if (!e.target.closest('a')) openLB(it); });
    it.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLB(it); } });
  });
  $('.lightbox__close', lb).addEventListener('click', closeLB);
  $('.lightbox__nav.prev', lb).addEventListener('click', () => show(cur - 1));
  $('.lightbox__nav.next', lb).addEventListener('click', () => show(cur + 1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLB(); });
  addEventListener('keydown', e => {
    if (lb.hidden) { if (e.key === 'Escape' && menu.classList.contains('is-open')) toggleMenu(false); return; }
    if (e.key === 'Escape') closeLB();
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
    if (e.key === 'Tab') { // focus trap
      const f = $$('button, a', lb), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  swipe(lb, dir => show(cur + dir));

  /* ---------- Linha "Como funciona" preenchendo com o scroll ---------- */
  const stepsEl = $('#steps'), steps = $$('.step', stepsEl), line = $('.steps__line', stepsEl);
  const onScrollSteps = () => {
    const r = stepsEl.getBoundingClientRect(), vh = innerHeight;
    const p = Math.min(1, Math.max(0, (vh * .75 - r.top) / (r.height * .9)));
    line.style.setProperty('--p', p.toFixed(3));
    steps.forEach((s, k) => s.classList.toggle('is-lit', p >= k / (steps.length - 1) - .02));
  };
  addEventListener('scroll', onScrollSteps, { passive: true });
  addEventListener('resize', onScrollSteps); onScrollSteps();

  /* ---------- Balão do WhatsApp flutuante ---------- */
  const bubble = $('#fabBubble');
  bubble.classList.add('is-hidden');
  setTimeout(() => { if (!sessionStorageGet('fabClosed')) bubble.classList.remove('is-hidden'); }, 2500);
  $('#fabClose').addEventListener('click', () => { bubble.classList.add('is-hidden'); sessionStorageSet('fabClosed', 1); });
  function sessionStorageGet(k) { try { return sessionStorage.getItem(k); } catch { return null; } }
  function sessionStorageSet(k, v) { try { sessionStorage.setItem(k, v); } catch {} }

  $('#year').textContent = new Date().getFullYear();
})();
