const factions = {
  pirates: ['Pirates', 'Prends la mer avec ton équipage. Cette voie met l’accent sur la navigation, les événements en mer et les affrontements entre équipages.'],
  marines: ['Marines', 'Rejoins la Marine si tu préfères une organisation structurée. Les guides évoquent des bases navales et un rôle centré sur le maintien de l’ordre. Le projet évoquait aussi Galaxy Impact, dont l’exclusivité à la Marine ou aux Amiraux reste à confirmer.'],
  hunters: ['Chasseurs de primes', 'Traque les pirates pour leurs primes. Les guides décrivent une voie plus indépendante, tournée vers la capture de cibles.'],
  government: ['Gouvernement mondial', 'Les notes du projet citent World Seas Government. Le recrutement, les grades et les conditions permettant de rejoindre cette organisation restent à vérifier.'],
  revolution: ['Révolutionnaires', 'Les notes citent Arms of Revolution et une tenue « Revolutionary Cadet » visible dans une séquence d’octobre. Les modalités de recrutement et la progression dans la faction restent inconnues.'],
};

const factionButtons = document.querySelectorAll('[data-faction]');
const factionName = document.querySelector('#faction-name');
const factionText = document.querySelector('#faction-text');

factionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    factionButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    const [name, description] = factions[button.dataset.faction];
    factionName.textContent = name;
    factionText.textContent = description;
  });
});
