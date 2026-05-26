/* ============================================================
   Hushly — global.js
   Core JavaScript: sticky header, mobile menu, FAQ accordion,
   social proof toast, exit intent popup, scroll-to-top,
   sticky bottom bar, fade-in animations, gallery & bundles.
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     STICKY HEADER — add .is-scrolled on scroll
     ---------------------------------------------------------- */
  var header = document.querySelector('.site-header');
  var scrollThreshold = 10;

  function handleHeaderScroll() {
    if (!header) return;
    if (window.scrollY > scrollThreshold) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  /* ----------------------------------------------------------
     MOBILE MENU TOGGLE
     ---------------------------------------------------------- */
  var hamburger = document.querySelector('.header__hamburger');
  var mobileNav = document.querySelector('.mobile-nav');

  function openMobileMenu() {
    if (!hamburger || !mobileNav) return;
    hamburger.classList.add('is-open');
    mobileNav.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    if (!hamburger || !mobileNav) return;
    hamburger.classList.remove('is-open');
    mobileNav.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', function () {
      if (mobileNav && mobileNav.classList.contains('is-open')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (mobileNav) {
    mobileNav.addEventListener('click', function (e) {
      if (e.target === mobileNav) {
        closeMobileMenu();
      }
    });
  }

  var mobileNavLinks = document.querySelectorAll('.mobile-nav__link');
  mobileNavLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      closeMobileMenu();
    });
  });

  /* ----------------------------------------------------------
     SMOOTH SCROLL FOR ANCHOR LINKS
     ---------------------------------------------------------- */
  document.addEventListener('click', function (e) {
    var anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    var targetId = anchor.getAttribute('href');
    if (targetId === '#' || targetId.length < 2) return;

    var targetEl = document.querySelector(targetId);
    if (!targetEl) return;

    e.preventDefault();
    closeMobileMenu();

    var headerHeight = header ? header.offsetHeight : 0;
    var targetPosition = targetEl.getBoundingClientRect().top + window.scrollY - headerHeight - 16;

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  });

  /* ----------------------------------------------------------
     SCROLL TO TOP BUTTON — show/hide
     ---------------------------------------------------------- */
  var scrollTopBtn = document.querySelector('.scroll-to-top') || document.querySelector('.scroll-top');
  var scrollTopThreshold = 400;

  function handleScrollTopVisibility() {
    if (!scrollTopBtn) return;
    if (window.scrollY > scrollTopThreshold) {
      scrollTopBtn.classList.add('is-visible');
    } else {
      scrollTopBtn.classList.remove('is-visible');
    }
  }

  window.addEventListener('scroll', handleScrollTopVisibility, { passive: true });
  handleScrollTopVisibility();

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ----------------------------------------------------------
     STICKY BOTTOM BAR — show after 600px scroll
     ---------------------------------------------------------- */
  var stickyBar = document.querySelector('.sticky-bottom-bar');
  var stickyBarThreshold = 600;

  function handleStickyBar() {
    if (!stickyBar) return;
    if (window.scrollY > stickyBarThreshold) {
      stickyBar.classList.add('is-visible');
      stickyBar.setAttribute('data-visible', 'true');
    } else {
      stickyBar.classList.remove('is-visible');
      stickyBar.setAttribute('data-visible', 'false');
    }
  }

  window.addEventListener('scroll', handleStickyBar, { passive: true });
  handleStickyBar();

  /* ----------------------------------------------------------
     FAQ ACCORDION — toggle .is-open with smooth height
     ---------------------------------------------------------- */
  var faqButtons = document.querySelectorAll('.faq-item__question');

  faqButtons.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var faqItem = trigger.closest('.faq-item');
      if (!faqItem) return;

      var answer = faqItem.querySelector('.faq-item__answer');
      if (!answer) return;

      var isOpen = faqItem.classList.contains('is-open');

      /* Close all siblings (single-open accordion) */
      var allItems = faqItem.parentElement ? faqItem.parentElement.querySelectorAll('.faq-item') : [];
      allItems.forEach(function (item) {
        if (item !== faqItem && item.classList.contains('is-open')) {
          item.classList.remove('is-open');
          var other = item.querySelector('.faq-item__answer');
          if (other) other.style.maxHeight = '0';
        }
      });

      if (isOpen) {
        faqItem.classList.remove('is-open');
        answer.style.maxHeight = '0';
      } else {
        faqItem.classList.add('is-open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* Product-hero collapsible sections */
  var collapsibleTriggers = document.querySelectorAll('.collapsible__trigger');

  collapsibleTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var collapsible = trigger.closest('.collapsible');
      if (!collapsible) return;

      var content = collapsible.querySelector('.collapsible__content');
      if (!content) return;

      var isOpen = collapsible.classList.contains('is-open');

      if (isOpen) {
        collapsible.classList.remove('is-open');
        content.style.maxHeight = '0';
      } else {
        collapsible.classList.add('is-open');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });

  /* ----------------------------------------------------------
     SOCIAL PROOF TOAST
     Rotates through French names/cities every 30-45s.
     ---------------------------------------------------------- */
  var toastEl = document.querySelector('.social-proof-toast');
  var toastCloseBtn = toastEl ? toastEl.querySelector('.social-proof-toast__close') || toastEl.querySelector('[data-toast-close]') : null;

  var socialProofData = [
    { name: 'Sophie',       city: 'Lyon',       pack: 'Pack Essentiel' },
    { name: 'Marc',         city: 'Paris',       pack: 'Pack Duo' },
    { name: 'Camille',      city: 'Marseille',   pack: 'Pack Maison' },
    { name: 'Thomas',       city: 'Bordeaux',    pack: 'Pack Essentiel' },
    { name: 'Léa',     city: 'Toulouse',    pack: 'Pack Duo' },
    { name: 'Antoine',      city: 'Nice',        pack: 'Pack Maison' },
    { name: 'Nathalie',     city: 'Nantes',      pack: 'Pack Essentiel' },
    { name: 'Jean-Pierre',  city: 'Strasbourg',  pack: 'Pack Duo' }
  ];

  var toastIndex = 0;
  var toastTimer = null;
  var toastDismissed = false;

  function getRandomDelay() {
    return (Math.random() * 15 + 30) * 1000; /* 30-45 seconds */
  }

  function getTimeAgo() {
    var minutes = Math.floor(Math.random() * 12) + 1;
    return 'il y a ' + minutes + ' min';
  }

  function showToast() {
    if (!toastEl || toastDismissed) return;

    var data = socialProofData[toastIndex % socialProofData.length];
    toastIndex++;

    var textEl = toastEl.querySelector('.social-proof-toast__text') || toastEl.querySelector('[data-toast-text]');
    var timeEl = toastEl.querySelector('.social-proof-toast__time') || toastEl.querySelector('[data-toast-time]');

    if (textEl) {
      textEl.innerHTML =
        '<span class="social-proof-toast__name">' + data.name + ' de ' + data.city + '</span>' +
        ' vient de commander le <strong>' + data.pack + '</strong>';
    }

    if (timeEl) {
      timeEl.textContent = getTimeAgo();
    }

    toastEl.classList.add('is-visible');
    toastEl.setAttribute('data-visible', 'true');

    /* Auto-hide after 5 seconds */
    setTimeout(function () {
      hideToast();
    }, 5000);
  }

  function hideToast() {
    if (!toastEl) return;
    toastEl.classList.remove('is-visible');
    toastEl.setAttribute('data-visible', 'false');
    scheduleNextToast();
  }

  function scheduleNextToast() {
    if (toastDismissed) return;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(showToast, getRandomDelay());
  }

  if (toastCloseBtn) {
    toastCloseBtn.addEventListener('click', function () {
      hideToast();
      toastDismissed = true;
      clearTimeout(toastTimer);
    });
  }

  /* Start after initial 8-second delay */
  if (toastEl) {
    setTimeout(function () {
      showToast();
    }, 8000);
  }

  /* ----------------------------------------------------------
     EXIT INTENT POPUP
     Desktop: mouseleave top edge.
     Mobile: 30s idle (no touch/scroll/click).
     Show once per session via sessionStorage.
     ---------------------------------------------------------- */
  var exitOverlay = document.querySelector('.exit-popup-overlay') || document.querySelector('.exit-popup');
  var exitShown = false;
  var EXIT_KEY = 'hushly_exit_popup_shown';

  function showExitPopup() {
    if (!exitOverlay || exitShown) return;
    if (sessionStorage.getItem(EXIT_KEY)) return;

    exitOverlay.classList.add('is-visible');
    exitOverlay.setAttribute('data-open', 'true');
    document.body.style.overflow = 'hidden';
    exitShown = true;
    sessionStorage.setItem(EXIT_KEY, '1');
  }

  function closeExitPopup() {
    if (!exitOverlay) return;
    exitOverlay.classList.remove('is-visible');
    exitOverlay.setAttribute('data-open', 'false');
    document.body.style.overflow = '';
  }

  /* Close buttons */
  if (exitOverlay) {
    var exitCloseBtn = exitOverlay.querySelector('.exit-popup__close') || exitOverlay.querySelector('.exit-popup-close');
    var exitNoThanks = exitOverlay.querySelector('.exit-popup__no-thanks');

    if (exitCloseBtn) exitCloseBtn.addEventListener('click', closeExitPopup);
    if (exitNoThanks) exitNoThanks.addEventListener('click', closeExitPopup);

    exitOverlay.addEventListener('click', function (e) {
      if (e.target === exitOverlay) closeExitPopup();
    });
  }

  /* Desktop: mouseleave on document top edge */
  if (exitOverlay && !sessionStorage.getItem(EXIT_KEY)) {
    document.addEventListener('mouseleave', function (e) {
      if (e.clientY <= 0) {
        showExitPopup();
      }
    });

    /* Mobile: show after 30 seconds of inactivity */
    var mobileIdleTimer = null;
    var isMobile = window.innerWidth < 769;

    function resetMobileIdle() {
      clearTimeout(mobileIdleTimer);
      mobileIdleTimer = setTimeout(function () {
        showExitPopup();
      }, 30000);
    }

    if (isMobile) {
      resetMobileIdle();
      ['touchstart', 'scroll', 'click'].forEach(function (evt) {
        document.addEventListener(evt, resetMobileIdle, { passive: true });
      });
    }
  }

  /* Close exit popup on Escape key */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeExitPopup();
    }
  });

  /* ----------------------------------------------------------
     FADE-IN ON SCROLL (IntersectionObserver)
     Elements with .fade-in-up get .is-visible when in viewport.
     ---------------------------------------------------------- */
  var fadeElements = document.querySelectorAll('.fade-in-up');

  if (fadeElements.length > 0 && 'IntersectionObserver' in window) {
    var fadeObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    fadeElements.forEach(function (el) {
      fadeObserver.observe(el);
    });
  } else {
    /* Fallback: show everything if IntersectionObserver not supported */
    fadeElements.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ----------------------------------------------------------
     PRODUCT GALLERY THUMBNAIL CLICK
     ---------------------------------------------------------- */
  var galleryThumbs = document.querySelectorAll('.product-gallery__thumb');
  var galleryMain = document.querySelector('.product-gallery__main img');

  galleryThumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      galleryThumbs.forEach(function (t) { t.classList.remove('is-active'); });
      thumb.classList.add('is-active');
      if (galleryMain) {
        var thumbImg = thumb.querySelector('img');
        if (thumbImg) {
          var newSrc = thumbImg.getAttribute('data-full-src') || thumbImg.getAttribute('src');
          galleryMain.setAttribute('src', newSrc);
        }
      }
    });
  });

  /* ----------------------------------------------------------
     BUNDLE PICKER — radio card selection
     ---------------------------------------------------------- */
  var bundleCards = document.querySelectorAll('.bundle-card');

  bundleCards.forEach(function (card) {
    card.addEventListener('click', function () {
      bundleCards.forEach(function (c) {
        c.classList.remove('is-selected');
        c.setAttribute('aria-pressed', 'false');
      });
      card.classList.add('is-selected');
      card.setAttribute('aria-pressed', 'true');

      var radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;

      /* Dispatch custom event for cart.js to listen */
      document.dispatchEvent(new CustomEvent('hushly:bundle-changed', {
        detail: {
          variantId: radio ? radio.value : null,
          title: card.querySelector('.bundle-card__title') ? card.querySelector('.bundle-card__title').textContent.trim() : '',
          price: card.querySelector('.bundle-card__price') ? card.querySelector('.bundle-card__price').textContent.trim() : ''
        }
      }));
    });
  });

  /* ----------------------------------------------------------
     UPSELL CHECKBOXES
     ---------------------------------------------------------- */
  var upsellItems = document.querySelectorAll('.upsell-item');

  upsellItems.forEach(function (item) {
    item.addEventListener('click', function () {
      item.classList.toggle('is-checked');
      var checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox) checkbox.checked = item.classList.contains('is-checked');

      document.dispatchEvent(new CustomEvent('hushly:upsell-changed'));
    });
  });

  /* ----------------------------------------------------------
     MONEY FORMATTER — expose globally
     ---------------------------------------------------------- */
  window.formatMoney = function (value) {
    if (typeof value !== 'number') value = parseFloat(value) || 0;
    return '€' + value.toFixed(2).replace('.', ',');
  };

})();
