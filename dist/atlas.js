const factions = {
  pirates: ['Pirates', 'Prends la mer avec ton équipage : liberté totale, aucune taxe et plus de 40 crews PNJ dont les relations s’accumulent. En contrepartie, une prime fait de toi une cible des Marines, et la prison te guette, jusqu’à Hades Asylum.', 'pirates'],
  marines: ['Marines', 'Enrôle-toi auprès du Recruteur d’une base Marine (départ au rang Recruit) et gravis 21 rangs. Tu arrêtes les pirates, mais tu paies des taxes. Seul l’Admiral, qui exige l’appui du Gouvernement, circule librement dans Hades Asylum.', 'marines'],
  hunters: ['Chasseurs de primes', 'Statut contesté : le guide rellseas.org en fait une faction indépendante qui traque les pirates pour leur prime, mais le wiki ne la liste pas. Les journaux Bounty-Hunt et Grifter-Hunt existent en tout cas dans la démo.', 'hunters'],
  government: ['Gouvernement mondial', 'Faction jouable corrompue, au-dessus de la Marine, fondée sur le contrôle absolu et opposée à la Révolution. Presque tout est encore secret : recrutement, rangs, avantages. Rokushiki probable.', 'government'],
  revolution: ['Révolutionnaires', 'Faction clandestine qui veut renverser le Gouvernement : 8 tenues révolutionnaires, pas de taxe, Dragon Claw Fist probable. Recrutement discret attendu, tout est pré-release.', 'revolution'],
};

const factionButtons = document.querySelectorAll('[data-faction]');
const factionName = document.querySelector('#faction-name');
const factionText = document.querySelector('#faction-text');
const factionLink = document.querySelector('#faction-link');

factionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    factionButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    const [name, description, anchor] = factions[button.dataset.faction];
    factionName.textContent = name;
    factionText.textContent = description;
    if (factionLink) factionLink.href = 'factions.html#' + anchor;
  });
});
