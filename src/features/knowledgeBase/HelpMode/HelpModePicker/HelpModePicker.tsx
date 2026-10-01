import { useEffect, useRef, useState } from "react";

import { elementAtPoint, IPickedElement, pickElement } from "../helpDom";
import { PickerBox, PickerSurface } from "../HelpModeLayer/HelpModeLayer.style";

interface IHelpModePickerProps {
  onPick: (picked: IPickedElement) => void;
}

interface IHover {
  picked: IPickedElement;
  rect: DOMRect;
}

/**
 * Covers the page while a curator picks an element: the page gets no click,
 * and the element that would be pinned is outlined under the cursor. It snaps
 * to the closest element with a stable attribute; Alt picks the exact one.
 */
export function HelpModePicker({ onPick }: IHelpModePickerProps) {
  const [hover, setHover] = useState<IHover | null>(null);
  const pointer = useRef<{ x: number; y: number; alt: boolean } | null>(null);
  const frame = useRef(0);

  const inspect = () => {
    frame.current = 0;
    if (!pointer.current) return;

    const { x, y, alt } = pointer.current;
    const target = elementAtPoint(x, y);

    if (!target || target === document.documentElement) {
      setHover(null);
      return;
    }

    const picked = pickElement(target, alt);
    setHover({ picked, rect: picked.element.getBoundingClientRect() });
  };

  const schedule = () => {
    if (!frame.current) {
      frame.current = window.requestAnimationFrame(inspect);
    }
  };

  useEffect(() => {
    // Alt changes the pick without moving the mouse
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Alt" || !pointer.current) return;

      event.preventDefault();
      pointer.current = { ...pointer.current, alt: event.type === "keydown" };
      schedule();
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    // the wheel still scrolls the page under the surface
    window.addEventListener("scroll", schedule, {
      capture: true,
      passive: true,
    });

    return () => {
      window.cancelAnimationFrame(frame.current);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
      window.removeEventListener("scroll", schedule, { capture: true });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <PickerSurface
        data-testid="help-mode-picker"
        onMouseMove={(event) => {
          pointer.current = {
            x: event.clientX,
            y: event.clientY,
            alt: event.altKey,
          };
          schedule();
        }}
        onMouseLeave={() => {
          pointer.current = null;
          setHover(null);
        }}
        onClick={(event) => {
          const target = elementAtPoint(event.clientX, event.clientY);

          if (target) onPick(pickElement(target, event.altKey));
        }}
      />
      {hover && (
        <PickerBox
          $fragile={hover.picked.fragile}
          className={hover.rect.top < 24 ? "caption-below" : undefined}
          style={{
            top: hover.rect.top,
            left: hover.rect.left,
            width: hover.rect.width,
            height: hover.rect.height,
          }}
        >
          <span className="picker-caption">{hover.picked.selector}</span>
        </PickerBox>
      )}
    </>
  );
}
