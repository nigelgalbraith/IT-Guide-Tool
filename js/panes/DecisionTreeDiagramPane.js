// IMPORTS
import {
  clearHost,
  addHostClasses,
  renderHostMessage,
  renderHostTitle
} from "../core/helpers.js";
import { buildDecisionTreeMermaid } from "../core/decisionTreeUtils.js";

// STATE
const DIAGRAM_CLASS = "pane-host--decision-tree-diagram";
let renderCount = 0;

// BUILD
/** Finds the configured guide */
function getDecisionTree(guideId) {
  if (!window.guides || !guideId) return null;
  return window.guides[guideId] || null;
}


/** Renders Mermaid syntax into the diagram host */
function renderMermaid(host, syntax) {
  if (!window.mermaid || !window.mermaid.render) {
    renderHostMessage(host, "Mermaid is not loaded.", "dt-diagram-error", false);
    return;
  }
  const diagram = document.createElement("div");
  diagram.className = "dt-diagram-canvas";
  host.appendChild(diagram);
  renderCount += 1;
  window.mermaid.render("decision-tree-diagram-" + renderCount, syntax).then(function (result) {
    diagram.innerHTML = result.svg;
  }).catch(function () {
    renderHostMessage(host, "Unable to render decision tree diagram.", "dt-diagram-error", false);
  });
}


/** Initializes the decision tree diagram pane */
function initDecisionTreeDiagramPane(host, settings) {
  const decisionTree = getDecisionTree(settings.guideKey || "");
  clearHost(host);
  renderHostTitle(host, settings.title || "Guide Flowchart", "dt-diagram-title");
  if (!decisionTree) {
    renderHostMessage(host, "Guide not found.", "dt-diagram-error", false);
    return { destroy() {} };
  }
  renderMermaid(host, buildDecisionTreeMermaid(decisionTree));
  return { destroy() {} };
}


/** Builds the decision tree diagram pane host */
export function buildDecisionTreeDiagramPane(options) {
  const settings = options || {};
  const node = document.createElement("div");
  if (settings.id) node.id = settings.id;
  addHostClasses(node, ["pane-host", DIAGRAM_CLASS, "pane"]);
  const instance = initDecisionTreeDiagramPane(node, settings);
  return { node, destroy: instance.destroy };
}
