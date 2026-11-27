const dialog = document.querySelector('.poster-dialog');
const posterData = JSON.parse(document.querySelector('#poster-data').textContent);
const image = dialog.querySelector('img');
const title = dialog.querySelector('h2');
const summary = dialog.querySelector('#poster-summary');
const link = dialog.querySelector('#poster-link');

if (typeof dialog.showModal === 'function') {
  document.querySelectorAll('[data-poster]').forEach((button) => {
    button.hidden = false;
    button.addEventListener('click', () => {
      const key = button.dataset.poster;
      const poster = posterData[key];
      title.textContent = poster.name;
      summary.textContent = poster.summary;
      image.alt = poster.name;
      image.src = poster.image;
      link.href = 'codex.html#' + key;
      dialog.showModal();
    });
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}
