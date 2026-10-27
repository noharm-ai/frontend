import React from "react";

export const MIN_COLUMN_WIDTH = 60;

export interface ResizableTitleProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  width?: number;
  columnTitle?: string;
  onResize?: (width: number) => void;
  onResetWidth?: () => void;
}

/**
 * Table header cell with a drag handle on its right edge. Columns that pass
 * no width/onResize (through onHeaderCell) render as a plain header cell.
 * Double-clicking the handle restores the column's default width.
 */
export const ResizableTitle: React.FC<ResizableTitleProps> = ({
  width,
  columnTitle,
  onResize,
  onResetWidth,
  children,
  ...rest
}) => {
  if (!width || !onResize) {
    return <th {...rest}>{children}</th>;
  }

  const startResize = (e: React.PointerEvent<HTMLSpanElement>) => {
    // keep the header from sorting and the browser from selecting text
    e.preventDefault();
    e.stopPropagation();

    const handle = e.currentTarget;
    const startX = e.clientX;
    const startWidth = width;

    const move = (ev: PointerEvent) =>
      onResize(Math.max(MIN_COLUMN_WIDTH, startWidth + ev.clientX - startX));
    const stop = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", stop);
      handle.removeEventListener("pointercancel", stop);
    };

    handle.setPointerCapture(e.pointerId);
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", stop);
    handle.addEventListener("pointercancel", stop);
  };

  return (
    <th {...rest} style={{ ...rest.style, position: "relative" }}>
      {children}
      <span
        className="ant-table-resize-handle"
        role="separator"
        aria-orientation="vertical"
        aria-label={`Redimensionar coluna ${columnTitle ?? ""}`.trim()}
        onPointerDown={startResize}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onResetWidth?.();
        }}
      />
    </th>
  );
};
