/* ============================================================
   Eureka Simulations — Homepage script.js
   Tiny, dependency-free tab filter: click a subject to show only
   that section, click "All" to show everything.
   ============================================================ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var tabs = document.querySelectorAll('.eu-tab');
    var sections = document.querySelectorAll('.eu-section');

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var filter = tab.getAttribute('data-filter');

        tabs.forEach(function (t) { t.classList.toggle('active', t === tab); });

        sections.forEach(function (section) {
          var match = filter === 'all' || section.getAttribute('data-subject') === filter;
          section.classList.toggle('eu-hidden', !match);
        });
      });
    });
  });
})();
