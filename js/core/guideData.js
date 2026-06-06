// STATE
const GUIDE_INDEX_URL = "data/guides.json";

// BUILD
/** Fetches JSON and raises a useful error for failed static loads */
async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Unable to load " + url + " (" + response.status + ")");
  }
  return response.json();
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
  const path = getGuidePath(entry);
  if (!path) return null;
  return fetchJSON("data/" + path);
}


/** Loads the guide index and all guide JSON files */
export async function loadAllGuides() {
  const index = await loadGuideIndex();
  const guides = await Promise.all(index.map(loadGuide));
  return guides.filter(Boolean);
}


/** Finds one guide index entry by id */
export function findGuideEntry(index, guideId) {
  return (index || []).find(function (entry) {
    return entry && entry.id === guideId;
  }) || null;
}
