// metto "\" davanti ai caratteri speciali: la ricerca "a.b" cerca proprio "a.b"
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = escapeRegex;
