/* US2 — Filtre des terrains selon le sport. */
(function () {
  // Retourne la liste des sports d'un terrain, même si la donnée est absente, nulle ou vide.
  function sportsDuTerrain(terrain) {
    if (!terrain) return [];
    const sports = terrain.sports ?? terrain.sport;
    const liste = Array.isArray(sports) ? sports : [sports];
    return liste
      .filter((sport) => typeof sport === 'string' && sport.trim() !== '')
      .map((sport) => sport.trim());
  }

  // Retourne les sports distincts trouvés dans les données, triés alphabétiquement.
  function listerSports(terrains) {
    const sports = new Set(terrains.flatMap(sportsDuTerrain));
    return [...sports].sort((a, b) => a.localeCompare(b, 'fr-CA'));
  }

  // Sans sport choisi, tous les terrains correspondent (filtre retiré).
  function correspondAuSport(terrain, sportChoisi) {
    if (!sportChoisi) return true;
    return sportsDuTerrain(terrain).includes(sportChoisi);
  }

  window.FiltresTerrains = { listerSports, correspondAuSport };
})();
