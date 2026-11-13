/* US3 — Affichage des détails du terrain sélectionné. */
(function () {
  function afficher(terrain) {
    const panel = document.querySelector('#detail-panel');
    if (!terrain) {
      panel.innerHTML = '<div class="error-state"><p class="eyebrow">Terrain introuvable</p><h2 id="detail-title">Les informations du terrain ne peuvent pas être affichées.</h2></div>';
      return;
    }

    const champ = (valeur) => valeur === undefined || valeur === null || valeur === ''
      ? 'Information non disponible'
      : valeur;
    const emplacement = [terrain.adresse, terrain.municipalite].filter(Boolean).join(', ');
    const tarifs = Array.isArray(terrain.tarifs) && terrain.tarifs.length
      ? terrain.tarifs.map((tarif) => `${tarif.label}: ${tarif.montant}`).join(' · ')
      : null;

    panel.innerHTML = `
      <p class="eyebrow">Détails du terrain</p>
      <h2 id="detail-title">${echapper(champ(terrain.nom))}</h2>
      <dl class="detail-facts">
        <div><dt>Sport</dt><dd>${echapper(champ(terrain.sport))}</dd></div>
        <div><dt>Type</dt><dd>${echapper(champ(terrain.type))}</dd></div>
        <div><dt>Emplacement</dt><dd>${echapper(champ(emplacement || null))}</dd></div>
        <div><dt>Tarifs</dt><dd>${echapper(champ(tarifs))}</dd></div>
        <div><dt>Conditions</dt><dd>${echapper(champ(terrain.conditions))}</dd></div>
      </dl>`;
  }

  function echapper(texte) {
    return String(texte).replace(/[&<>"']/g, (caractere) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[caractere]);
  }

  window.DetailsTerrain = { afficher };
})();
