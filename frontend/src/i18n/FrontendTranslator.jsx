import { useEffect } from "react";
import { translatePhrase } from "./translations";

const originalText = new WeakMap();
const originalAttributes = new WeakMap();
const lastLocalizedText = new WeakMap();

function preserveWhitespace(value, translated) {
  const leading = value.match(/^\s*/)?.[0] || "";
  const trailing = value.match(/\s*$/)?.[0] || "";
  return `${leading}${translated}${trailing}`;
}

function localize(root, language) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    if (node.parentElement?.closest("script, style")) return;
    const current = node.nodeValue || "";
    const normalized = current.replace(/\s+/g, " ").trim();
    if (!normalized) return;
    if (!originalText.has(node)) originalText.set(node, normalized);
    const original = originalText.get(node);
    const localized = preserveWhitespace(
      current,
      translatePhrase(original, language),
    );
    lastLocalizedText.set(node, localized);
    if (node.nodeValue !== localized) node.nodeValue = localized;
  });

  root.querySelectorAll?.("[placeholder], [title], [aria-label]").forEach((node) => {
    if (!originalAttributes.has(node)) originalAttributes.set(node, {});
    const stored = originalAttributes.get(node);
    ["placeholder", "title", "aria-label"].forEach((attribute) => {
      if (!node.hasAttribute(attribute)) return;
      if (!stored[attribute]) stored[attribute] = node.getAttribute(attribute);
      node.setAttribute(attribute, translatePhrase(stored[attribute], language));
    });
  });
}

export default function FrontendTranslator() {
  useEffect(() => {
    let language = localStorage.getItem("gordondm_language") || "bs";
    let applying = false;
    const apply = () => {
      applying = true;
      localize(document.body, language);
      applying = false;
    };
    const onLanguage = (event) => {
      language = event.detail;
      apply();
    };
    const observer = new MutationObserver((mutations) => {
      if (applying) return;
      mutations.forEach((mutation) => {
        if (
          mutation.type === "characterData" &&
          mutation.target.nodeValue !== lastLocalizedText.get(mutation.target)
        ) {
          originalText.set(
            mutation.target,
            mutation.target.nodeValue.replace(/\s+/g, " ").trim(),
          );
        }
      });
      apply();
    });
    apply();
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    window.addEventListener("gordondm:language", onLanguage);
    return () => {
      observer.disconnect();
      window.removeEventListener("gordondm:language", onLanguage);
    };
  }, []);
  return null;
}
