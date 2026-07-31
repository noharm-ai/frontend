import styled from "styled-components";

const DEPTH_COLORS = ["#1677ff", "#722ed1", "#13c2c2", "#fa8c16"];

export const GroupCard = styled.div<{ $depth: number }>`
  ${({ $depth }) =>
    $depth > 0
      ? `
    padding: 4px 8px 8px;
    background: rgba(0, 0, 0, 0.02);
    border-left: 2px solid ${DEPTH_COLORS[($depth - 1) % DEPTH_COLORS.length]};
    border-radius: 0 6px 6px 0;
  `
      : ""}

  .group-header {
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: 28px;

    .group-header-spacer {
      flex: 1;
    }

    &:hover > .row-delete {
      opacity: 1;
    }
  }

  .group-children {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 2px;
  }

  .group-footer {
    display: flex;
    gap: 4px;
    margin-top: 6px;
    margin-left: 38px;

    button {
      color: #8c8c8c;
    }
  }

  .group-empty {
    margin-left: 42px;
    font-size: 12px;
    color: #bfbfbf;
  }

  .row-delete {
    color: #bfbfbf;
    opacity: 0;
    transition: opacity 0.15s, color 0.15s;

    &:hover,
    &:focus-visible {
      color: #ff4d4f;
      opacity: 1;
    }
  }

  .group-summary {
    flex: 1;
    min-width: 0;
    cursor: pointer;

    code {
      display: block;
      overflow: hidden;
      font-family: monospace;
      font-size: 12px;
      color: #999;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    &:hover code {
      color: #666;
    }
  }
`;

export const BuilderRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;

  .row-gutter {
    display: flex;
    flex-shrink: 0;
    justify-content: flex-end;
    width: 34px;
    padding-top: 2px;
  }

  .row-content {
    flex: 1;
    min-width: 0;
  }
`;

export const ConnectorToggle = styled.button<{ $connector: "and" | "or" }>`
  height: 20px;
  padding: 0 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  cursor: pointer;
  border: none;
  border-radius: 10px;
  transition: background 0.15s;

  ${({ $connector }) =>
    $connector === "and"
      ? `
    color: #2f54eb;
    background: #f0f5ff;

    &:hover {
      background: #d6e4ff;
    }
  `
      : `
    color: #d46b08;
    background: #fff7e6;

    &:hover {
      background: #ffe7ba;
    }
  `}
`;

export const NotChip = styled.button<{ $active: boolean }>`
  height: 22px;
  padding: 0 7px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s;

  ${({ $active }) =>
    $active
      ? `
    color: #cf1322;
    background: #fff1f0;
    border: 1px solid #ffa39e;
  `
      : `
    color: #bfbfbf;
    background: transparent;
    border: 1px dashed #d9d9d9;

    &:hover {
      color: #8c8c8c;
      border-color: #bfbfbf;
    }
  `}
`;

export const ConditionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  .condition-spacer {
    flex: 1;
  }

  &:hover .row-delete {
    opacity: 1;
  }
`;

export const ConditionError = styled.div`
  margin: 2px 0 4px;
  font-size: 12px;
  color: #ff4d4f;
`;

export const SentenceBox = styled.div`
  margin-top: 12px;
  padding: 8px 12px;
  font-size: 13px;
  line-height: 2;
  color: #595959;
  background: #f6f7f9;
  border: 1px solid #f0f0f0;
  border-radius: 6px;

  .sentence-var {
    padding: 1px 6px;
    color: #434343;
    white-space: nowrap;
    background: #fff;
    border: 1px solid #e4e4e4;
    border-radius: 4px;

    &.is-dangling {
      color: #cf1322;
      background: #fff1f0;
      border-color: #ffa39e;
    }
  }

  .sentence-and {
    color: #2f54eb;
    font-weight: 600;
  }

  .sentence-or {
    color: #d46b08;
    font-weight: 600;
  }

  .sentence-not {
    color: #cf1322;
    font-weight: 600;
  }

  .sentence-paren {
    color: #bfbfbf;
  }

  .sentence-block {
    margin-left: 20px;
  }
`;

