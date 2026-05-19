import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu as AntMenu } from "antd";

export interface SlashMenuItem {
  key: string;
  label?: React.ReactNode;
  children?: SlashMenuItem[];
}

interface UseSlashMenuOptions {
  textareaRef: React.RefObject<any>;
  items: SlashMenuItem[];
  onSelect: (info: { key: string; slashIndex: number }) => void;
}

interface UseSlashMenuReturn {
  onTextChange: (target: EventTarget) => void;
  onKeyDown: React.KeyboardEventHandler;
  portal: React.ReactPortal | null;
}

interface CursorCoords {
  x: number;
  y: number;
}

const getCursorCoords = (textarea: HTMLTextAreaElement, index: number): CursorCoords => {
  try {
    const style = window.getComputedStyle(textarea);
    const textareaRect = textarea.getBoundingClientRect();
    const fontSize = parseFloat(style.fontSize) || 14;
    const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.5;

    // Mirror positioned off-screen; we only need relative offsets within it.
    const mirror = document.createElement("div");
    mirror.style.position = "absolute";
    mirror.style.left = "-9999px";
    mirror.style.top = "-9999px";
    mirror.style.width = `${textareaRect.width}px`;
    mirror.style.whiteSpace = "pre-wrap";
    mirror.style.wordWrap = "break-word";
    mirror.style.overflowWrap = "break-word";
    mirror.style.fontFamily = style.fontFamily;
    mirror.style.fontSize = `${fontSize}px`;
    mirror.style.fontWeight = style.fontWeight;
    mirror.style.lineHeight = `${lineHeight}px`;
    mirror.style.letterSpacing = style.letterSpacing;
    mirror.style.paddingTop = style.paddingTop;
    mirror.style.paddingRight = style.paddingRight;
    mirror.style.paddingBottom = style.paddingBottom;
    mirror.style.paddingLeft = style.paddingLeft;
    mirror.style.borderTopWidth = style.borderTopWidth;
    mirror.style.borderRightWidth = style.borderRightWidth;
    mirror.style.borderBottomWidth = style.borderBottomWidth;
    mirror.style.borderLeftWidth = style.borderLeftWidth;
    mirror.style.borderStyle = "solid";
    mirror.style.borderColor = "transparent";
    mirror.style.boxSizing = style.boxSizing;

    const textBefore = document.createElement("span");
    textBefore.textContent = textarea.value.substring(0, index);
    const cursor = document.createElement("span");
    cursor.textContent = "|";
    mirror.appendChild(textBefore);
    mirror.appendChild(cursor);

    document.body.appendChild(mirror);
    const mirrorRect = mirror.getBoundingClientRect();
    const cursorRect = cursor.getBoundingClientRect();
    document.body.removeChild(mirror);

    const x =
      textareaRect.left +
      (cursorRect.left - mirrorRect.left) -
      (textarea.scrollLeft || 0);
    const y =
      textareaRect.top +
      (cursorRect.top - mirrorRect.top) -
      (textarea.scrollTop || 0) +
      lineHeight;

    if (!isFinite(x) || !isFinite(y)) {
      return { x: textareaRect.left, y: textareaRect.bottom };
    }

    return { x, y };
  } catch {
    const rect = (textarea as HTMLElement).getBoundingClientRect();
    return { x: rect.left, y: rect.bottom };
  }
};

const getVisibleItems = (
  items: SlashMenuItem[],
  openKeys: string[]
): SlashMenuItem[] =>
  items.flatMap((item) =>
    item.children && openKeys.includes(item.key)
      ? [item, ...getVisibleItems(item.children, openKeys)]
      : [item]
  );

const getParentKey = (
  items: SlashMenuItem[],
  targetKey: string,
  parentKey: string | null = null
): string | null | undefined => {
  for (const item of items) {
    if (item.key === targetKey) return parentKey;
    if (item.children) {
      const found = getParentKey(item.children, targetKey, item.key);
      if (found !== undefined) return found;
    }
  }
  return undefined;
};

