/* Wetinburg Days — static game data. All ids are stable; do not rename. */
window.G = window.G || {};
(function (G) {
'use strict';
const D = G.DATA = {};
D.TOWN = 'Wetinburg';

D.SEASONS = ['Autumn', 'Winter', 'Spring', 'Summer'];
D.DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
D.SEASON_LEN = 28;
D.TIERS = ['F', 'F+', 'D', 'D+', 'C', 'C+', 'B', 'B+', 'A', 'A+', 'S'];

/* ... full content would go here ... */
})(window.G);