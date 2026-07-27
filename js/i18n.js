var I18N = (function() {
  var currentLang = 'es';
  var translations = {};
  var loadedLangs = {};

  var supportedLangs = ['es', 'en', 'pt', 'it'];
  var langMeta = {
    es: { dir: 'ltr', ogLocale: 'es_ES' },
    en: { dir: 'ltr', ogLocale: 'en_US' },
    pt: { dir: 'ltr', ogLocale: 'pt_BR' },
    it: { dir: 'ltr', ogLocale: 'it_IT' }
  };

  function getInitialLang() {
    var hash = window.location.hash.replace('#', '');
    if (hash && supportedLangs.indexOf(hash) !== -1) return hash;
    var stored = localStorage.getItem('lang');
    if (stored && supportedLangs.indexOf(stored) !== -1) return stored;
    var nav = (navigator.language || '').slice(0, 2).toLowerCase();
    if (supportedLangs.indexOf(nav) !== -1) return nav;
    return 'es';
  }

  function loadLanguage(lang) {
    if (loadedLangs[lang]) return Promise.resolve(loadedLangs[lang]);
    return fetch('locales/' + lang + '.json')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        loadedLangs[lang] = data;
        return data;
      });
  }

  function resolve(key, data) {
    var parts = key.split('.');
    var val = data;
    for (var i = 0; i < parts.length; i++) {
      if (val == null) return undefined;
      val = val[parts[i]];
    }
    return val;
  }

  function setMeta(data) {
    if (data.meta) {
      document.title = data.meta.title || document.title;
      var desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute('content', data.meta.description);
      var ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', data.meta.og_title);
      var ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', data.meta.og_description);
      var twTitle = document.querySelector('meta[name="twitter:title"]');
      if (twTitle) twTitle.setAttribute('content', data.meta.og_title);
      var twDesc = document.querySelector('meta[name="twitter:description"]');
      if (twDesc) twDesc.setAttribute('content', data.meta.og_description);
    }
  }

  function setOgLocale(lang) {
    var meta = langMeta[lang] || langMeta.es;
    var ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) ogLocale.setAttribute('content', meta.ogLocale);
  }

  function translateElement(el, data) {
    var key = el.getAttribute('data-i18n');
    if (!key) return;
    var val = resolve(key, data);
    if (val === undefined || val === null) return;
    if (typeof val === 'string') {
      el.textContent = val;
    }
  }

  function translateHtml(el, data) {
    var key = el.getAttribute('data-i18n-html');
    if (!key) return;
    var val = resolve(key, data);
    if (val === undefined || val === null) return;
    if (typeof val === 'string') {
      el.innerHTML = val;
    }
  }

  function translateToc(data) {
    if (!data.toc) return;
    var tocLinks = document.querySelectorAll('.toc a');
    tocLinks.forEach(function(link, i) {
      if (data.toc[i]) {
        link.textContent = data.toc[i];
      }
    });
  }

  function translateRisks(data) {
    if (!data.risks) return;
    var riskKeys = ['sextortion', 'scams', 'extortion', 'reputation', 'financial', 'trauma', 'doxing', 'sabotage', 'nonconsensual', 'consensual_risks', 'deepfakes', 'deepfake_threats'];
    riskKeys.forEach(function(rKey) {
      var item = data.risks[rKey];
      if (!item) return;
      var card = document.querySelector('[data-risk="' + rKey + '"]');
      if (!card) return;
      var h3 = card.querySelector('h3');
      if (h3) h3.textContent = item.title;
      var p = card.querySelector('p');
      if (p) p.textContent = item.desc;
      var extra = card.querySelector('.extra');
      if (extra) extra.innerHTML = item.extra;
    });
  }

  function translateTactics(data) {
    if (!data.tactics) return;
    var tacticsKeys = ['grooming', 'reciprocity', 'time_pressure', 'platform_hopping', 'contacts', 'love_bombing', 'emergencies', 'apps', 'synthetic'];
    tacticsKeys.forEach(function(tKey) {
      var el = document.querySelector('[data-tactic="' + tKey + '"]');
      if (el && data.tactics[tKey]) {
        var strong = el.querySelector('strong');
        var text = data.tactics[tKey];
        if (strong) {
          var strongText = strong.textContent;
          el.innerHTML = '';
          var newStrong = document.createElement('strong');
          var parts = text.split(' — ');
          newStrong.textContent = parts[0];
          el.appendChild(newStrong);
          if (parts[1]) {
            el.appendChild(document.createTextNode(' — ' + parts[1]));
          }
        } else {
          el.textContent = text;
        }
      }
    });
  }

  function translatePlaybook(data) {
    if (!data.playbook) return;
    for (var i = 1; i <= 5; i++) {
      var step = document.querySelector('[data-playbook="' + i + '"]');
      if (!step) continue;
      var h3 = step.querySelector('h3');
      var p = step.querySelector('p');
      if (h3 && data.playbook['step' + i + '_title']) h3.textContent = data.playbook['step' + i + '_title'];
      if (p && data.playbook['step' + i + '_desc']) p.textContent = data.playbook['step' + i + '_desc'];
    }
  }

  function translateProtect(data) {
    if (!data.protect) return;
    var protectKeys = ['pause', 'anon', 'accounts', 'verify', 'paying', 'report', 'support', 'encrypt', 'credit', 'laws', 'identity', 'instinct'];
    protectKeys.forEach(function(pKey) {
      var li = document.querySelector('[data-protect="' + pKey + '"]');
      if (li && data.protect[pKey]) {
        var text = data.protect[pKey];
        var parts = text.split(' — ');
        li.innerHTML = '';
        var icon = document.createElement('span');
        icon.className = 'picon';
        icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
        li.appendChild(icon);
        var strong = document.createElement('strong');
        strong.textContent = parts[0];
        li.appendChild(strong);
        if (parts[1]) {
          li.appendChild(document.createTextNode(' — ' + parts[1]));
        }
      }
    });
  }

  function translateResponse(data) {
    if (!data.response) return;
    for (var i = 1; i <= 6; i++) {
      var li = document.querySelector('[data-response="' + i + '"]');
      if (li && data.response['step' + i]) {
        li.textContent = data.response['step' + i];
      }
    }
  }

  function translateLegal(data) {
    if (!data.legal) return;
    var legalKeys = ['us', 'uk', 'canada', 'spain', 'italy', 'mexico', 'argentina', 'chile', 'colombia', 'peru', 'international', 'deepfakes'];
    legalKeys.forEach(function(lKey) {
      var li = document.querySelector('[data-legal="' + lKey + '"]');
      if (li && data.legal[lKey]) {
        li.textContent = data.legal[lKey];
      }
    });
    var rights = document.querySelector('[data-legal="rights"]');
    if (rights && data.legal.rights) rights.textContent = data.legal.rights;
    var important = document.querySelector('[data-legal="important"]');
    if (important && data.legal.important) important.textContent = data.legal.important;
  }

  function translateTestimonials(data) {
    if (!data.testimonials) return;
    for (var i = 1; i <= 6; i++) {
      var card = document.querySelector('[data-story="' + i + '"]');
      if (!card) continue;
      var badge = card.querySelector('.story-badge');
      var quote = card.querySelector('blockquote');
      var attr = card.querySelector('.attribution');
      var link = card.querySelector('.source-link');
      if (badge && data.testimonials['s' + i + '_badge']) badge.textContent = data.testimonials['s' + i + '_badge'];
      if (quote && data.testimonials['s' + i + '_quote']) quote.textContent = data.testimonials['s' + i + '_quote'];
      if (attr && data.testimonials['s' + i + '_attr']) attr.textContent = data.testimonials['s' + i + '_attr'];
      if (link) {
        if (data.testimonials['s' + i + '_source']) link.textContent = data.testimonials['s' + i + '_source'];
        if (data.testimonials['s' + i + '_url']) link.href = data.testimonials['s' + i + '_url'];
      }
    }
  }

  function translateFooter(data) {
    if (!data.footer) return;
    var src = document.getElementById('footer-source');
    var crisis = document.getElementById('footer-crisis');
    if (src && data.footer.source) src.textContent = data.footer.source;
    if (crisis && data.footer.crisis) crisis.textContent = data.footer.crisis;
  }

  function translateCrisis(data) {
    if (!data.crisis) return;
    var container = document.getElementById('crisisNumbers');
    if (!container) return;
    var html = '';
    data.crisis.lines.forEach(function(line) {
      if (line.url) {
        html += '<p><strong>' + line.country + ':</strong> <a href="' + line.url + '" target="_blank" rel="noopener">' + line.name + '</a></p>';
      } else {
        html += '<p><strong>' + line.country + ':</strong> <a href="tel:' + line.number.replace(/\s/g, '') + '">' + line.number + '</a> ' + line.name + '</p>';
      }
    });
    container.innerHTML = html;
  }

  function translateToggle(data) {
    if (!data.toggle) return;
    var btns = document.querySelectorAll('.toggle-link');
    btns.forEach(function(btn) {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.textContent = expanded ? data.toggle.less : data.toggle.more;
    });
  }

  function applyTranslation(data) {
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      translateElement(el, data);
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function(el) {
      translateHtml(el, data);
    });
    translateToc(data);
    translateRisks(data);
    translateTactics(data);
    translatePlaybook(data);
    translateProtect(data);
    translateResponse(data);
    translateLegal(data);
    translateTestimonials(data);
    translateFooter(data);
    translateCrisis(data);
    translateToggle(data);
    setMeta(data);
    setOgLocale(currentLang);
  }

  function setLanguage(lang) {
    if (supportedLangs.indexOf(lang) === -1) return;
    currentLang = lang;
    localStorage.setItem('lang', lang);
    window.location.hash = lang;
    document.documentElement.setAttribute('lang', lang);
    document.querySelectorAll('.lang-group button').forEach(function(b) {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    var activeBtn = document.getElementById('l-' + lang);
    if (activeBtn) {
      activeBtn.classList.add('active');
      activeBtn.setAttribute('aria-pressed', 'true');
    }
    loadLanguage(lang).then(function(data) {
      applyTranslation(data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function init() {
    currentLang = getInitialLang();
    document.documentElement.setAttribute('lang', currentLang);
    window.location.hash = currentLang;
    var activeBtn = document.getElementById('l-' + currentLang);
    if (activeBtn) {
      activeBtn.classList.add('active');
      activeBtn.setAttribute('aria-pressed', 'true');
    }
    loadLanguage(currentLang).then(function(data) {
      applyTranslation(data);
    });

    document.querySelectorAll('.lang-group button').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var lang = this.id.replace('l-', '');
        setLanguage(lang);
      });
    });
  }

  return {
    init: init,
    setLanguage: setLanguage,
    getCurrentLang: function() { return currentLang; },
    t: function(key) {
      var data = loadedLangs[currentLang];
      return data ? resolve(key, data) : key;
    }
  };
})();

