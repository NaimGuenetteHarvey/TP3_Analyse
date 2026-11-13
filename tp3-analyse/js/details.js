/* US3 — Affichage des détails du terrain sélectionné. */
(function () {
  const INFORMATION_INDISPONIBLE = 'Information non disponible';

  function afficher(terrain) {
    const panel = document.querySelector('#detail-panel');

    if (!terrain) {
      panel.innerHTML =
        '<div class="error-state">' +
          '<span class="empty-icon error-icon" aria-hidden="true">!</span>' +
          '<p class="eyebrow">Terrain introuvable</p>' +
          '<h2 id="detail-title">Les informations du terrain ne peuvent pas être affichées.</h2>' +
        '</div>';
      return;
    }

    const sports = Array.isArray(terrain.sports)
      ? terrain.sports.filter(Boolean)
      : (terrain.sport ? [terrain.sport] : []);
    const sportsHtml = sports.length
      ? sports.map((sport) => '<span class="sport-pill">' + echapper(formater(sport)) + '</span>').join('')
      : '<span class="sport-pill unavailable">' + INFORMATION_INDISPONIBLE + '</span>';

    panel.innerHTML =
      '<div class="detail-topline"><p class="eyebrow">Fiche du terrain</p><span class="detail-indicator"><span></span> Sélectionné</span></div>' +
      '<h2 id="detail-title">' + echapper(formater(terrain.nom)) + '</h2>' +
      '<p class="detail-location">' +
        '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="10" r="2.2" stroke="currentColor" stroke-width="1.7"/></svg>' +
        '<span>' + echapper(formater([terrain.municipalite])) + '</span>' +
      '</p>' +
      '<div class="detail-sports" aria-label="Sports offerts">' + sportsHtml + '</div>' +
      '<dl class="detail-facts">' +
        '<div><dt>Type</dt><dd>' + echapper(formater(terrain.type)) + '</dd></div>' +
        '<div><dt>Emplacement</dt><dd>' + echapper(formaterEmplacement(terrain)) + '</dd></div>' +
        '<div><dt>Tarifs</dt><dd>' + echapper(formater(terrain.tarifs)) + '</dd></div>' +
        '<div><dt>Conditions</dt><dd>' + echapper(formater(terrain.conditions)) + '</dd></div>' +
      '</dl>' +
      '<section class="description-block" aria-labelledby="description-title">' +
        '<h3 id="description-title">À propos de ce terrain</h3>' +
        '<p>' + echapper(formater(terrain.description)) + '</p>' +
      '</section>';
  }

  function formaterEmplacement(terrain) {
    const emplacement = terrain.emplacement;
    const ville = terrain.municipalite;

    if (emplacement && typeof emplacement === 'object' && !Array.isArray(emplacement)) {
      const coordonnees = [];
      if (emplacement.latitude !== null && emplacement.latitude !== undefined) {
        coordonnees.push('Latitude : ' + formater(emplacement.latitude));
      }
      if (emplacement.longitude !== null && emplacement.longitude !== undefined) {
        coordonnees.push('Longitude : ' + formater(emplacement.longitude));
      }
      return formater([emplacement.adresse, ville, ...coordonnees]);
    }

    return formater([emplacement, terrain.adresse, ville]);
  }

  function formater(valeur) {
    if (valeur === null || valeur === undefined) return INFORMATION_INDISPONIBLE;

    if (Array.isArray(valeur)) {
      const elements = valeur.map(formater).filter((element) => element !== INFORMATION_INDISPONIBLE);
      return elements.length ? elements.join(', ') : INFORMATION_INDISPONIBLE;
    }

    if (typeof valeur === 'object') {
      const elements = Object.entries(valeur)
        .filter(([, contenu]) => contenu !== null && contenu !== undefined && contenu !== '')
        .map(([cle, contenu]) => formaterCle(cle) + ' : ' + formater(contenu));
      return elements.length ? elements.join(' · ') : INFORMATION_INDISPONIBLE;
    }

    const texte = String(valeur).trim();
    return texte || INFORMATION_INDISPONIBLE;
  }

  function formaterCle(cle) {
    return cle
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .replace(/^./, (lettre) => lettre.toLocaleUpperCase('fr-CA'));
  }

  function echapper(texte) {
    return String(texte).replace(/[&<>"']/g, (caractere) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[caractere]);
  }

  window.DetailsTerrain = { afficher };
})();
