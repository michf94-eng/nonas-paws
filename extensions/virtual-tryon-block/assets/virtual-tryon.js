(function () {
  var state = { breed: null, furColor: null };
  var root, modal, panelSelect, panelResult;
  var breedSelect, furRadios, generateBtn;
  var resultImg, resultMeta, resultDogName, spinner;
  var step1, step2, errorBox, errorMsg;

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
    furRadios.forEach(function(r) { r.addEventListener('change', onSelectionChange); });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') NpTryOn.close();
    });
  }

  function onSelectionChange() {
    state.breed = breedSelect.value || null;
    var checked = root.querySelector('input[name="np-fur"]:checked');
    state.furColor = checked ? checked.value : null;
    generateBtn.disabled = !(state.breed && state.furColor);
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

  var NpTryOn = {
    open: function() {
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
    },
    close: function() {
      modal.hidden = true;
      document.body.style.overflow = '';
    },
    reset: function() {
      state.breed = null;
      state.furColor = null;
      breedSelect.value = '';
      furRadios.forEach(function(r) { r.checked = false; });
      generateBtn.disabled = true;
      resultImg.src = '';
      resultImg.hidden = true;
      resultMeta.hidden = true;
      spinner.hidden = true;
      setStep(1);
      showPanel('select');
    },
    generate: function() {
      if (!state.breed || !state.furColor) return;
      setStep(2);
      showPanel('result');
      resultImg.hidden = true;
      resultMeta.hidden = true;
      spinner.hidden = false;
      errorBox.hidden = true;

      var payload = JSON.stringify({
        dog: { breed: state.breed, furColor: state.furColor },
        product: { productId: root.dataset.productId, productTitle: root.dataset.productTitle }
      });

      var xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://nonas-paws-production.up.railway.app/api/generate-tryon');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onload = function() {
        if (xhr.status === 200) {
          var data = JSON.parse(xhr.responseText);
          resultImg.onload = function() {
            spinner.hidden = true;
            resultImg.hidden = false;
            resultMeta.hidden = false;
            resultDogName.textContent = breedSelect.options[breedSelect.selectedIndex].text + ' - ' + state.furColor;
          };
          resultImg.src = data.imageUrl;
        } else {
          spinner.hidden = true;
          NpTryOn._showError('Error del servidor. Intenta de nuevo.');
        }
      };
      xhr.onerror = function() {
        spinner.hidden = true;
        NpTryOn._showError('No se pudo conectar. Intenta de nuevo.');
      };
      xhr.send(payload);
    },
    addToCart: function() {
      var atcBtn = document.querySelector('.product-form__submit, [name="add"]');
      if (atcBtn) atcBtn.click();
      NpTryOn.close();
    },
    _showError: function(msg) {
      errorMsg.textContent = msg;
      errorBox.hidden = false;
      setStep(1);
      showPanel('select');
    }
  };

  window.NpTryOn = NpTryOn;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
