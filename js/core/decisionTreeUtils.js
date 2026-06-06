// BUILD
/** Returns the display title for a guide node */
export function getNodeTitle(guide, nodeId) {
  const node = guide && guide.nodes ? guide.nodes[nodeId] : null;
  return node && node.title ? node.title : String(nodeId || "");
}


/** Returns the configured branch label or default */
export function getBranchLabel(node, branch) {
  if (branch === "success") return node && node.successLabel ? node.successLabel : "Success";
  return node && node.failLabel ? node.failLabel : "Fail";
}


/** Escapes a value for safe HTML output */
function escapeHTML(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}


/** Converts a guide key to a stable Mermaid node id */
function getMermaidNodeId(key, usedIds) {
  const base = "node_" + String(key || "item").replace(/[^A-Za-z0-9_]/g, "_");
  let id = base;
  let count = 2;
  while (usedIds[id]) {
    id = base + "_" + count;
    count += 1;
  }
  usedIds[id] = true;
  return id;
}


/** Escapes a value for a Mermaid label */
function escapeMermaidLabel(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "#quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\s+/g, " ")
    .trim();
}


/** Wraps Mermaid labels with line breaks */
function wrapMermaidLabel(value) {
  const words = escapeMermaidLabel(value).split(" ").filter(Boolean);
  const lines = [];
  let line = "";
  words.forEach(function (word) {
    const next = line ? line + " " + word : word;
    if (next.length > 22 && line) {
      lines.push(line);
      line = word;
      return;
    }
    line = next;
  });
  if (line) lines.push(line);
  return lines.join("<br/>");
}


/** Builds Mermaid ids for all configured nodes */
function buildNodeIdMap(nodes) {
  const usedIds = {};
  const map = {};
  Object.keys(nodes || {}).forEach(function (key) {
    map[key] = getMermaidNodeId(key, usedIds);
  });
  return map;
}


/** Adds a Mermaid edge to the diagram output */
function addEdge(lines, fromId, label, toId) {
  lines.push("  " + fromId + " -->|" + escapeMermaidLabel(label) + "| " + toId);
}


/** Builds the Mermaid node declaration for a guide node */
function buildNodeDeclaration(id, key, node) {
  const label = wrapMermaidLabel(node.title || key);
  if (node.type === "question") return "  " + id + "{\"" + label + "\"}";
  return "  " + id + "[\"" + label + "\"]";
}


/** Builds Mermaid flowchart syntax from decision tree data */
export function buildDecisionTreeMermaid(guide, mode) {
  const isPrint = mode === "print";
  const nodes = guide && guide.nodes ? guide.nodes : {};
  const nodeIds = buildNodeIdMap(nodes);
  const screenInit =
  `%%{init: {
    "flowchart": {
      "htmlLabels": true,
      "nodeSpacing": 70,
      "rankSpacing": 90,
      "curve": "basis",
      "wrappingWidth": 180
    }
  }}%%`;  
  const printInit = 
  `%%{init: {
    "flowchart": {
      "htmlLabels": true,
      "nodeSpacing": 70,
      "rankSpacing": 90,
      "curve": "basis",
      "wrappingWidth": 180
    }
  }}%%`;
  const lines = [
    isPrint ? printInit : screenInit,
    "flowchart TD"
  ];
  let hasResolvedEnd = false;
  let hasFailEnd = false;
  const normalClasses = [];
  Object.keys(nodes).forEach(function (key) {
    const node = nodes[key] || {};
    const id = nodeIds[key];
    lines.push(buildNodeDeclaration(id, key, node));
    normalClasses.push(id);
  });
  Object.keys(nodes).forEach(function (key) {
    const node = nodes[key] || {};
    const id = nodeIds[key];
    if (node.successNext === null) {
      hasResolvedEnd = true;
      addEdge(lines, id, getBranchLabel(node, "success"), "RESOLVED");
    } else if (nodeIds[node.successNext]) {
      addEdge(lines, id, getBranchLabel(node, "success"), nodeIds[node.successNext]);
    }
    if (node.failNext === null) {
      hasFailEnd = true;
      addEdge(lines, id, getBranchLabel(node, "fail"), "END");
    } else if (nodeIds[node.failNext]) {
      addEdge(lines, id, getBranchLabel(node, "fail"), nodeIds[node.failNext]);
    }
  });
  if (hasResolvedEnd) lines.push("  RESOLVED([\"Resolved\"])");
  if (hasFailEnd) lines.push("  END([\"End\"])");
  if (normalClasses.length) lines.push("  class " + normalClasses.join(",") + " normal");
  if (hasResolvedEnd) lines.push("  class RESOLVED success");
  if (hasFailEnd) lines.push("  class END fail");
  if (guide && guide.startNode && nodeIds[guide.startNode]) {
    lines.push("  class " + nodeIds[guide.startNode] + " startNode");
  }
  return lines.join("\n");
}


/** Gets the printable node order starting from startNode */
export function getGuideNodeOrder(guide) {
  const nodes = guide && guide.nodes ? guide.nodes : {};
  const order = [];
  const visited = {};
  function visit(nodeId) {
    if (!nodeId || visited[nodeId] || !nodes[nodeId]) return;
    visited[nodeId] = true;
    order.push(nodeId);
    visit(nodes[nodeId].successNext);
    visit(nodes[nodeId].failNext);
  }
  visit(guide && guide.startNode);
  Object.keys(nodes).forEach(visit);
  return order;
}


