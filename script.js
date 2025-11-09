document.getElementById("generateBtn").addEventListener("click", () => {
  const grammarText = document.getElementById("grammar").value.trim();
  const inputString = document
    .getElementById("inputString")
    .value.trim()
    .split(/\s+/);

  if (!grammarText || inputString.length === 0) {
    alert("Please enter both grammar and input string!");
    return;
  }

  // Parse grammar rules
  const rules = {};
  grammarText.split("\n").forEach(line => {
    if (!line.includes("→")) return;
    const [lhs, rhs] = line.split("→").map(s => s.trim());
    const productions = rhs.split("|").map(s => s.trim().split(/\s*/).filter(Boolean));
    rules[lhs] = productions;
  });

  const startSymbol = Object.keys(rules)[0];
  const resultDiv = document.getElementById("result");
  const treeContainer = document.getElementById("treeContainer");
  treeContainer.innerHTML = "";

  // Recursive parser
  function parse(symbol, tokens, index = 0) {
    if (index >= tokens.length) return null;

    // If terminal
    if (!rules[symbol]) {
      if (tokens[index] === symbol) {
        return { node: symbol, nextIndex: index + 1 };
      }
      return null;
    }

    // Try each production
    for (const production of rules[symbol]) {
      let children = [];
      let nextIndex = index;
      let success = true;

      for (const sym of production) {
        const result = parse(sym, tokens, nextIndex);
        if (!result) {
          success = false;
          break;
        }
        children.push(result.node);
        nextIndex = result.nextIndex;
      }

      if (success) {
        return {
          node: { name: symbol, children },
          nextIndex,
        };
      }
    }

    return null;
  }

  const tree = parse(startSymbol, inputString);

  if (tree && tree.nextIndex === inputString.length) {
    resultDiv.textContent = "✅ String accepted by grammar!";
    resultDiv.style.color = "green";
    drawTree(tree.node);
  } else {
    resultDiv.textContent = "❌ String not accepted by grammar.";
    resultDiv.style.color = "red";
  }

  // Visualize parse tree
  function drawTree(root) {
    const nodes = [];
    const edges = [];
    let id = 0;

    function traverse(node, parentId = null) {
      const currentId = id++;
      const label = typeof node === "string" ? node : node.name;
      nodes.push({ id: currentId, label });

      if (parentId !== null) {
        edges.push({ from: parentId, to: currentId });
      }

      if (typeof node !== "string" && node.children) {
        node.children.forEach(child => traverse(child, currentId));
      }
    }

    traverse(root);

    const data = { nodes: new vis.DataSet(nodes), edges: new vis.DataSet(edges) };
    const options = {
      layout: { hierarchical: { direction: "UD", sortMethod: "directed" } },
      nodes: {
        shape: "box",
        color: "#e0e7ff",
        borderWidth: 1,
        font: { size: 18, color: "#111827" },
      },
      edges: { color: "#4f46e5" },
      physics: false,
    };

    new vis.Network(treeContainer, data, options);
  }
});
