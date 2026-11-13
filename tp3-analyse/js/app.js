/* Chargement des terrains et sélection pour ouvrir la fiche US3. */
(async function () {
  const liste = document.querySelector('#terrain-list');
  const message = document.querySelector('#app-message');

  try {
    const reponse = await fetch('data/terrains.json');
    if (!reponse.ok) throw new Error('Chargement impossible');
    const terrains = await reponse.json();
    document.querySelector('#result-count').textContent = terrains.length;

    if (terrains.length === 0) {
      liste.innerHTML = '<p class="empty-list">Aucun terrain à afficher pour le moment.</p>';
      return;
    }

    liste.innerHTML = terrains.map((terrain) => `
      <button class="terrain-card" type="button" data-id="${echapper(terrain.id)}">
        <span class="card-copy">
          <span class="card-name">${echapper(terrain.nom || 'Information non disponible')}</span>
          <span class="card-meta">${echapper(terrain.sport || 'Information non disponible')}</span>
        </span>
        <span class="card-arrow" aria-hidden="true">›</span>
      </button>`).join('');

    liste.addEventListener('click', (evenement) => {
      const bouton = evenement.target.closest('[data-id]');
      if (!bouton) return;
      liste.querySelectorAll('.terrain-card').forEach((carte) => {
        const selectionnee = carte === bouton;
        carte.classList.toggle('is-selected', selectionnee);
        carte.setAttribute('aria-pressed', String(selectionnee));
      });
      window.DetailsTerrain.afficher(terrains.find((terrain) => String(terrain.id) === bouton.dataset.id));
    });
  } catch {
    message.textContent = 'Impossible de charger les données des terrains.';
  }

  function echapper(texte) {
    return String(texte).replace(/[&<>"']/g, (caractere) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[caractere]);
  }
})();
