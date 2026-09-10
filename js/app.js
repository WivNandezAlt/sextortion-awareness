var APP = (function() {
  'use strict';

  function initTheme() {
    var theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    var btn = document.getElementById('themeBtn');
    if (btn) {
      btn.textContent = theme === 'dark' ? '\u{1F319}' : '\u2600\u{FE0F}';
      btn.addEventListener('click', function() {
        var d = document.documentElement;
        var next = d.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        d.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        btn.textContent = next === 'dark' ? '\u{1F319}' : '\u2600\u{FE0F}';
      });
    }
  }

  function initScrollObserver() {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.animate').forEach(function(el) { observer.observe(el); });
  }

  function initProgressBar() {
    var bar = document.getElementById('progressBar');
    if (!bar) return;
    window.addEventListener('scroll', function() {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = progress + '%';
    });
  }

  function initParticles() {
    var canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
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

  function initCrisisPopup() {
    var crisisBtn = document.getElementById('crisisBtn');
    var popup = document.getElementById('crisisPopup');
    var closeBtn = document.getElementById('closeCrisis');
    if (crisisBtn && popup) {
      crisisBtn.addEventListener('click', function() { popup.classList.toggle('show'); });
      if (closeBtn) closeBtn.addEventListener('click', function() { popup.classList.remove('show'); });
      document.addEventListener('click', function(e) {
        if (!popup.contains(e.target) && e.target !== crisisBtn && !crisisBtn.contains(e.target)) {
          popup.classList.remove('show');
        }
      });
    }
  }

  function initBackToTop() {
    var backBtn = document.getElementById('backToTop');
    if (!backBtn) return;
    window.addEventListener('scroll', function() {
      if (window.scrollY > 300) backBtn.classList.add('visible');
      else backBtn.classList.remove('visible');
    });
    backBtn.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  function initSearch() {
    var searchInput = document.getElementById('searchInput');
    var searchResults = document.getElementById('searchResults');
    if (!searchInput || !searchResults) return;

    searchInput.addEventListener('input', function() {
      var query = this.value.toLowerCase().trim();
      searchResults.innerHTML = '';
      if (query.length < 3) {
        searchResults.style.display = 'none';
        return;
      }

      var sections = document.querySelectorAll('h2, h3, .tl-card, .tactics-item, .platform-card, .protect-list li, .case-step, .story-card');
      var results = [];

      sections.forEach(function(el) {
        var text = el.textContent.toLowerCase();
        if (text.indexOf(query) !== -1) {
          var heading = el.tagName.match(/^H[1-6]$/) ? el.textContent.trim() : '';
          if (!heading) {
            var h = el.querySelector('h3, strong');
            heading = h ? h.textContent.trim() : el.textContent.trim().substring(0, 60);
          }
          var id = el.id || (el.closest('[id]') ? el.closest('[id]').id : '');
          results.push({ text: heading, id: id });
        }
      });

      if (results.length === 0) {
        searchResults.style.display = 'none';
        return;
      }

      var html = '';
      results.slice(0, 8).forEach(function(r) {
        html += '<a href="#' + r.id + '" class="search-result-item">' + r.text + '</a>';
      });
      searchResults.innerHTML = html;
      searchResults.style.display = 'block';
    });

    document.addEventListener('click', function(e) {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.style.display = 'none';
      }
    });

    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        searchResults.style.display = 'none';
        searchInput.blur();
      }
    });
  }

  function initShareButtons() {
    document.querySelectorAll('.share-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var platform = this.dataset.platform;
        var url = encodeURIComponent(window.location.href);
        var title = encodeURIComponent(document.title);
        var shareUrl = '';

        switch (platform) {
          case 'twitter': shareUrl = 'https://twitter.com/intent/tweet?url=' + url + '&text=' + title; break;
          case 'facebook': shareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + url; break;
          case 'whatsapp': shareUrl = 'https://wa.me/?text=' + title + '%20' + url; break;
          case 'telegram': shareUrl = 'https://t.me/share/url?url=' + url + '&text=' + title; break;
          case 'linkedin': shareUrl = 'https://www.linkedin.com/sharing/share-offsite/?url=' + url; break;
        }
        if (shareUrl) window.open(shareUrl, '_blank', 'width=600,height=400');
      });
    });
  }

  function init() {
    initTheme();
    initScrollObserver();
    initProgressBar();
    initParticles();
    initCrisisPopup();
    initBackToTop();
    initSearch();
    initShareButtons();
  }

  return { init: init };
})();

document.addEventListener('DOMContentLoaded', function() {
  APP.init();
});
