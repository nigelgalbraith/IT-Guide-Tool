// BUILD
/** Skips whitespace in JSON source text */
function skipWhitespace(source, index) {
  let cursor = index;
  while (cursor < source.length && /\s/.test(source.charAt(cursor))) cursor += 1;
  return cursor;
}


/** Reads a JSON string value from source text */
function readJSONString(source, index) {
  let cursor = index + 1;
  let value = "";
  while (cursor < source.length) {
    const char = source.charAt(cursor);
    if (char === "\\") {
      value += char + source.charAt(cursor + 1);
      cursor += 2;
      continue;
    }
    if (char === "\"") return { value, end: cursor + 1 };
    value += char;
    cursor += 1;
  }
  return { value, end: cursor };
}


/** Finds the opening brace for the top-level nodes object in raw guide JSON */
function findNodesObjectStart(sourceText) {
  const source = String(sourceText || "");
  let cursor = 0;
  while (cursor < source.length) {
    if (source.charAt(cursor) !== "\"") {
      cursor += 1;
      continue;
    }
    const token = readJSONString(source, cursor);
    cursor = token.end;
    if (token.value !== "nodes") continue;
    const colonIndex = skipWhitespace(source, cursor);
    if (source.charAt(colonIndex) !== ":") continue;
    const objectIndex = skipWhitespace(source, colonIndex + 1);
    if (source.charAt(objectIndex) === "{") return objectIndex;
  }
  return -1;
}


/** Reads direct object keys from a raw JSON object */
function readDirectObjectKeys(sourceText, objectStart) {
  const source = String(sourceText || "");
  const keys = [];
  let cursor = objectStart;
  let depth = 0;
  let expectingKey = false;
  while (cursor < source.length) {
    const char = source.charAt(cursor);
    if (char === "\"") {
      const token = readJSONString(source, cursor);
      if (depth === 1 && expectingKey) {
        const colonIndex = skipWhitespace(source, token.end);
        if (source.charAt(colonIndex) === ":") {
          keys.push(token.value);
          expectingKey = false;
        }
      }
      cursor = token.end;
      continue;
    }
    if (char === "{" || char === "[") {
      depth += 1;
      if (depth === 1) expectingKey = true;
      cursor += 1;
      continue;
    }
    if (char === "}" || char === "]") {
      depth -= 1;
      cursor += 1;
      if (depth <= 0) break;
      continue;
    }
    if (depth === 1 && char === ",") expectingKey = true;
    cursor += 1;
  }
  return keys;
}


/** Finds duplicate node ids from raw guide JSON before parsing collapses keys */
function getDuplicateNodeIds(sourceText) {
  const objectStart = findNodesObjectStart(sourceText);
  if (objectStart < 0) return [];
  const counts = {};
  readDirectObjectKeys(sourceText, objectStart).forEach(function (key) {
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.keys(counts).filter(function (key) {
    return counts[key] > 1;
  });
}


/** Returns whether a value is a plain object */
function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}


/** Adds a reference validation error when a next pointer is invalid */
function validateNextReference(errors, nodes, nodeId, property) {
  const node = nodes[nodeId] || {};
  const nextNodeId = node[property];
  if (nextNodeId === undefined || nextNodeId === null) return;
  if (!Object.prototype.hasOwnProperty.call(nodes, nextNodeId)) {
    errors.push("Node \"" + nodeId + "\" has invalid " + property + " reference \"" + nextNodeId + "\".");
  }
}


/** Validates guide data before rendering guide panes */
export function validateGuideData(guide, options) {
  const settings = options || {};
  const errors = [];
  if (!isPlainObject(guide)) {
    return ["Guide data is missing or invalid."];
  }
  const nodes = isPlainObject(guide.nodes) ? guide.nodes : null;
  if (!nodes) {
    errors.push("Guide is missing a valid nodes object.");
  }
  getDuplicateNodeIds(settings.sourceText).forEach(function (nodeId) {
    errors.push("Duplicate node id found: \"" + nodeId + "\".");
  });
  if (!Object.prototype.hasOwnProperty.call(guide, "startNode") || !String(guide.startNode || "").trim()) {
    errors.push("Guide is missing startNode.");
  } else if (nodes && !Object.prototype.hasOwnProperty.call(nodes, guide.startNode)) {
    errors.push("startNode references missing node \"" + guide.startNode + "\".");
  }
  if (!nodes) return errors;
  Object.keys(nodes).forEach(function (nodeId) {
    const node = nodes[nodeId];
    if (!String(nodeId || "").trim()) {
      errors.push("A node is missing an id.");
    }
    if (!isPlainObject(node)) {
      errors.push("Node \"" + nodeId + "\" must be an object.");
      return;
    }
    if (node.id !== undefined && node.id !== nodeId) {
      errors.push("Node \"" + nodeId + "\" has mismatched id \"" + node.id + "\".");
    }
    if (!Object.prototype.hasOwnProperty.call(node, "title") || !String(node.title || "").trim()) {
      errors.push("Node \"" + nodeId + "\" is missing title.");
    }
    if (!Object.prototype.hasOwnProperty.call(node, "body")) {
      errors.push("Node \"" + nodeId + "\" is missing body.");
    } else if (!Array.isArray(node.body)) {
      errors.push("Node \"" + nodeId + "\" body must be a list.");
    }
    validateNextReference(errors, nodes, nodeId, "successNext");
    validateNextReference(errors, nodes, nodeId, "failNext");
  });
  return errors;
}
