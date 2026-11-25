/* US4 — Consultation des disponibilités du terrain sélectionné. */
(function () {
  function plagesPourDate(terrain, date) {
    const disponibilites = terrain?.disponibilites;
    if (!date || !Array.isArray(disponibilites)) return [];

    return disponibilites.flatMap((plage) => {
      // Le jeu normal décrit actuellement un horaire récurrent en texte.
      if (typeof plage === 'string') {
        const horaire = /^Horaire simulé : tous les jours, (\d{1,2}) h à (\d{1,2}) h$/.exec(plage);
        if (!horaire) return [];
        const [, debut, fin] = horaire;
        return [{ debut: debut.padStart(2, '0') + ':00', fin: fin.padStart(2, '0') + ':00' }];
      }

      if (plage?.date === date && plage.disponible !== false
          && typeof plage.debut === 'string' && typeof plage.fin === 'string') {
        return [{ debut: plage.debut, fin: plage.fin }];
      }
      return [];
    });
  }

  function afficher(panel, terrain, actualiserTerrain) {
    const section = document.createElement('section');
    section.className = 'description-block disponibilites';
    section.setAttribute('aria-labelledby', 'disponibilites-titre');
    section.innerHTML = `
      <h3 id="disponibilites-titre">Disponibilités</h3>
      <label for="date-disponibilites">Choisir une date</label>
      <input type="date" id="date-disponibilites">
      <p role="status"></p>
      <ul aria-label="Plages horaires disponibles"></ul>`;
    panel.append(section);

    const champDate = section.querySelector('input');
    const message = section.querySelector('[role="status"]');
    const liste = section.querySelector('ul');
    let verificationEnCours = false;

    champDate.addEventListener('change', () => afficherPlages());

    function afficherPlages(avis = '') {
      liste.replaceChildren();
      const plages = plagesPourDate(terrain, champDate.value);
      message.textContent = avis || (champDate.value && plages.length === 0
        ? 'Aucune disponibilité n’a été trouvée pour cette date.'
        : '');

      for (const plage of plages) {
        const ligne = document.createElement('li');
        const bouton = document.createElement('button');
        bouton.type = 'button';
        bouton.textContent = plage.debut + ' à ' + plage.fin;
        bouton.addEventListener('click', () => verifier(plage));
        ligne.append(bouton);
        liste.append(ligne);
      }
    }

    async function verifier(plage) {
      if (verificationEnCours) return;
      const date = champDate.value;
      verificationEnCours = true;
      message.textContent = 'Vérification de la plage horaire…';

      try {
        const terrainActuel = await actualiserTerrain(terrain.id);
        if (!section.isConnected) return;

        terrain = terrainActuel ?? { id: terrain.id, disponibilites: [] };
        if (champDate.value !== date) {
          afficherPlages();
          return;
        }

        const disponible = plagesPourDate(terrain, date).some(
          (actuelle) => actuelle.debut === plage.debut && actuelle.fin === plage.fin
        );

        if (disponible) {
          message.textContent = 'Cette plage horaire est toujours disponible.';
        } else {
          afficherPlages('Cette plage horaire n’est plus disponible. Veuillez sélectionner une autre plage horaire.');
          (liste.querySelector('button') ?? champDate).focus();
        }
      } catch {
        if (section.isConnected && champDate.value === date) {
          message.textContent = 'Impossible de vérifier cette plage horaire. Veuillez réessayer.';
        }
      } finally {
        verificationEnCours = false;
      }
    }
  }

  window.DisponibilitesTerrain = { afficher };
})();
