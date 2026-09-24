// Portfolio IA : thème, apparition au défilement, visionneuse de captures.
// Aucun écouteur de scroll : IntersectionObserver uniquement.
(function () {
  var root = document.documentElement;
  root.classList.add("js");

  // Thème : clair / sombre, mémorisé si le navigateur le permet.
  document.querySelectorAll("[data-theme-toggle]").forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      // Clair par défaut : seul un choix explicite passe le site en sombre.
      var next = root.getAttribute("data-site-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-site-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch (e) {}
    });
  });

  // Apparition des blocs à l'entrée dans l'écran.
  var items = document.querySelectorAll("[data-reveal]");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) {
      el.classList.add("is-in");
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    items.forEach(function (el) {
      io.observe(el);
    });
  }

  // Filtres de la liste des projets : une pastille active à la fois, les cartes des autres
  // catégories sont masquées. Sans script, tous les projets restent visibles.
  document.querySelectorAll("[data-filters]").forEach(function (group) {
    var scope = group.closest("[data-works]");
    if (!scope) return;
    var items = scope.querySelectorAll("[data-cat]");
    group.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-filter]");
      if (!btn) return;
      var f = btn.getAttribute("data-filter");
      group.querySelectorAll("button[data-filter]").forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      items.forEach(function (it) {
        it.hidden = !(f === "all" || it.getAttribute("data-cat") === f);
        if (!it.hidden) it.classList.add("is-in");
      });
    });
  });

  // Infobulles des graphiques : valeur en gras, libellé dessous. Survol et focus clavier.
  // Le texte passe par textContent, jamais par innerHTML.
  var marks = document.querySelectorAll("[data-tip]");
  if (marks.length) {
    var tip = document.createElement("div");
    tip.className = "tip";
    tip.hidden = true;
    var tipValue = document.createElement("strong");
    var tipLabel = document.createElement("span");
    tip.appendChild(tipValue);
    tip.appendChild(tipLabel);
    document.body.appendChild(tip);
    var show = function (el, x, y) {
      var parts = el.getAttribute("data-tip").split("|");
      tipValue.textContent = parts[0];
      tipLabel.textContent = parts[1] || "";
      tip.style.left = x + "px";
      tip.style.top = y + "px";
      tip.hidden = false;
    };
    var hide = function () {
      tip.hidden = true;
    };
    marks.forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        show(el, e.pageX, e.pageY);
      });
      el.addEventListener("pointerleave", hide);
      el.addEventListener("focus", function () {
        var r = el.getBoundingClientRect();
        show(el, r.left + r.width / 2 + window.scrollX, r.top + window.scrollY);
      });
      el.addEventListener("blur", hide);
    });
  }

  // Visionneuse : agrandit une capture dans une boîte de dialogue native.
  var dialog = document.querySelector("[data-lightbox]");
  if (dialog && typeof dialog.showModal === "function") {
    var img = dialog.querySelector("img");
    var isDark = function () {
      return root.getAttribute("data-site-theme") === "dark";
    };
    document.querySelectorAll("[data-zoom]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        // Les diagrammes existent en version claire et sombre : on agrandit celle du thème.
        var dark = btn.getAttribute("data-zoom-dark");
        img.src = dark && isDark() ? dark : btn.getAttribute("data-zoom");
        dialog.classList.toggle("lightbox--diagram", !!dark);
        img.alt = btn.querySelector("img") ? btn.querySelector("img").alt : "";
        dialog.showModal();
      });
    });
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog || e.target.closest("button")) dialog.close();
    });
    dialog.addEventListener("close", function () {
      img.removeAttribute("src");
    });
  }
})();
