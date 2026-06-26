cat > ~/Downloads/nonas-paws/extensions/virtual-tryon-block/assets/virtual-tryon.js << 'EOF'
(function () {
  'use strict';
  const state = { breed: null, furColor: null, resultUrl: null };
  let root, modal, panelSelect, panelResult;
  let breedSelect, furRadios, generateBtn;
  let resultImg, resultMeta, resultDogName, spinner;
  let step1, step2, errorBox, errorMsg;

  function init() {
    root = document.getElementById('np-tryon-root');
    if (!root) return;
    modal = document.getElementById('np-tryon-modal');
    panelSelect = document.getElementById('np-panel-select');
    panelResult = document.getElementById('np-panel-result');
    breedSelect = document.getElementById('np-breed');
    furRadios = root.querySelectorAll('input[name="np-fur"]');
    generateBtn = document.getElementById('np-generate-btn');
    resultImg = document.getElementById('np-result-img');
    resultMeta = document.getElementById('np-result-meta');
    resultDogName = document.getElementById('np-result-dog-name');
    spinner = document.getElementById('np-spinner');
    step1 = document.getElementById('np-step-1');
    step2 = document.getElementById('np-step-2');
    errorBox = document.getElementById('np-error');
    errorMsg = document.getElementById('np-error-msg');
    breedSelect.addEventListener('change', onSelectionChange);
    furRadios.forEach(r => r.addEventListener('change', onSelectionChange));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') NpTryOn.close(); });
  }

  function onSelectionChange() {
    state.breed = breedSelect.value || null;
    const checked = root.querySelector('input[name="np-fur"]:checked');
    state.furColor = checked ? checked.value : null;
    generateBtn.disabled = !(state.breed && state.furColor);
  }

  function getProductData() {
    return {
      productId: root.dataset.productId,
      productTitle: root.dataset.productTitle,
      productType: root.dataset.productType,
    };
  }

  function showPanel(which) {
    panelSelect.classList.toggle('np-panel--hidden', which !== 'select');
    panelResult.classList.toggle('np-panel--hidden', which !== 'result');
    errorBox.hidden = true;
  }

  function setStep(n) {
    step1.classList.toggle('np-step--active', n === 1);
    step1.classList.toggle('np-step--done', n > 1);
    step2.classList.toggle('np-step--active', n === 2);
  }

  const NpTryOn = {
    open() {
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
    },
    close() {
      modal.hidden = true;
      document.body.style.overflow = '';
    },
    reset() {
      state.breed = null;
      state.furColor = null;
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
    async generate() {
      if (!state.breed || !state.furColor) return;
      setStep(2);
      showPanel('result');
      resultImg.hidden = true;
      resultMeta.hidden = true;
      spinner.hidden = false;
      errorBox.hidden = true;
      const payload = { dog: { breed: state.breed, furColor: state.furColor }, product: getProductData() };
      try {
        const res = await fetch('https://nonas-paws-production.up.railway.app/api/generate-tryon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Server error ' + res.status);
        const data = await res.json();
        if (!data.imageUrl) throw new Error('No image returned.');
        state.resultUrl = data.imageUrl;
        resultImg.onload = () => {
          spinner.hidden = true;
          resultImg.hidden = false;
          resultMeta.hidden = false;
          const breedLabel = breedSelect.options[breedSelect.selectedIndex].text;
          resultDogName.textContent = breedLabel + ' · ' + state.furColor + ' fur';
        };
        resultImg.onerror = () => {
          spinner.hidden = true;
          NpTryOn._showError('No se pudo cargar la imagen.');
        };
        resultImg.src = data.imageUrl;
      } catch (err) {
        spinner.hidden = true;
        NpTryOn._showError(err.message || 'Algo salió mal. Intenta de nuevo.');
      }
    },
    addToCart() {
      const atcBtn = document.querySelector('.product-form__submit, [name="add"]');
      if (atcBtn) atcBtn.click();
      NpTryOn.close();
    },
    _showError(msg) {
      errorMsg.textContent = msg;
      errorBox.hidden = false;
      setStep(1);
      showPanel('select');
    },
  };

  window.NpTryOn = NpTryOn;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
EOF
