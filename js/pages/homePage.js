import { createPageRuntime } from "../core/pageRuntime.js";
import { loadAllGuides } from "../core/guideData.js";
import { buildIntroPane } from "../panes/IntroPane.js";
import { buildIntroCardPane } from "../panes/IntroCardPane.js";
import { buildFooterPane } from "../panes/FooterPane.js";

// STATE
const HOME_TITLE = "IT How-To Guide";
const HOME_STATE_ENTRIES = [["page", "home"]];
const HOME_INTRO_TEXT = [
  "Pick an IT how-to guide to get started.",
  "Each guide walks through one troubleshooting decision at a time."
];

// BUILD
/** Initializes the home page orchestrator */
export async function initHomePage() {
  const { lifecycle, shell, events, state } = createPageRuntime({
    pageTitle: HOME_TITLE,
    activeNavKey: "home",
    initialState: HOME_STATE_ENTRIES
  });
  const api = { events, state, lifecycle };
  const guides = await loadAllGuides();
  const introSection = document.createElement("section");
  introSection.className = "intro-hero";
  const introPane = buildIntroPane({ text: HOME_INTRO_TEXT, className: "intro-text" }, api);
  const cardPane = buildIntroCardPane({ guides, className: "intro-card-grid" }, api);
  introSection.appendChild(introPane.node);
  introSection.appendChild(cardPane.node);
  shell.contentHost.appendChild(introSection);
  const footerPane = buildFooterPane();
  shell.appRoot.appendChild(footerPane.node);
  lifecycle.add(introPane.destroy);
  lifecycle.add(cardPane.destroy);
  lifecycle.add(footerPane.destroy);
}
