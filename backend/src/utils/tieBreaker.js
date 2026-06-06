const { getRankValue, getSuitValue } = require('./cardUtils');

const crypto = require('crypto');

const resolveTie = (tiedCards, rule) => {
  if (tiedCards.length === 0) return null;
  if (tiedCards.length === 1) return tiedCards[0];

  if (rule === 'rank_order') {
    // Sort by rank index (lower wins) then suit order (S > H > C > D)
    return [...tiedCards].sort((a, b) => {
      const rankA = a.match(/^([2-9]|10|[JQKA])/)[1];
      const suitA = a.match(/([HDCS])$/)[1];
      const rankB = b.match(/^([2-9]|10|[JQKA])/)[1];
      const suitB = b.match(/([HDCS])$/)[1];

      if (getRankValue(rankA) !== getRankValue(rankB)) {
        return getRankValue(rankA) - getRankValue(rankB);
      }
      return getSuitValue(suitB) - getSuitValue(suitA); 
    })[0];
  }

  // Default: random
  const randomIndex = crypto.randomInt(0, tiedCards.length);
  return tiedCards[randomIndex];
};

module.exports = { resolveTie };
