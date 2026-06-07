// STATE
const GUIDE_INDEX_URL = "data/guides.json";

// BUILD
/** Fetches JSON and raises a useful error for failed static loads */
async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Unable to load " + url + " (" + response.status + ")");
  }
  return response.text();
}


/** Fetches JSON and raises a useful error for failed static loads */
async function fetchJSON(url) {
  return JSON.parse(await fetchText(url));
}


/** Loads the guide index */
export async function loadGuideIndex() {
  const data = await fetchJSON(GUIDE_INDEX_URL);
  return Array.isArray(data.guides) ? data.guides : [];
}


/** Returns the JSON path for an index entry */
export function getGuidePath(entry) {
  if (!entry || !entry.id) return "";
  return entry.path || "guides/" + entry.id + ".json";
}


/** Loads one guide JSON file from an index entry */
export async function loadGuide(entry) {
  const result = await loadGuideWithSource(entry);
  return result ? result.guide : null;
}


/** Loads one guide JSON file with its raw source text */
export async function loadGuideWithSource(entry) {
  const path = getGuidePath(entry);
  if (!path) return null;
  const sourceText = await fetchText("data/" + path);
  return {
    guide: JSON.parse(sourceText),
    sourceText
  };
}


/** Loads the guide index and all guide JSON files */
export async function loadAllGuides() {
  const index = await loadGuideIndex();
  const guides = await Promise.all(index.map(function (entry) {
    return loadGuide(entry).catch(function (error) {
      console.warn("Unable to load guide:", getGuidePath(entry), error);
      return null;
    });
  }));
  return guides.filter(Boolean);
}


/** Finds one guide index entry by id */
export function findGuideEntry(index, guideId) {
  return (index || []).find(function (entry) {
    return entry && entry.id === guideId;
  }) || null;
}
