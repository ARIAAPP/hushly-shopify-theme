/* ============================================================
   Soufflo — cart.js
   Cart state management, drawer UI, add-to-cart from
   product hero (bundle + upsells), Shopify checkout redirect.
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     CONFIG
     ---------------------------------------------------------- */
  var SHOP_DOMAIN = (window.souffloTheme && window.souffloTheme.shopDomain)
    || (window.Shopify && window.Shopify.shop)
    || window.location.hostname;

  var fmt = function (n) {
    return '€' + (parseFloat(n) || 0).toFixed(2).replace('.', ',');
  };

  /* ----------------------------------------------------------
     CART STATE
     ---------------------------------------------------------- */
  var state = {
    isOpen: false,
    items: [],
    addons: [
      { id: 'protection', variantId: '54003242795349', title: 'Assurance colis',           price: 4.95, icon: '📦' },
      { id: 'warranty',   variantId: '54003255869781', title: 'Extension garantie 24 mois', price: 7.95, icon: '🛡️' },
      { id: 'priority',   variantId: '54003273662805', title: 'Expédition express 48h',price: 5.95, icon: '⚡' }
    ]
  };

  /* ----------------------------------------------------------
     DOM REFERENCES
     ---------------------------------------------------------- */
  var $drawer    = document.querySelector('[data-cart-drawer]')   || document.querySelector('.cart-drawer');
  var $overlay   = document.querySelector('[data-cart-overlay]')  || document.querySelector('.cart-overlay');
  var $items     = document.querySelector('[data-cart-items]')    || ($drawer && $drawer.querySelector('.cart-drawer__items'));
  var $empty     = document.querySelector('[data-cart-empty]')    || ($drawer && $drawer.querySelector('.cart-drawer__empty'));
  var $footer    = document.querySelector('[data-cart-footer]')   || ($drawer && $drawer.querySelector('.cart-drawer__footer'));
  var $count     = document.querySelector('[data-cart-item-count]');
  var $headerBadge = document.querySelector('[data-cart-count]')  || document.querySelector('.header__cart-badge');
  var $subtotal  = document.querySelector('[data-cart-subtotal]') || ($drawer && $drawer.querySelector('.cart-drawer__subtotal-value'));
  var $savings   = $drawer && $drawer.querySelector('.cart-drawer__savings');
  var $upsells   = document.querySelector('[data-cart-upsells]');
  var $upsellsList = document.querySelector('[data-cart-upsells-list]');
  var $checkout  = document.querySelector('[data-checkout]')      || ($drawer && $drawer.querySelector('.cart-drawer__checkout'));
  var $shopPay   = document.querySelector('[data-shop-pay]');

  /* ----------------------------------------------------------
     COMPUTED TOTALS
     ---------------------------------------------------------- */
  function totalPrice() {
    return state.items.reduce(function (s, i) { return s + (i.price * i.quantity); }, 0);
  }

  function totalQty() {
    return state.items.reduce(function (s, i) { return s + i.quantity; }, 0);
  }

  function totalCompare() {
    return state.items.reduce(function (s, i) {
      return s + ((i.comparePrice || i.price) * i.quantity);
    }, 0);
  }

  function totalSavings() {
    return totalCompare() - totalPrice();
  }

  /* ----------------------------------------------------------
     CHECKOUT URL BUILDER
     ---------------------------------------------------------- */
  function buildCheckoutUrl(items, opts) {
    opts = opts || {};
    var parts = items
      .filter(function (i) { return i.variantId; })
      .map(function (i) { return i.variantId + ':' + i.quantity; });
    if (parts.length === 0) return '/cart';
    var url = 'https://' + SHOP_DOMAIN + '/cart/' + parts.join(',');
    if (opts.shopPay) url += '?payment=shop_pay';
    return url;
  }

  /* ----------------------------------------------------------
     RENDER CART UI
     ---------------------------------------------------------- */
  function render() {
    if (!$drawer) return;

    var qty = totalQty();

    /* Badge */
    if ($count) $count.textContent = qty;
    if ($headerBadge) {
      if (qty > 0) {
        $headerBadge.textContent = qty;
        $headerBadge.style.display = 'flex';
        $headerBadge.setAttribute('data-count', qty);
      } else {
        $headerBadge.textContent = '';
        $headerBadge.style.display = 'none';
        $headerBadge.setAttribute('data-count', '0');
      }
    }

    /* Empty vs filled */
    if (state.items.length === 0) {
      if ($empty) $empty.style.display = '';
      if ($items) $items.innerHTML = '';
      if ($footer) $footer.setAttribute('hidden', '');
      if ($footer) $footer.style.display = 'none';
      if ($upsells) $upsells.style.display = 'none';
    } else {
      if ($empty) $empty.style.display = 'none';
      if ($footer) { $footer.removeAttribute('hidden'); $footer.style.display = ''; }
      if ($items) $items.innerHTML = state.items.map(itemHtml).join('');
      if ($subtotal) $subtotal.textContent = fmt(totalPrice());

      /* Savings display */
      var savings = totalSavings();
      if ($savings) {
        if (savings > 0) {
          $savings.textContent = 'Vous économisez ' + fmt(savings);
          $savings.style.display = '';
        } else {
          $savings.style.display = 'none';
        }
      }

      /* Cart add-on upsells */
      var missing = state.addons.filter(function (a) {
        return !state.items.some(function (i) { return i.id === a.id; });
      });
      if (missing.length > 0 && $upsells && $upsellsList) {
        $upsells.style.display = '';
        $upsellsList.innerHTML = missing.map(function (a) {
          return '<button type="button" class="cart-addon-btn" data-add-addon="' + a.id + '">' +
            '<div style="display:flex; align-items:center; gap:0.5rem; min-width:0;">' +
              '<span>' + a.icon + '</span>' +
              '<span style="font-size:0.875rem; font-weight:500;">+ ' + escapeHtml(a.title) + '</span>' +
            '</div>' +
            '<span style="font-size:0.875rem; font-weight:700; color:var(--color-primary); white-space:nowrap;">+' + fmt(a.price) + '</span>' +
          '</button>';
        }).join('');
      } else if ($upsells) {
        $upsells.style.display = 'none';
      }
    }

    /* Drawer open/close state */
    if (state.isOpen) {
      $drawer.classList.add('is-open');
      $drawer.setAttribute('data-open', 'true');
      $drawer.setAttribute('aria-hidden', 'false');
      if ($overlay) { $overlay.classList.add('is-open'); $overlay.setAttribute('data-open', 'true'); }
      document.body.style.overflow = 'hidden';
    } else {
      $drawer.classList.remove('is-open');
      $drawer.setAttribute('data-open', 'false');
      $drawer.setAttribute('aria-hidden', 'true');
      if ($overlay) { $overlay.classList.remove('is-open'); $overlay.setAttribute('data-open', 'false'); }
      document.body.style.overflow = '';
    }

    /* Dispatch state event */
    document.dispatchEvent(new CustomEvent('soufflo:cart-state', {
      detail: { isOpen: state.isOpen, items: state.items }
    }));
  }

  /* ----------------------------------------------------------
     ITEM HTML TEMPLATE
     ---------------------------------------------------------- */
  function itemHtml(item) {
    var img = item.image
      ? '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" width="80" height="80" loading="lazy" decoding="async" style="height:5rem; width:5rem; border-radius:8px; background:var(--color-muted); object-fit:contain; padding:4px;">'
      : '<div style="height:5rem; width:5rem; border-radius:8px; background:var(--color-muted); display:flex; align-items:center; justify-content:center;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg></div>';

    return '<div class="cart-item cart-line-item" data-item-id="' + escapeHtml(item.id) + '">' +
      '<div class="cart-item__image">' + img + '</div>' +
      '<div class="cart-item__details" style="flex:1; min-width:0;">' +
        '<div style="display:flex; align-items:flex-start; justify-content:space-between; gap:0.5rem;">' +
          '<p class="cart-item__name" style="margin:0;">' + escapeHtml(item.title) + '</p>' +
          '<button type="button" class="cart-item__remove" data-remove="' + escapeHtml(item.id) + '" aria-label="Retirer">&times;</button>' +
        '</div>' +
        (item.variant ? '<p class="cart-item__variant" style="margin:0;">' + escapeHtml(item.variant) + '</p>' : '') +
        '<p style="margin-top:0.25rem; font-size:0.875rem; font-weight:700; color:var(--color-primary); margin-bottom:0;">' + fmt(item.price) + '</p>' +
        '<div class="cart-item__bottom" style="margin-top:0.5rem;">' +
          '<div style="display:inline-flex; align-items:center; border-radius:9999px; border:1px solid var(--color-border);">' +
            '<button type="button" data-qty="dec" data-id="' + escapeHtml(item.id) + '" aria-label="Diminuer" style="padding:0.25rem 0.5rem; color:var(--color-muted-fg);">&minus;</button>' +
            '<span style="padding:0 0.5rem; font-size:0.875rem; font-weight:600;">' + item.quantity + '</span>' +
            '<button type="button" data-qty="inc" data-id="' + escapeHtml(item.id) + '" aria-label="Augmenter" style="padding:0.25rem 0.5rem; color:var(--color-muted-fg);">+</button>' +
          '</div>' +
          '<span class="cart-item__price">' + fmt(item.price * item.quantity) + '</span>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ----------------------------------------------------------
     HTML ESCAPE UTILITY
     ---------------------------------------------------------- */
  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
  }

  /* ----------------------------------------------------------
     PUBLIC API
     ---------------------------------------------------------- */
  window.SouffloCart = {
    open: function () {
      state.isOpen = true;
      render();
    },

    close: function () {
      state.isOpen = false;
      render();
    },

    toggle: function () {
      state.isOpen = !state.isOpen;
      render();
    },

    addItem: function (item) {
      var existing = state.items.find(function (i) { return i.id === item.id; });
      if (existing) {
        existing.quantity += (item.quantity || 1);
      } else {
        state.items.push({
          id: item.id,
          variantId: item.variantId || item.id,
          title: item.title || '',
          variant: item.variant || '',
          price: item.price || 0,
          comparePrice: item.comparePrice || 0,
          image: item.image || '',
          quantity: item.quantity || 1,
          properties: item.properties || {}
        });
      }
      render();
    },

    removeItem: function (id) {
      state.items = state.items.filter(function (i) { return i.id !== id; });
      render();
    },

    setQuantity: function (id, qty) {
      state.items = state.items
        .map(function (i) {
          return i.id === id ? Object.assign({}, i, { quantity: Math.max(1, qty) }) : i;
        })
        .filter(function (i) { return i.quantity > 0; });
      render();
    },

    openWith: function (items) {
      state.items = items;
      state.isOpen = true;
      render();
    },

    getItems: function () {
      return state.items.slice();
    },

    getCount: function () {
      return totalQty();
    },

    getSubtotal: function () {
      return totalPrice();
    },

    formatPrice: fmt
  };

  /* ----------------------------------------------------------
     EVENT DELEGATION — clicks inside the cart drawer
     ---------------------------------------------------------- */
  document.addEventListener('click', function (e) {
    /* Toggle cart open/close */
    var toggle = e.target.closest('[data-cart-toggle]') || e.target.closest('[data-open-cart]');
    if (toggle) {
      e.preventDefault();
      window.SouffloCart.toggle();
      return;
    }

    /* Close cart */
    var close = e.target.closest('[data-cart-close]');
    if (close) {
      e.preventDefault();
      window.SouffloCart.close();
      return;
    }

    /* Click overlay to close */
    var overlayClick = e.target.closest('[data-cart-overlay]') || e.target.closest('.cart-overlay');
    if (overlayClick && e.target === overlayClick) {
      window.SouffloCart.close();
      return;
    }

    /* Remove item */
    var remove = e.target.closest('[data-remove]');
    if (remove) {
      window.SouffloCart.removeItem(remove.dataset.remove || remove.getAttribute('data-remove-id'));
      return;
    }

    /* Quantity +/- */
    var qtyBtn = e.target.closest('[data-qty]');
    if (qtyBtn) {
      var id = qtyBtn.dataset.id;
      var item = state.items.find(function (i) { return i.id === id; });
      if (!item) return;
      var newQty = qtyBtn.dataset.qty === 'inc' ? item.quantity + 1 : item.quantity - 1;
      if (newQty <= 0) {
        window.SouffloCart.removeItem(id);
      } else {
        window.SouffloCart.setQuantity(id, newQty);
      }
      return;
    }

    /* Add add-on from cart drawer */
    var addAddon = e.target.closest('[data-add-addon]');
    if (addAddon) {
      var addon = state.addons.find(function (a) { return a.id === addAddon.dataset.addAddon; });
      if (addon) {
        window.SouffloCart.addItem({
          id: addon.id,
          variantId: addon.variantId,
          title: addon.title,
          price: addon.price,
          quantity: 1
        });
        /* Facebook Pixel add-to-cart event */
        if (window.fbq) {
          window.fbq('track', 'AddToCart', {
            value: addon.price,
            currency: 'EUR',
            content_ids: [addon.variantId],
            content_type: 'product',
            num_items: 1
          });
        }
      }
      return;
    }
  });

  /* ----------------------------------------------------------
     CHECKOUT BUTTON
     ---------------------------------------------------------- */
  if ($checkout) {
    $checkout.addEventListener('click', function (e) {
      e.preventDefault();
      if (state.items.length === 0) return;

      var url = buildCheckoutUrl(state.items);

      /* Facebook Pixel InitiateCheckout */
      if (window.fbq) {
        window.fbq('track', 'InitiateCheckout', {
          value: +totalPrice().toFixed(2),
          currency: 'EUR',
          content_ids: state.items.map(function (i) { return i.variantId; }),
          content_type: 'product',
          num_items: totalQty()
        });
      }

      setTimeout(function () { window.location.href = url; }, 200);
    });
  }

  /* Shop Pay express checkout */
  if ($shopPay) {
    $shopPay.addEventListener('click', function (e) {
      e.preventDefault();
      if (state.items.length === 0) return;

      var url = buildCheckoutUrl(state.items, { shopPay: true });

      if (window.fbq) {
        window.fbq('track', 'InitiateCheckout', {
          value: +totalPrice().toFixed(2),
          currency: 'EUR',
          content_ids: state.items.map(function (i) { return i.variantId; }),
          content_type: 'product',
          num_items: totalQty()
        });
      }

      setTimeout(function () { window.location.href = url; }, 150);
    });
  }

  /* ----------------------------------------------------------
     ADD-TO-CART FROM PRODUCT HERO
     Reads selected bundle + checked upsells, adds to cart,
     opens the drawer.
     ---------------------------------------------------------- */
  function parsePriceText(text) {
    if (!text) return 0;
    var cleaned = text.replace(/[^\d,.\-]/g, '').replace(',', '.');
    var value = parseFloat(cleaned);
    if (isNaN(value)) return 0;
    return value;
  }

  function getSelectedBundle() {
    var selected = document.querySelector('.bundle-card.is-selected')
      || document.querySelector('.bundle-card[aria-pressed="true"]');
    if (!selected) selected = document.querySelector('.bundle-card');
    if (!selected) return null;

    var radio     = selected.querySelector('input[type="radio"]');
    var titleEl   = selected.querySelector('.bundle-card__title');
    var subtitleEl = selected.querySelector('.bundle-card__subtitle');
    var priceEl   = selected.querySelector('.bundle-card__price') || selected.querySelector('.font-bold');
    var compareEl = selected.querySelector('.bundle-card__compare') || selected.querySelector('.line-through');

    return {
      variantId: radio ? radio.value : (selected.dataset.variantId || ''),
      title: titleEl ? titleEl.textContent.trim() : '',
      variant: subtitleEl ? subtitleEl.textContent.trim() : '',
      price: priceEl ? parsePriceText(priceEl.textContent) : 0,
      comparePrice: compareEl ? parsePriceText(compareEl.textContent) : 0,
      image: ''
    };
  }

  function getSelectedUpsells() {
    var upsells = [];
    var checked = document.querySelectorAll('.upsell-item.is-checked');

    checked.forEach(function (item) {
      var cb = item.querySelector('input[type="checkbox"]');
      var nameEl = item.querySelector('.upsell-item__name');
      var priceEl = item.querySelector('.upsell-item__price');

      upsells.push({
        variantId: cb ? cb.value : '',
        title: nameEl ? nameEl.textContent.trim() : '',
        variant: 'Accessoire',
        price: priceEl ? parsePriceText(priceEl.textContent) : 0,
        comparePrice: 0
      });
    });

    return upsells;
  }

  /* Main add-to-cart buttons */
  document.addEventListener('click', function (e) {
    var atcBtn = e.target.closest('[data-add-to-cart]');
    if (!atcBtn) return;

    e.preventDefault();

    var bundle = getSelectedBundle();
    if (!bundle || !bundle.variantId) return;

    /* Product image */
    var mainImg = document.querySelector('.product-gallery__main img');
    var imageSrc = mainImg ? mainImg.getAttribute('src') : '';

    /* Add bundle to cart */
    window.SouffloCart.addItem({
      id: 'bundle-' + bundle.variantId,
      variantId: bundle.variantId,
      title: bundle.title,
      variant: bundle.variant,
      price: bundle.price,
      comparePrice: bundle.comparePrice,
      image: imageSrc,
      quantity: 1
    });

    /* Add checked upsells */
    var upsells = getSelectedUpsells();
    for (var i = 0; i < upsells.length; i++) {
      var up = upsells[i];
      if (up.variantId) {
        window.SouffloCart.addItem({
          id: 'upsell-' + up.variantId,
          variantId: up.variantId,
          title: up.title,
          variant: up.variant,
          price: up.price,
          comparePrice: up.comparePrice,
          image: '',
          quantity: 1
        });
      }
    }

    /* Facebook Pixel AddToCart */
    if (window.fbq) {
      window.fbq('track', 'AddToCart', {
        value: bundle.price,
        currency: 'EUR',
        content_ids: [bundle.variantId],
        content_type: 'product',
        num_items: 1
      });
    }

    /* Open the drawer */
    window.SouffloCart.open();
  });

  /* Sticky bottom bar CTA triggers the main add-to-cart */
  var stickyBarBtn = document.querySelector('.sticky-bottom-bar__btn') || document.querySelector('.sticky-bar-cta');
  if (stickyBarBtn && !stickyBarBtn.hasAttribute('data-add-to-cart')) {
    stickyBarBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var mainCta = document.querySelector('[data-add-to-cart]');
      if (mainCta) mainCta.click();
    });
  }

  /* ----------------------------------------------------------
     CLOSE CART ON ESCAPE KEY
     ---------------------------------------------------------- */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && state.isOpen) {
      window.SouffloCart.close();
    }
  });

  /* ----------------------------------------------------------
     INITIAL RENDER
     ---------------------------------------------------------- */
  render();

})();
