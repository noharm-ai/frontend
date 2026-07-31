import styled from "styled-components";

const DEPTH_COLORS = ["#1677ff", "#722ed1", "#13c2c2", "#fa8c16"];

export const GroupCard = styled.div<{ $depth: number }>`
  padding: 8px 10px;
  background: ${({ $depth }) => ($depth % 2 === 0 ? "#fff" : "#fafafa")};
  border: 1px solid #f0f0f0;
  border-left: 3px solid
    ${({ $depth }) => DEPTH_COLORS[$depth % DEPTH_COLORS.length]};
  border-radius: 8px;

  .group-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .group-header-spacer {
      flex: 1;
    }
  }

  .group-children {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .group-footer {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }

  .group-empty {
    font-size: 12px;
    color: #999;
  }
`;

export const ConnectorChip = styled.div`
  align-self: flex-start;
  padding: 0 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: #999;
  background: #f5f5f5;
  border-radius: 4px;
`;

export const ConditionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  .condition-spacer {
    flex: 1;
  }
`;

export const ConditionError = styled.div`
  margin: 2px 0 4px;
  font-size: 12px;
  color: #ff4d4f;
`;

export const TriggerPreview = styled.div`
  margin-top: 12px;

  code {
    display: block;
    padding: 8px 10px;
    font-family: monospace;
    font-size: 12px;
    color: #666;
    word-break: break-word;
    white-space: pre-wrap;
    background: #f6f7f9;
    border: 1px solid #f0f0f0;
    border-radius: 6px;
  }

  .preview-counter {
    margin-top: 2px;
    font-size: 11px;
    color: #999;
    text-align: right;

    &.is-over {
      color: #ff4d4f;
      font-weight: 600;
    }
  }
`;
