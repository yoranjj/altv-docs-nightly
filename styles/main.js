// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See LICENSE file in the project root for full license information.
$(".lang-mermaid").each(function () {
  const oldEl = $(this);
  const newEl = $("<div>");
  $.each(this.attributes, function(i, attr) { newEl.attr(attr.name, attr.value); });
  newEl.html(oldEl.html());
  oldEl.replaceWith(newEl);
});
$(function() {
  renderAffix();
  renderFlowcharts();
  $("code.hljs").each(function(i, block) {
    hljs.lineNumbersBlock(block);
  });
  $("#search-query").on("input", function (event) {
    $("#search-query-clear").toggleClass("active", event.currentTarget.value.length > 0);
  });
  $("#pagination").on('page', function (evt, page) {
    $(".content-column").scrollTop(0);
  });
  $('a:not([data-tab])').off("click").on("click", delegateAnchors);
  $("#blackout").on("click", toggleMenu);
  $(".navbar-toggler.back").on("click", toggleMenu);
  $(".navbar-toggler.toc").on("click", toggleMenu);
  $(".navbar-toggler.search").on("click", toggleMenu);
  $("#search-query-clear").on("click", clearSearch);
  $(window).on('resize', function() {
    const searchQuery = $("#search-query");
    if ($(this).width() >= 1024) {
      $(".navbar-toggler.back").click();
    } else if (searchQuery.val() !== "") {
      $(".navbar-toggler.search").click();
    }
  });
  if($(".tabGroup").length > 0) {
    removeTabQuery();
  }
  $(".tabGroup > ul > li > a").each(function () {
    const el = $(this);
    el.attr("href", "#");
    checkTabCode(el);
    checkTabActive(el);
  });
  document.body.addEventListener("click", function (ev) {
    if (!(ev.target instanceof HTMLElement)) return;
    const el = $(ev.target).closest('a[data-tab]');
    if (!el.length) return;
    el.attr("href", "#").attr("aria-controls", "");
    checkTabActive(el);
    removeTabQuery();
  });
});

window.refresh = function (article) {
  renderAffix();
  renderFlowcharts();
}

function removeTabQuery() {
  const url = location.protocol + "//" + location.host + location.pathname + location.hash;
  if (location.href === url) return;
  history.replaceState({}, document.title, url);
}

function checkTabCode(el) {
  const tabId = el.attr("data-tab");
  if (!tabId) return;
  const tabContent = $(".tabGroup > section[data-tab=\"" + tabId + "\"]");
  if (tabContent.children().length != 1 || tabContent.children().find("code").length == 0) return;
  tabContent.addClass("code");
  el.parent().addClass("code");
}

function checkTabActive(el) {
  if(el.attr("aria-selected") !== "true") return;
  el.parent().parent().children().removeClass("active");
  el.parent().addClass("active");
}

function renderFlowcharts() {
  if (typeof mermaid === "undefined") return;
  mermaid.initialize({
    theme: "base",
    themeVariables: {
      primaryColor: "#1F2020",
      primaryBorderColor: "#81B1DB",
      primaryTextColor: "#FFFFFF",
      secondaryColor: "#637777",
      secondaryBorderColor: "#7FDBCA",
      secondaryTextColor: "#FFFFFF",
      tertiaryColor: "#0C1C2A",
      tertiaryBorderColor: "#193A58",
      primaryBorderColor: "#448BCA",
      lineColor: "lightgray"
    },
    startOnLoad: false
  });
  mermaid.init(undefined, ".lang-mermaid");
}

function renderAffix() {
    let tree = traverseArticle();
    const el = $("#affix");
    if (!el) return;
    if (!tree || tree.length <= 0) {
      el.hide();
    } else {
      el.show();
      el.html(formList(tree, ["nav", "bs-docs-sidenav"]));
    }

    function traverseArticle() {
      let headers = $(["h1", "h2", "h3", "h4"].map(el => "article.content " + el).join(", "));
      let stack = [];
      let curr = {};
      headers.each(function () {
        const el = $(this);
        const xref = el.children().length > 1 ? el.children().last() : null;
        const obj = {
          parent: curr,
          type: el.prop("tagName"),
          id: el.prop("id"),
          name: htmlEncode(el.text()),
          href: xref?.hasClass("xref") ? xref.prop("href") : "#" + el.prop("id"),
          children: []
        };
        if (!stack.length) {
          stack.push(curr = obj);
          return;
        }
        if (obj.type === stack[stack.length - 1].type) {
          stack.push(curr = obj);
        } else if (obj.type > curr.type) {
          curr.children.push(curr = obj);
        } else if (obj.type < curr.type) {
          obj.parent = curr.parent.parent;
          curr.parent.parent.children.push(curr = obj);
        } else {
          curr.parent.children.push(obj);
        }
      });

      return stack.length ? stack[0].children : stack;
    }

    function formList(item, classes) {
      var level = 1;
      return getList({ children: item }, [].concat(classes).join(" "));

      function getList(model, cls) {
        if (!model || !model.children) return null;
        let l = model.children.length;
        if (l === 0) return null;
        let html = '<ul class="' + ['level' + level++, cls, model.id].filter(el => el != null).join(' ') + '">';
        for (let i = 0; i < l; i++) {
          let item = model.children[i];
          let href = item.href;
          let name = item.name;
          if (!name) continue;
          html += href ? '<li><a href="' + href + '">' + name.trim() + '</a>' : '<li>' + name;
          let lvl = level;
          html += getList(item, cls) || '';
          level = lvl;
          html += '</li>';
        }
        level = 1;
        html += '</ul>';
        return html;
      }
    }
  }

function htmlEncode(str) {
  if (!str) return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function htmlDecode(value) {
  if (!str) return str;
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function toggleMenu() {
  const el = this.id !== "blackout" ? $(this) : null;
  const y = $("#test");
  const z = $(".back").first();
  const w = $("#search");
  if (el?.hasClass("back")) {
    y?.removeClass("active");
    z?.removeClass("active");
    w?.removeClass("float");
    return;
  }
  if (el?.hasClass("search")) {
    y?.addClass("active");
    z?.addClass("active");
    w?.addClass("float");
    return;
  }
  const x = $("#main-panel");
  const b = $("#blackout");
  const name = el?.hasClass("toc") ? "expand" : "expand2";
  const isActive = x.hasClass(name);
  el?.toggleClass("active");
  x.removeClass();
  if (el && !isActive) x.addClass(name);
  b.toggleClass("active");
}

function clearSearch() {
  $("#search-query").focus().val("").trigger("keyup").trigger("input");
}

var HISTORY_SUPPORT = !!(history && history.pushState);

function scrollIfAnchor(link, pushToHistory) {
  if (!/^#[^ ]+$/.test(link)) return false;

  const match = document.getElementById(link.slice(1));

  if (!match) return false;

  $(".content-column").scrollTop(match.offsetTop);

  if (HISTORY_SUPPORT && pushToHistory) history.pushState({}, document.title, location.pathname + link);

  return true;
}

function delegateAnchors(e) {
  var elem = e.target;

  if (scrollIfAnchor(elem.getAttribute('href'), true)) {
    e.preventDefault();
  }
}
