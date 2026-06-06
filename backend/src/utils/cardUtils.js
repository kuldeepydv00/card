const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS = ['H', 'D', 'C', 'S']; // Hearts, Diamonds, Clubs, Spades

const getDeck = () => {
  const deck = [];
  for (const rank of RANKS) {
    for (const suit of SUITS) {
      deck.push(`${rank}${suit}`);
    }
  }
  return deck;
};

const isValidCardCode = (code) => {
  const regex = /^([2-9]|10|[JQKA])([HDCS])$/;
  return regex.test(code);
};

const getRankValue = (rank) => {
  const values = {
    'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13
  };
  return values[rank];
};

const getSuitValue = (suit) => {
  // suit order ♠ > ♥ > ♣ > ♦ (S > H > C > D)
  const values = {
    'S': 4, 'H': 3, 'C': 2, 'D': 1
  };
  return values[suit];
};

module.exports = {
  RANKS,
  SUITS,
  getDeck,
  isValidCardCode,
  getRankValue,
  getSuitValue
};
