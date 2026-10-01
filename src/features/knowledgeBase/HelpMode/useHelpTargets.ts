import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { IHelpElement } from "./HelpModeSlice";
import { IRect, isInsideHelpLayer, resolveElement } from "./helpDom";

export interface IHelpTarget {
  item: IHelpElement;
  node: Element;
  rect: IRect;
}

interface IHelpTargets {
  matched: IHelpTarget[];
  // pinned elements not visible right now: in a closed tab or modal, or no
  // longer matching anything
  unmatched: IHelpElement[];
}

const EMPTY: IHelpTargets = { matched: [], unmatched: [] };

// React may swap a node for another in the same place: tell them apart
const nodeIds = new WeakMap<Element, number>();
let nextNodeId = 0;
const nodeId = (node: Element) => {
  if (!nodeIds.has(node)) nodeIds.set(node, (nextNodeId += 1));

  return nodeIds.get(node);
};

const signature = (targets: IHelpTargets) =>
  targets.matched
    .map(
      ({ item, node, rect }) =>
        `${item.page}|${item.selector}|${nodeId(node)}|${Math.round(rect.top)},${Math.round(
          rect.left,
        )},${Math.round(rect.width)},${Math.round(rect.height)}`,
    )
    .join(";") +
  "#" +
  targets.unmatched.map((item) => `${item.page}|${item.selector}`).join(";");

/**
 * Calls `onChange` (once per frame at most) whenever the page may have moved
 * under the help mode: scroll, resize, DOM changes, transitions.
 */
export const useViewportChanges = (onChange: () => void, enabled: boolean) => {
  const callback = useRef(onChange);
  useLayoutEffect(() => {
    callback.current = onChange;
  });

  useEffect(() => {
    if (!enabled) return undefined;

    let frame = 0;
    const schedule = () => {
      if (frame) return;

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        callback.current();
      });
    };

    const observer = new MutationObserver((records) => {
      // the help mode re-rendering itself must not start another round
      if (records.some((record) => !isInsideHelpLayer(record.target))) {
        schedule();
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style", "hidden", "open", "aria-hidden"],
    });

    window.addEventListener("scroll", schedule, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", schedule);
    document.addEventListener("transitionend", schedule, true);
    document.addEventListener("animationend", schedule, true);
    schedule();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule, { capture: true });
      window.removeEventListener("resize", schedule);
      document.removeEventListener("transitionend", schedule, true);
      document.removeEventListener("animationend", schedule, true);
    };
  }, [enabled]);
};

/**
 * Where each pinned element is on screen: the first visible match of its
 * selector, kept in place while the page scrolls and changes.
 */
export const useHelpTargets = (
  elements: IHelpElement[],
  enabled: boolean,
): IHelpTargets => {
  const [targets, setTargets] = useState<IHelpTargets>(EMPTY);
  const last = useRef("");

  const update = () => {
    const next: IHelpTargets = enabled
      ? elements.reduce<IHelpTargets>(
          (acc, item) => {
            const resolved = resolveElement(item.selector);

            if (resolved) {
              acc.matched.push({
                item,
                node: resolved.element,
                rect: resolved.rect,
              });
            } else {
              acc.unmatched.push(item);
            }

            return acc;
          },
          { matched: [], unmatched: [] },
        )
      : EMPTY;

    const nextSignature = signature(next);
    if (nextSignature === last.current) return;

    last.current = nextSignature;
    setTargets(next);
  };

  useViewportChanges(update, enabled);

  // new elements (another screen, a save) or the help mode switched off
  useEffect(() => {
    const frame = window.requestAnimationFrame(update);

    return () => window.cancelAnimationFrame(frame);
  }, [elements, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return targets;
};