/** Builds printable reference HTML */
function buildInstructionsHtml(guide) {
  return getGuideNodeOrder(guide).map(function (nodeId, index) {
    const node = guide.nodes[nodeId] || {};
    const body = Array.isArray(node.body) ? node.body : [];
    const bodyHtml = body.map(function (item) {
      return "<li>" + escapeHTML(item) + "</li>";
    }).join("");
    const successTitle = node.successNext === null ? "Resolved" : getNodeTitle(guide, node.successNext);
    const failTitle = node.failNext === null ? "End" : getNodeTitle(guide, node.failNext);
    const successLabel = getBranchLabel(node, "success");
    const failLabel = getBranchLabel(node, "fail");
    const sectionHtml = [
      "<section class=\"print-node\">",
      "<h3>" + escapeHTML(getNodeTitle(guide, nodeId)) + "</h3>",
      "<ul>" + bodyHtml + "</ul>",
      "<p class=\"print-branch\"><strong>" + escapeHTML(successLabel) + ":</strong> " + escapeHTML(successTitle) + "</p>",
      "<p class=\"print-branch\"><strong>" + escapeHTML(failLabel) + ":</strong> " + escapeHTML(failTitle) + "</p>",
      "</section>"
    ].join("");
    if (index === 0) return sectionHtml;
    return "<hr class=\"print-node-divider\">" + sectionHtml;
  }).join("");
}


/** Builds a complete printable guide document */
export function buildPrintableGuideHtml(guide) {
  const title = guide && guide.title ? guide.title : "IT How-To Guide";
  const mermaidDefinition = buildDecisionTreeMermaid(guide, "print");
  return [
    "<!doctype html>",
    "<html lang=\"en\">",
    "<head>",
    "<meta charset=\"utf-8\">",
    "<title>" + escapeHTML(title) + "</title>",
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",
    "<style>",
    "body{margin:0;background:#fff;color:#111;font-family:Arial,sans-serif;line-height:1.45;}",
    ".print-page{max-width:190mm;margin:0 auto;padding:16mm;}",
    "h1{margin:0 0 10mm;text-align:center;font-size:22pt;}",
    "h2{margin:10mm 0 4mm;font-size:15pt;font-weight:700;text-align:center;border-bottom:3px solid #888;padding-bottom:2mm;}",
    "h3{margin:0 0 3mm;font-size:12pt;}",
    "ul{margin:0 0 3mm 6mm;padding-left:5mm;}",
    "li{margin-bottom:2mm;}",
    ".print-node{break-inside:avoid;page-break-inside:avoid;margin-bottom:11mm;}",
    ".print-node-divider{border:0;border-top:2px solid #888;margin:8mm 0;}",
    ".print-branch{margin:1mm 0;font-size:10.5pt;}",
    ".print-diagram{page-break-before:always;break-before:page;margin-top:0;overflow:hidden;}",
    "#printDiagram{width:100%;height:235mm;overflow:hidden;display:flex;align-items:flex-start;justify-content:center;}",
    "#printDiagram svg{display:block;width:100%;max-width:100%;max-height:235mm;height:auto;}",
    "#printDiagram .edgeLabel,#printDiagram .edgeLabel span,#printDiagram span.edgeLabel,#printDiagram .edgeLabel foreignObject,#printDiagram .edgeLabel div,#printDiagram .edgeLabel p{opacity:1!important;visibility:visible!important;color:#111!important;}",
    "#printDiagram .edgeLabel p,#printDiagram .edgeLabel text,#printDiagram .edgeLabel tspan{color:#111!important;fill:#111!important;}",
    "#printDiagram .edgeLabel rect,#printDiagram .labelBkg{fill:transparent!important;stroke:none!important;}",
    ".print-fallback{white-space:pre-wrap;border:1px solid #bbb;padding:4mm;font-size:9pt;}",
    "@page{size:A4;margin:12mm;}",
    "@media print{.print-page{max-width:none;padding:0;}body{background:#fff;color:#111;}}",
    "</style>",
    "</head>",
    "<body>",
    "<main class=\"print-page\">",
    "<h1>" + escapeHTML(title) + "</h1>",
    "<h2>Guide Reference</h2>",
    buildInstructionsHtml(guide),
    "<section class=\"print-diagram\">",
    "<h2>Flowchart</h2>",
    "<div id=\"printDiagram\"></div>",
    "<pre id=\"printFallback\" class=\"print-fallback\"></pre>",
    "</section>",
    "</main>",
    "<script src=\"https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js\"><\/script>",
    "<script>",
    "const mermaidDefinition=" + JSON.stringify(mermaidDefinition) + ";",
    "const fallback=document.getElementById('printFallback');",
    "fallback.textContent=mermaidDefinition;",
    "function printSoon(){setTimeout(function(){window.focus();window.print();},300);}",
    "function fitDiagramToPage(){",
    "const box=document.getElementById('printDiagram');",
    "const svg=box.querySelector('svg');",
    "if(!svg)return;",
    "const boxWidth=box.clientWidth;",
    "const boxHeight=box.clientHeight;",
    "const svgBox=svg.getBBox();",
    "const scale=Math.min(boxWidth/svgBox.width,boxHeight/svgBox.height,1);",
    "svg.setAttribute('width',svgBox.width*scale);",
    "svg.setAttribute('height',svgBox.height*scale);",
    "svg.setAttribute('viewBox',svgBox.x+' '+svgBox.y+' '+svgBox.width+' '+svgBox.height);",
    "}",
    "if(window.mermaid&&window.mermaid.render){",
    "mermaid.initialize({startOnLoad:false});",
    "mermaid.render('printDecisionTreeDiagram',mermaidDefinition).then(function(result){",
    "document.getElementById('printDiagram').innerHTML=result.svg;",
    "fallback.remove();",
    "fitDiagramToPage();",
    "printSoon();",
    "}).catch(printSoon);",
    "}else{printSoon();}",
    "<\/script>",
    "</body>",
    "</html>"
  ].join("");
}
