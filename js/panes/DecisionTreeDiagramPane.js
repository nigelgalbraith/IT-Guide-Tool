// IMPORTS
import {
  clearHost,
  addHostClasses,
  renderHostMessage,
  renderHostTitle
} from "../core/helpers.js";
import { buildDecisionTreeMermaid } from "../core/decisionTreeUtils.js";
import { renderMermaidElement } from "../core/mermaidLoader.js";

// STATE
const DIAGRAM_CLASS = "pane-host--decision-tree-diagram";

// BUILD
/** Renders Mermaid syntax into the diagram host */
function renderMermaid(host, syntax) {
  const diagram = document.createElement("div");
  diagram.className = "mermaid dt-diagram-canvas";
  diagram.textContent = syntax;
  host.appendChild(diagram);
  renderMermaidElement(diagram).catch(function () {
    renderHostMessage(host, "Unable to render decision tree diagram.", "dt-diagram-error", false);
  });
}


/** Initializes the decision tree diagram pane */
function initDecisionTreeDiagramPane(host, settings) {
  const decisionTree = settings.guide || null;
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
