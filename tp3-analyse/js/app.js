/* Chargement des terrains, recherche et sélection pour l’US3. */
(async function () {
  const liste = document.querySelector('#terrain-list');
  const message = document.querySelector('#app-message');
  const champRecherche = document.querySelector('#terrain-search');
  const compteur = document.querySelector('#result-count');
  const resume = document.querySelector('#filter-summary');
  const filtreSport = document.querySelector('#sport-filter');
  const boutonRetirerFiltre = document.querySelector('#sport-filter-reset');
  // Défini par js/filtres.js (US2). S'il est absent, la liste des terrains s'affiche quand même.
  const filtres = window.FiltresTerrains;
  if (!filtres) console.error('js/filtres.js n’est pas chargé : vérifiez le fichier et la balise <script> dans index.html.');
  const jeuxDisponibles = ['normal', 'limites', 'erreurs'];
  const jeuDemande = new URLSearchParams(window.location.search).get('jeu');
  const jeu = jeuxDisponibles.includes(jeuDemande) ? jeuDemande : 'normal';
  const terrainIdDemande = new URLSearchParams(window.location.search).get('terrainId');
  let terrains = [];
  let terrainSelectionne = null;

  try {
    const reponse = await fetch('data/' + jeu + '.json');
    if (!reponse.ok) throw new Error('Chargement impossible');

    const contenu = await reponse.text();
    const donnees = contenu.trim() ? JSON.parse(contenu) : { terrains: [] };
    terrains = Array.isArray(donnees) ? donnees : donnees.terrains;
    if (!Array.isArray(terrains)) throw new Error('Format de données invalide');
    remplirFiltreSport();
    afficherListe();

    if (terrainIdDemande !== null) {
      terrainSelectionne = terrains.find((terrain) => terrain && String(terrain.id) === terrainIdDemande) || null;
      if (terrainSelectionne) afficherListe();
      window.DetailsTerrain.afficher(terrainSelectionne);
    }
  } catch (erreur) {
    console.error(erreur);
    message.textContent = 'Impossible de charger les données des terrains.';
  }

  champRecherche.addEventListener('input', afficherListe);
  filtreSport.addEventListener('change', afficherListe);
  boutonRetirerFiltre.addEventListener('click', () => {
    filtreSport.value = '';
    afficherListe();
    filtreSport.focus();
  });

  liste.addEventListener('click', (evenement) => {
    const bouton = evenement.target.closest('[data-id]');
    if (!bouton) return;
    terrainSelectionne = terrains.find((terrain) => String(terrain.id) === bouton.dataset.id) || null;
    liste.querySelectorAll('.terrain-card').forEach((carte) => {
      const selectionnee = carte === bouton;
      carte.classList.toggle('is-selected', selectionnee);
      carte.setAttribute('aria-pressed', String(selectionnee));
    });
    window.DetailsTerrain.afficher(terrainSelectionne);
  });

  function afficherListe() {
    const recherche = normaliser(champRecherche.value.trim());
    const sportChoisi = filtreSport.value;
    boutonRetirerFiltre.hidden = !sportChoisi;
    const resultats = terrains.filter((terrain) => {
      if (filtres && !filtres.correspondAuSport(terrain, sportChoisi)) return false;
      const texte = normaliser([
        terrain.nom,
        terrain.municipalite,
        terrain.type,
        terrain.sports ?? terrain.sport
      ].flat().filter(Boolean).join(' '));
      return texte.includes(recherche);
    });

    compteur.textContent = resultats.length + (resultats.length === 1 ? ' terrain' : ' terrains');
    const criteres = [];
    if (recherche) criteres.push('« ' + champRecherche.value.trim() + ' »');
    if (sportChoisi) criteres.push('sport : ' + sportChoisi);
    resume.textContent = criteres.length
      ? resultats.length + (resultats.length === 1 ? ' résultat' : ' résultats') + ' pour ' + criteres.join(' + ')
      : 'Tapez une ville, un sport ou un nom pour trouver rapidement un terrain.';

    if (terrainSelectionne && !resultats.some((terrain) => String(terrain.id) === String(terrainSelectionne.id))) {
      terrainSelectionne = null;
      document.querySelector('#detail-panel').innerHTML =
        '<div class="empty-state"><p class="eyebrow">Détails</p><h2 id="detail-title">Choisissez un terrain dans les résultats.</h2></div>';
    }

    if (terrains.length === 0) {
      liste.innerHTML = '<p class="empty-list">Aucun terrain n’est disponible pour le moment.</p>';
      return;
    }

    if (resultats.length === 0) {
      liste.innerHTML = '<p class="empty-list">Aucun terrain ne correspond aux critères sélectionnés. Modifiez la recherche ou retirez le filtre.</p>';
      return;
    }

    liste.innerHTML = resultats.map((terrain) => {
      const selectionnee = terrainSelectionne && String(terrainSelectionne.id) === String(terrain.id);
      return '<button class="terrain-card' + (selectionnee ? ' is-selected' : '') + '" type="button" data-id="' + echapper(terrain.id) + '" aria-pressed="' + Boolean(selectionnee) + '">' +
        '<span class="card-copy">' +
          '<span class="card-name">' + echapper(terrain.nom || 'Information non disponible') + '</span>' +
          '<span class="card-meta">' + echapper(formaterSports(terrain.sports ?? terrain.sport)) + ' · ' + echapper(terrain.municipalite || 'Municipalité non indiquée') + '</span>' +
        '</span>' +
        '<span class="card-arrow" aria-hidden="true">›</span>' +
      '</button>';
    }).join('');
  }

  // Ajoute un choix par sport trouvé dans les données (le choix « Tous les sports » existe déjà).
  function remplirFiltreSport() {
    if (!filtres) return;
    const sports = filtres.listerSports(terrains);
    sports.forEach((sport) => {
      const option = document.createElement('option');
      option.value = sport;
      option.textContent = sport;
      filtreSport.appendChild(option);
    });
    filtreSport.disabled = sports.length === 0;
  }

  function normaliser(texte) {
    return String(texte).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr-CA');
  }

  function formaterSports(sports) {
    if (Array.isArray(sports)) return sports.length ? sports.join(', ') : 'Information non disponible';
    return sports || 'Information non disponible';
  }

  function echapper(texte) {
    return String(texte).replace(/[&<>"']/g, (caractere) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[caractere]);
  }
})();
