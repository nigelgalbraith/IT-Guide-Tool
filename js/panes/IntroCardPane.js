// IMPORTS
import { NOOP_PANE, addHostClasses, el, renderHostMessage, renderTextArray } from "../core/helpers.js";

// STATE
const CARDS_CLASS = "intro-card-grid";

// BUILD
/** Gets card content as text blocks */
function getCardText(guide) {
  return Array.isArray(guide.cardText) ? guide.cardText : [];
}


/** Builds one intro card element */
function buildCard(guide) {
  const card = el("div", "intro-card");
  const link = document.createElement("a");
  link.href = "index.html?page=guide&guide=" + encodeURIComponent(guide.id || "");
  link.appendChild(el("h2", "", guide.title || guide.id || ""));
  renderTextArray(link, getCardText(guide));
  card.appendChild(link);
  return card;
}


/** Initializes the intro cards pane node */
function initIntroCardsPane(host, settings) {
  const guides = settings.guides || [];
  if (!guides.length) {
    renderHostMessage(host, "No guides configured.", "", true, "p");
    return NOOP_PANE;
  }
  guides.forEach(function (guide) {
    if (guide) host.appendChild(buildCard(guide));
  });
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