export const useSlashMenu = ({
  textareaRef,
  items,
  onSelect,
}: UseSlashMenuOptions): UseSlashMenuReturn => {
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashIndex, setSlashIndex] = useState<number | null>(null);
  const [cursorCoords, setCursorCoords] = useState<CursorCoords | null>(null);
  const [activeMenuKey, setActiveMenuKey] = useState<string | null>(null);
  const [openMenuKeys, setOpenMenuKeys] = useState<string[]>([]);

  useEffect(() => {
    if (!slashMenuOpen) {
      setActiveMenuKey(null);
      setOpenMenuKeys([]);
      return;
    }
    setActiveMenuKey(items[0]?.key ?? null);
    setOpenMenuKeys([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slashMenuOpen]);

  const closeSlashMenu = () => {
    setSlashMenuOpen(false);
    setSlashIndex(null);
    setCursorCoords(null);
  };

  const handleMenuSelect = ({ key }: { key: string }) => {
    onSelect({ key, slashIndex: slashIndex! });
    closeSlashMenu();
    textareaRef.current?.resizableTextArea?.textArea?.focus();
  };

  const onTextChange = (target: EventTarget): void => {
    const t = target as HTMLTextAreaElement;
    const { value, selectionStart } = t;
    if (selectionStart != null && value[selectionStart - 1] === "/") {
      const index = selectionStart - 1;
      setSlashIndex(index);
      const nativeTextarea: HTMLTextAreaElement =
        textareaRef.current?.resizableTextArea?.textArea ?? t;
      setCursorCoords(getCursorCoords(nativeTextarea, index));
      setSlashMenuOpen(true);
    } else {
      closeSlashMenu();
    }
  };

  const onKeyDown: React.KeyboardEventHandler = (e) => {
    if (!slashMenuOpen) return;
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      closeSlashMenu();
      return;
    }
    const visible = getVisibleItems(items, openMenuKeys);
    const idx = visible.findIndex((i) => i.key === activeMenuKey);
    const current = visible[idx];

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveMenuKey(
        visible[Math.min(idx + 1, visible.length - 1)]?.key ?? activeMenuKey
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveMenuKey(
        visible[Math.max(idx - 1, 0)]?.key ?? activeMenuKey
      );
    } else if (e.key === "ArrowRight" && current?.children) {
      e.preventDefault();
      setOpenMenuKeys((prev) =>
        prev.includes(current.key) ? prev : [...prev, current.key]
      );
      setActiveMenuKey(current.children[0]?.key ?? activeMenuKey);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const parentKey = getParentKey(items, activeMenuKey!);
      if (parentKey) {
        setOpenMenuKeys((prev) => prev.filter((k) => k !== parentKey));
        setActiveMenuKey(parentKey);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (current?.children) {
        setOpenMenuKeys((prev) =>
          prev.includes(current.key)
            ? prev.filter((k) => k !== current.key)
            : [...prev, current.key]
        );
        if (!openMenuKeys.includes(current.key)) {
          setActiveMenuKey(current.children[0]?.key ?? activeMenuKey);
        }
      } else if (activeMenuKey) {
        handleMenuSelect({ key: activeMenuKey });
      }
    }
  };

  const portal =
    slashMenuOpen && cursorCoords
      ? createPortal(
          <>
            <div
              style={{ position: "fixed", inset: 0, zIndex: 1049 }}
              onClick={closeSlashMenu}
            />
            <div
              style={{
                position: "fixed",
                left: cursorCoords.x,
                top: cursorCoords.y,
                zIndex: 1050,
              }}
            >
              <AntMenu
                mode="vertical"
                openKeys={openMenuKeys}
                onOpenChange={setOpenMenuKeys}
                items={items}
                onClick={handleMenuSelect}
                selectedKeys={activeMenuKey ? [activeMenuKey] : []}
                style={{
                  minWidth: 160,
                  borderRadius: 8,
                  boxShadow:
                    "0 6px 16px 0 rgba(0,0,0,0.08),0 3px 6px -4px rgba(0,0,0,0.12),0 9px 28px 8px rgba(0,0,0,0.05)",
                }}
              />
            </div>
          </>,
          document.body
        )
      : null;

  return { onTextChange, onKeyDown, portal };
};
