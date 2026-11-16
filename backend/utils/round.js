// arrotonda ai centesimi: 12.345 → 12.35 (per totali e IVA)
const round = (value) => Math.round(value * 100) / 100;

module.exports = round;
