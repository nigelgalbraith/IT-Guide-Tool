// IMPORTS
import {
  el,
  clearHost,
  addHostClasses,
  renderHostMessage,
  renderHostTitle
} from "../core/helpers.js";
import { getBranchLabel } from "../core/decisionTreeUtils.js";

// STATE
const DECISION_TREE_CLASS = "pane-host--decision-tree";

// BUILD
/** Gets the configured node by id */
function getNode(decisionTree, nodeId) {
  if (!decisionTree || !decisionTree.nodes || !nodeId) return null;
  return decisionTree.nodes[nodeId] || null;
}


/** Resolves the first node id for a decision tree */
function getStartNodeId(decisionTree) {
  if (!decisionTree || !decisionTree.nodes) return "";
  if (decisionTree.startNode) return decisionTree.startNode;
  return Object.keys(decisionTree.nodes)[0] || "";
}


/** Renders the completion message */
function renderEnd(host) {
  clearHost(host);
  renderHostTitle(host, "Completed", "dt-title");
  renderHostMessage(host, "This guide is complete.", "dt-body", false, "p");
}


/** Renders node body content as plain text */
function renderNodeBody(host, body) {
  if (Array.isArray(body)) {
    const list = el("ul", "dt-body dt-body-list");
    body.forEach(function (item) {
      list.appendChild(el("li", "", item));
    });
    host.appendChild(list);
    return list;
  }
  return renderHostMessage(host, "No instructions configured.", "dt-body", false, "p");
}


/** Renders a decision tree node */
function renderNode(host, node, history, onBack, onSuccess, onFail) {
  clearHost(host);
  renderHostTitle(host, node.title || "Node", "dt-title");
  renderNodeBody(host, node.body);
  const actions = el("div", "dt-actions");
  const backButton = document.createElement("button");
  const successButton = document.createElement("button");
  const failButton = document.createElement("button");
  backButton.type = "button";
  successButton.type = "button";
  failButton.type = "button";
  backButton.className = "dt-button btn-back";
  successButton.className = "dt-button btn-success";
  failButton.className = "dt-button btn-fail";
  backButton.textContent = "Back";
  successButton.textContent = getBranchLabel(node, "success");
  failButton.textContent = getBranchLabel(node, "fail");
  backButton.disabled = !history.length;
  backButton.addEventListener("click", onBack);
  successButton.addEventListener("click", onSuccess);
  failButton.addEventListener("click", onFail);
  actions.appendChild(backButton);
  actions.appendChild(successButton);
  actions.appendChild(failButton);
  host.appendChild(actions);
  return {
    destroy() {
      backButton.removeEventListener("click", onBack);
      successButton.removeEventListener("click", onSuccess);
      failButton.removeEventListener("click", onFail);
    }
  };
}


/** Initializes the decision tree pane */
function initDecisionTreePane(host, settings) {
  const decisionTree = settings.guide || null;
  let cleanup = null;
  let currentNodeId = "";
  const history = [];
  if (!decisionTree) {
    renderHostMessage(host, "Guide not found.", "dt-error", true);
    return { destroy() {} };
  }
  function showNode(nodeId) {
    const node = getNode(decisionTree, nodeId);
    if (cleanup && cleanup.destroy) cleanup.destroy();
    cleanup = null;
    if (!node) {
      renderEnd(host);
      return;
    }
    currentNodeId = nodeId;
    cleanup = renderNode(host, node, history, function () {
      const previousNodeId = history.pop();
      if (previousNodeId) showNode(previousNodeId);
    }, function () {
      history.push(currentNodeId);
      showNode(node.successNext);
    }, function () {
      history.push(currentNodeId);
      showNode(node.failNext);
    });
  }
  showNode(getStartNodeId(decisionTree));
  return {
    destroy() {
      if (cleanup && cleanup.destroy) cleanup.destroy();
    }
  };
}


/** Builds the decision tree pane host */
export function buildDecisionTreePane(options) {
  const settings = options || {};
  const node = document.createElement("div");
  if (settings.id) node.id = settings.id;
  addHostClasses(node, ["pane-host", DECISION_TREE_CLASS, "pane"]);
  const instance = initDecisionTreePane(node, settings);
  return { node, destroy: instance.destroy };
}
