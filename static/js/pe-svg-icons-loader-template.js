(function() {
  const iconContainerClass = 'pe-svg-icons-container';
  const iconsContainerElems = document.getElementsByClassName(iconContainerClass);
  let iconsContainerEl = iconsContainerElems && iconsContainerElems.length ? iconsContainerElems[0] : null;
  if (!iconsContainerEl) {
    iconsContainerEl = document.createElement('div');
    iconsContainerEl.className = iconContainerClass;
    document.body.appendChild(iconsContainerEl);
  }
  iconsContainerEl.innerHTML = iconsContainerEl.innerHTML + `<svg xmlns="http://www.w3.org/2000/svg" style="display:none;" class="sprite">%%html%%</svg>`;
})();
