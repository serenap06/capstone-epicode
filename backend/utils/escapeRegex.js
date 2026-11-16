// mette il "\" davanti ai caratteri speciali delle regex (. * + ? ( ) [ ] ...):
// così la ricerca "a.b" cerca proprio "a.b" e un testo strano non blocca il server
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = escapeRegex;
