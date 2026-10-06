import styled, { createGlobalStyle, css } from "styled-components";

import { DropSide } from "./chartLayout";

// Half of the 16px Row gutter plus half the bar: centres the bar in the gap.
const BAR_OFFSET = "-10px";

export const ChartFrame = styled.div<{
  $dragging: boolean;
  $dropSide: DropSide | null;
  $vertical: boolean;
  $accent: string;
}>`
  position: relative;
  opacity: ${({ $dragging }) => ($dragging ? 0.4 : 1)};
  transition: opacity 0.15s;

  /* insertion bar in the gap where the dragged chart will land */
  ${({ $dropSide, $vertical, $accent }) =>
    $dropSide &&
    css`
      &::after {
        content: "";
        position: absolute;
        z-index: 1;
        border-radius: 2px;
        background: ${$accent};
        pointer-events: none;
        ${$vertical
          ? css`
              left: 0;
              right: 0;
              height: 4px;
              ${$dropSide === "before" ? "top" : "bottom"}: ${BAR_OFFSET};
            `
          : css`
              top: 0;
              bottom: 0;
              width: 4px;
              ${$dropSide === "before" ? "left" : "right"}: ${BAR_OFFSET};
            `}
      }
    `}
`;

export const DragHandle = styled.span`
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: grab;
  user-select: none;

  .anticon {
    margin-right: 8px;
    opacity: 0.45;
  }

  &:hover .anticon {
    opacity: 1;
  }
`;

export const ResizeHandle = styled.span<{ $color: string; $accent: string }>`
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 2;
  width: 20px;
  height: 20px;
  cursor: nwse-resize;
  touch-action: none;

  /* corner mark, like a window's resize grip */
  &::after {
    content: "";
    position: absolute;
    right: 5px;
    bottom: 5px;
    width: 8px;
    height: 8px;
    border-right: 2px solid ${({ $color }) => $color};
    border-bottom: 2px solid ${({ $color }) => $color};
    border-bottom-right-radius: 3px;
  }

  &:hover::after {
    border-color: ${({ $accent }) => $accent};
  }
`;

/** Outline of the size the chart will take when the resize is released. */
export const ResizePreview = styled.div<{ $accent: string }>`
  position: absolute;
  top: 0;
  z-index: 3;
  border: 2px dashed ${({ $accent }) => $accent};
  border-radius: 8px;
  background: color-mix(in srgb, ${({ $accent }) => $accent} 8%, transparent);
  pointer-events: none;
`;

export const ResizeLabel = styled.span<{ $accent: string }>`
  position: absolute;
  right: 8px;
  bottom: 8px;
  padding: 2px 8px;
  border-radius: 4px;
  background: ${({ $accent }) => $accent};
  color: #fff;
  font-size: 12px;
  white-space: nowrap;
`;

/** Keeps the resize cursor, and no text selection, wherever the pointer goes. */
export const ResizingCursor = createGlobalStyle`
  body, body * {
    cursor: nwse-resize !important;
    user-select: none !important;
  }
`;
