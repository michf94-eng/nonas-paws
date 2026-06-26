/**
 * Nona's Paws – Virtual Fitting Room
 * Handles modal, selection, API call, and result rendering.
 *
 * Vanilla JS — no dependencies, theme-safe.
 */

(function () {
  'use strict';

  // ── State ────────────────────────────────────────────────────────────────
  const state = {
    breed:     null,
    furColor:  null,
    resultUrl: null,
  };

  // ── DOM refs ──────────────────────────────────────────────────────────────
  let root, modal, panelSelect, panelResult;
  let breedSelect, furRadios, generateBtn;
  let resultImg, resultMeta, resultDogName, spinner;
  let step1, step2, errorBox, errorMsg;

  function init () {
    root         = document.getElementById('np-tryon-root');
    if (!root) return; // block not on page

    modal        = document.getElementById('np-tryon-modal');
    panelSelect  = document.getElementById('np-panel-select');
    panelResult  = document.getElementById('np-panel-result');
    breedSelect  = document.getElementById('np-breed');
    furRadios    = root.querySelectorAll('input[name="np-fur"]');
    generateBtn  = document.getElementById('np-generate-btn');
    resultImg    = document.getElementById('np-result-img');
    resultMeta   = document.getElementById('np-result-meta');
    resultDogName= document.getElementById('np-result-dog-name');
    spinner      = document.getElementById('np-spinner');
    step1        = document.getElementById('np-step-1');
    step2        = document.getElementById('np-step-2');
    errorBox     = document.getElementById('np-error');
    errorMsg     = document.getElementById('np-error-msg');

    // Selection listeners
    breedSelect.addEventListener('change', onSelectionChange);
    furRadios.forEach(r => r.addEventListener('change', onSelectionChange));

    // Keyboard: close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') NpTryOn.close();
    });
  }

  function onSelectionChange () {
    state.breed    = breedSelect.value || null;
    const checked  = root.querySelector('input[name="np-fur"]:checked');
    state.furColor = checked ? checked.value : null;
    generateBtn.disabled = !(state.breed && state.furColor);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function getProductData () {
    return {
      productId:       root.dataset.productId,
      productTitle:    root.dataset.productTitle,
      productType:     root.dataset.productType,
      productPrice:    root.dataset.productPrice,
      patternImage:    root.dataset.patternImage    || null,
      borderColor:     root.dataset.borderColor     || null,
      logoColor:       root.dataset.logoColor       || null,
      transparentImg:  root.dataset.transparentImg  || null,
    };
  }

  function getApiBase () {
    return (root.dataset.apiBase || '').replace(/\/$/, '');
  }

  function showPanel (which) {
    panelSelect.classList.toggle('np-panel--hidden', which !== 'select');
    panelResult.classList.toggle('np-panel--hidden', which !== 'result');
    errorBox.hidden = true;
  }

  function setStep (n) {
    step1.classList.toggle('np-step--active', n === 1);
    step1.classList.toggle('np-step--done',   n > 1);
    step2.classList.toggle('np-step--active', n === 2);
  }

  // ── Public API ────────────────────────────────────────────────────────────
  const NpTryOn = {

    open () {
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      generateBtn.focus();
    },

    close () {
      modal.hidden = true;
      document.body.style.overflow = '';
    },

    reset () {
      state.breed    = null;
      state.furColor = null;
      state.resultUrl= null;

      breedSelect.value = '';
      furRadios.forEach(r => { r.checked = false; });
      generateBtn.disabled = true;

      resultImg.src = '';
      resultImg.hidden = true;
      resultMeta.hidden = true;
      spinner.hidden = true;

      setStep(1);
      showPanel('select');
    },

    async generate () {
      if (!state.breed || !state.furColor) return;

      setStep(2);
      showPanel('result');

      // Show spinner while fetching
      resultImg.hidden = true;
      resultMeta.hidden = true;
      spinner.hidden = false;
      errorBox.hidden = true;

      const payload = {
        dog: {
          breed:    state.breed,
          furColor: state.furColor,
        },
        product: getProductData(),
      };

      try {
        const apiUrl = `function getApiBase () {
    return 'https://nonas-paws-production.up.railway.app';
  };
        const res    = await fetch(apiUrl, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Server error ${res.status}`);
        }

        const data = await res.json();

        if (!data.imageUrl) throw new Error('No image returned from server.');

        state.resultUrl = data.imageUrl;

        // Render result
        resultImg.onload = () => {
          spinner.hidden    = true;
          resultImg.hidden  = false;
          resultMeta.hidden = false;

          const breedLabel = breedSelect.options[breedSelect.selectedIndex].text;
          const furLabel   = root.querySelector('input[name="np-fur"]:checked')
            ?.closest('.np-fur-swatch')?.title || state.furColor;

          resultDogName.textContent = `${breedLabel} · ${furLabel} fur`;
        };
        resultImg.onerror = () => {
          spinner.hidden = true;
          NpTryOn._showError('Could not load the try-on image. Please try again.');
        };
        resultImg.src = data.imageUrl;

      } catch (err) {
        spinner.hidden = true;
        NpTryOn._showError(err.message || 'Something went wrong. Please try again.');
      }
    },

    addToCart () {
      // Hand off to Shopify default cart behavior
      const form = document.querySelector('form[action="/cart/add"]');
      if (form) {
        form.requestSubmit?.() || form.submit();
      } else {
        // Fallback: scroll to ATC button
        const atcBtn = document.querySelector('.product-form__submit, [name="add"]');
        if (atcBtn) atcBtn.click();
      }
      NpTryOn.close();
    },

    _showError (msg) {
      errorMsg.textContent = msg;
      errorBox.hidden = false;
      setStep(1);
      showPanel('select');
    },
  };

  // Expose globally
  window.NpTryOn = NpTryOn;

  // Init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