var isTransitioning = false;

function toggleTheme() {
  var d = document.documentElement;
  var next = d.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  d.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  document.getElementById('themeBtn').textContent = next === 'dark' ? '\u{1F319}' : '\u2600\u{FE0F}';
}

function toggleExtra(btn) {
  var extra = btn.parentNode.querySelector('.extra');
  extra.classList.toggle('show');
  var expanded = extra.classList.contains('show');
  var t = I18N.t('toggle');
  if (t) {
    btn.textContent = expanded ? t.less : t.more;
  } else {
    btn.textContent = expanded ? '\u2212 Less' : '+ More';
  }
  btn.setAttribute('aria-expanded', expanded);
}

document.addEventListener('DOMContentLoaded', function() {
  I18N.init();

  var theme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('themeBtn').textContent = theme === 'dark' ? '\u{1F319}' : '\u2600\u{FE0F}';

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.animate').forEach(function(el) { observer.observe(el); });

  var bar = document.getElementById('progressBar');
  window.addEventListener('scroll', function() {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = progress + '%';
  });

  var canvas = document.getElementById('particle-canvas');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var particles = [];
    var W, H;

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    var spacing = 28;
    var cols = Math.ceil(W / spacing) + 1;
    var rows = Math.ceil(H / spacing) + 1;
    for (var i = 0; i < cols * rows; i++) {
      var col = i % cols;
      var row = Math.floor(i / cols);
      particles.push({
        x: col * spacing + (Math.random() - 0.5) * 4,
        y: row * spacing + (Math.random() - 0.5) * 4,
        baseX: col * spacing,
        baseY: row * spacing,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.4
      });
    }

    var time = 0;
    function animate() {
      time += 0.008;
      ctx.clearRect(0, 0, W, H);
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      var alpha = isDark ? 0.08 : 0.12;

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        var dx = Math.sin(time * p.speed + p.phase) * 2;
        var dy = Math.cos(time * p.speed * 0.7 + p.phase) * 2;
        var pulse = 0.5 + 0.5 * Math.sin(time * 1.2 + p.phase);
        var a = alpha * (0.6 + 0.4 * pulse);
        ctx.beginPath();
        ctx.arc(p.baseX + dx, p.baseY + dy, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,' + a + ')';
        ctx.fill();
      }
      requestAnimationFrame(animate);
    }
    animate();
  }

  var crisisBtn = document.getElementById('crisisBtn');
  var popup = document.getElementById('crisisPopup');
  var closeBtn = document.getElementById('closeCrisis');
  if (crisisBtn && popup) {
    crisisBtn.addEventListener('click', function() {
      popup.classList.toggle('show');
    });
    closeBtn.addEventListener('click', function() {
      popup.classList.remove('show');
    });
    document.addEventListener('click', function(e) {
      if (!popup.contains(e.target) && e.target !== crisisBtn && !crisisBtn.contains(e.target)) {
        popup.classList.remove('show');
      }
    });
  }

  var backBtn = document.getElementById('backToTop');
  if (backBtn) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 300) {
        backBtn.classList.add('visible');
      } else {
        backBtn.classList.remove('visible');
      }
    });
    backBtn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
