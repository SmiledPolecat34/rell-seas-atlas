const normalize = (value) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

document.querySelectorAll('[data-catalog]').forEach((form) => {
  const list = document.getElementById(form.dataset.catalog);
  const groups = Array.from(list.querySelectorAll('[data-family]'));
  form.hidden = false;
  const query = form.elements.query;
  const family = form.elements.family;
  const result = form.querySelector('output');

  const update = () => {
    const term = normalize(query.value.trim());
    let visible = 0;
    groups.forEach((group) => {
      let matches = 0;
      group.querySelectorAll('.entry').forEach((entry) => {
        entry.hidden = Boolean(family.value && group.dataset.family !== family.value)
          || !normalize(entry.textContent).includes(term);
        matches += Number(!entry.hidden);
      });
      group.hidden = matches === 0;
      visible += matches;
    });
    result.textContent = visible ? new Intl.NumberFormat('fr').format(visible) + ' fiches' : 'Aucune fiche trouvée';
  };

  form.addEventListener('submit', (event) => event.preventDefault());
  query.addEventListener('input', update);
  family.addEventListener('change', update);
  update();
});

const openLinkedCard = () => {
  const target = document.getElementById(window.location.hash.slice(1));
  if (target instanceof HTMLDetailsElement) {
    target.open = true;
  }
};

window.addEventListener('hashchange', openLinkedCard);
openLinkedCard();
