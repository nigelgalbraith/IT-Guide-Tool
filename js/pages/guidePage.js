import { createPageRuntime } from "../core/pageRuntime.js";
import { titleCase } from "../core/helpers.js";
import { findGuideEntry, loadGuide, loadGuideIndex } from "../core/guideData.js";
import { buildIntroPane } from "../panes/IntroPane.js";
import { buildDecisionTreePane } from "../panes/DecisionTreePane.js";
import { buildDecisionTreeDiagramPane } from "../panes/DecisionTreeDiagramPane.js";
import { buildDecisionTreePrintPane } from "../panes/DecisionTreePrintPane.js";

// STATE
const BASE_TITLE = "IT How-To Guide";
const BACK_NAV_KEY = "home";
const MISSING_PARAM_HTML = "<p>Missing required URL parameter: <code>?guide=</code></p>";
const MISSING_GUIDE_HTML = "<p>Guide not found.</p>";
const GUIDE_STATE_ENTRIES = [["page", "guide"]];

// BUILD
/** Reads the current guide key from the URL */
function getGuideKey() {
  const params = new URLSearchParams(window.location.search);
  return (params.get("guide") || "").trim();
}


/** Initializes the guide page orchestrator */
export async function initGuidePage() {
  const { lifecycle, shell, events, state } = createPageRuntime({
    pageTitle: BASE_TITLE,
    activeNavKey: BACK_NAV_KEY,
    initialState: GUIDE_STATE_ENTRIES
  });
  const api = { events, state, lifecycle };
  const guide = getGuideKey();
  const heading = shell.header.querySelector("#pageTitle");
  if (!guide) {
    const introHost = document.createElement("div");
    introHost.className = "intro-text";
    introHost.id = "introHost";
    introHost.innerHTML = MISSING_PARAM_HTML;
    shell.contentHost.appendChild(introHost);
    if (heading) heading.textContent = BASE_TITLE;
    document.title = BASE_TITLE;
    return;
  }
  const guideIndex = await loadGuideIndex();
  const guideEntry = findGuideEntry(guideIndex, guide);
  const guideConfig = guideEntry ? await loadGuide(guideEntry) : null;
  if (!guideConfig) {
    const introHost = document.createElement("div");
    introHost.className = "intro-text";
    introHost.id = "introHost";
    introHost.innerHTML = MISSING_GUIDE_HTML;
    shell.contentHost.appendChild(introHost);
    if (heading) heading.textContent = titleCase(guide);
    document.title = titleCase(guide);
    return;
  }
  const displayName = guideConfig.title || titleCase(guide);
  if (heading) heading.textContent = displayName;
  document.title = displayName;
  const introPane = buildIntroPane({
    html: guideConfig.intro || "",
    className: "intro-text",
    id: "introHost"
  }, api);
  const decisionTreePane = buildDecisionTreePane({
    id: "decisionTreeHost",
    guide: guideConfig,
    title: "Decision Tree"
  }, api);
  const diagramPane = buildDecisionTreeDiagramPane({
    id: "decisionTreeDiagramHost",
    guide: guideConfig,
    title: "Guide Flowchart"
  }, api);
  const printPane = buildDecisionTreePrintPane({
    id: "decisionTreePrintHost",
    guide: guideConfig,
    title: "Print"
  }, api);
  shell.contentHost.appendChild(introPane.node);
  shell.contentHost.appendChild(decisionTreePane.node);
  shell.contentHost.appendChild(diagramPane.node);
  shell.contentHost.appendChild(printPane.node);
  lifecycle.add(introPane.destroy);
  lifecycle.add(decisionTreePane.destroy);
  lifecycle.add(diagramPane.destroy);
  lifecycle.add(printPane.destroy);
}
