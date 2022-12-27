(function() {
  const iconContainerClass = 'pe-icons-container';
  let iconsContainerEl = document.getElementById(iconContainerClass);
  if (!iconsContainerEl) {
    iconsContainerEl = document.createElement('div');
    iconsContainerEl.className = iconContainerClass;
    document.body.appendChild(iconsContainerEl)
  }
  iconsContainerEl.innerHTML = iconsContainerEl.innerHTML + `%%html%%`;
})();
