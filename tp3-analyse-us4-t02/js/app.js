/* Chargement des terrains, recherche et sélection pour l’US3. */
(async function () {
  const liste = document.querySelector('#terrain-list');
  const message = document.querySelector('#app-message');
  const champRecherche = document.querySelector('#terrain-search');
  const compteur = document.querySelector('#result-count');
  const resume = document.querySelector('#filter-summary');
  const jeuxDisponibles = ['normal', 'limites', 'erreurs'];
  const parametres = new URLSearchParams(window.location.search);
  const jeuDemande = parametres.get('jeu');
  const jeu = jeuxDisponibles.includes(jeuDemande) ? jeuDemande : 'normal';
  const terrainIdDemande = parametres.get('terrainId');
  let terrains = [];
  let terrainSelectionne = null;

  try {
    terrains = await chargerTerrains();
    afficherListe();

    if (terrainIdDemande !== null) {
      terrainSelectionne = terrains.find((terrain) => terrain && String(terrain.id) === terrainIdDemande) || null;
      if (terrainSelectionne) afficherListe();
      afficherFiche();
    }
  } catch {
    message.textContent = 'Impossible de charger les données des terrains.';
  }

  champRecherche.addEventListener('input', afficherListe);

  liste.addEventListener('click', (evenement) => {
    const bouton = evenement.target.closest('[data-id]');
    if (!bouton) return;
    terrainSelectionne = terrains.find((terrain) => String(terrain.id) === bouton.dataset.id) || null;
    liste.querySelectorAll('.terrain-card').forEach((carte) => {
      const selectionnee = carte === bouton;
      carte.classList.toggle('is-selected', selectionnee);
      carte.setAttribute('aria-pressed', String(selectionnee));
    });
    afficherFiche();
  });

  function afficherFiche() {
    window.DetailsTerrain.afficher(terrainSelectionne);
    if (terrainSelectionne) {
      const panel = document.querySelector('#detail-panel');
      window.DisponibilitesTerrain.afficher(panel, terrainSelectionne, async (id) => {
        const simulerRetrait = parametres.get('demoUs4') === 'retrait'
          && jeu === 'normal' && String(id) === '2';
        const jeuVerification = simulerRetrait ? 'us4-retrait' : jeu;
        const donneesActuelles = await chargerTerrains(jeuVerification, { cache: 'no-store' });
        return donneesActuelles.find((terrain) => terrain && String(terrain.id) === String(id));
      });
    }
  }

  async function chargerTerrains(jeuACharger = jeu, options) {
    const reponse = await fetch('data/' + jeuACharger + '.json', options);
    if (!reponse.ok) throw new Error('Chargement impossible');

    const contenu = await reponse.text();
    const donnees = contenu.trim() ? JSON.parse(contenu) : { terrains: [] };
    const donneesTerrains = Array.isArray(donnees) ? donnees : donnees.terrains;
    if (!Array.isArray(donneesTerrains)) throw new Error('Format de données invalide');
    return donneesTerrains;
  }

  function afficherListe() {
    const recherche = normaliser(champRecherche.value.trim());
    const resultats = terrains.filter((terrain) => {
      const texte = normaliser([
        terrain.nom,
        terrain.municipalite,
        terrain.type,
        terrain.sports ?? terrain.sport
      ].flat().filter(Boolean).join(' '));
      return texte.includes(recherche);
    });

    compteur.textContent = resultats.length + (resultats.length === 1 ? ' terrain' : ' terrains');
    resume.textContent = recherche
      ? resultats.length + (resultats.length === 1 ? ' résultat' : ' résultats') + ' pour « ' + champRecherche.value.trim() + ' »'
      : 'Tapez une ville, un sport ou un nom pour trouver rapidement un terrain.';

    if (terrainSelectionne && !resultats.some((terrain) => String(terrain.id) === String(terrainSelectionne.id))) {
      terrainSelectionne = null;
      document.querySelector('#detail-panel').innerHTML =
        '<div class="empty-state"><p class="eyebrow">Détails</p><h2 id="detail-title">Choisissez un terrain dans les résultats.</h2></div>';
    }

    if (resultats.length === 0) {
      liste.innerHTML = '<p class="empty-list">Aucun terrain ne correspond à cette recherche. Essayez un autre mot.</p>';
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
