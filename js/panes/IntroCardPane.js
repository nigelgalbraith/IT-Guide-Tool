// IMPORTS
import { NOOP_PANE, addHostClasses, renderHostMessage } from "../core/helpers.js";

// STATE
const CARDS_CLASS = "intro-card-grid";

// BUILD
/** Builds the intro card list HTML */
function buildCardsHTML(guides) {
  return guides.map(function (guide) {
    if (!guide) return "";
    const title = guide.title || guide.id || "";
    const desc = guide.description || "";
    const link = "index.html?page=guide&guide=" + encodeURIComponent(guide.id || "");
    return '<div class="intro-card"><a href="' + link + '"><h2>' + title + '</h2><p>' + desc + '</p></a></div>';
  }).join("");
}


/** Initializes the intro cards pane node */
function initIntroCardsPane(host, settings) {
  const guides = settings.guides || [];
  if (!guides.length) {
    renderHostMessage(host, "No guides configured.", "", true, "p");
    return NOOP_PANE;
  }
  host.innerHTML = buildCardsHTML(guides);
  return NOOP_PANE;
}


/** Builds the intro cards pane */
export function buildIntroCardPane(options) {
  const settings = options || {};
  const node = document.createElement("div");
  node.className = settings.className || CARDS_CLASS;
  if (settings.id) node.id = settings.id;
  addHostClasses(node, ["pane-host", "pane-host--intro-cards"]);
  const instance = initIntroCardsPane(node, settings);
  return { node, destroy: instance.destroy };
}
