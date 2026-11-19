// arrotondo ai centesimi: 12.345 → 12.35
const round = (value) => Math.round(value * 100) / 100;

module.exports = round;
