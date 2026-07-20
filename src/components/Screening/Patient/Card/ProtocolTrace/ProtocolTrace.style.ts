import styled, { css, keyframes } from "styled-components";

export const TraceRoot = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const TraceHeader = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem 0.75rem;
  padding: 0 1rem 0.75rem;
  flex-shrink: 0;
  border-bottom: 1px solid var(--nh-border-color, #e8e8e8);
  font-size: 13px;
  color: var(--nh-text-color, #595959);

  .divider {
    color: var(--nh-border-color, #d9d9d9);
  }
`;

export const TraceBody = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
`;

export const ProtocolListPanel = styled.div`
  display: flex;
  flex-direction: column;
  width: 280px;
  flex-shrink: 0;
  min-height: 0;
  border-right: 1px solid #e2e6ee;
  background: #fafbfd;
`;

export const FilterBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  flex-shrink: 0;
  border-bottom: 1px solid #e2e6ee;

  .ant-segmented {
    width: 100%;
  }
`;

export const ProtocolListScroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`;

export const ProtocolListItem = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid #eef1f6;
  background: ${(p) =>
    p.$selected ? "rgba(112, 189, 196, 0.18)" : "transparent"};
  border-left: 3px solid ${(p) => (p.$selected ? "#70bdc4" : "transparent")};

  &:hover {
    background: ${(p) =>
      p.$selected ? "rgba(112, 189, 196, 0.18)" : "#f0f3f9"};
  }
`;

export const ListStatusDot = styled.span<{ $active: boolean }>`
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(p) => (p.$active ? "#3fa34d" : "#bfbfbf")};
`;

export const ListItemText = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ListItemName = styled.div`
  font-size: 12.5px;
  color: #262626;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ListItemMeta = styled.div`
  font-size: 11px;
  color: #ad6800;
`;

export const EmptyListState = styled.div`
  padding: 1.5rem 1rem;
  text-align: center;
  font-size: 12.5px;
  color: #8c94a6;
`;

export const ProtocolDetailPanel = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`;

export const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.85rem;
  background: #2e3c5a;
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 1;

  .protocol-name {
    font-weight: 500;
    font-size: 13.5px;
  }

  .spacer {
    flex: 1;
  }

  .date-count {
    font-size: 12px;
    color: #c7d0e0;
  }
`;

export const DetailBody = styled.div`
  padding: 0.85rem;
`;

export const StatusPill = styled.span<{ $variant: "activated" | "inactive" }>`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  background: ${(p) => (p.$variant === "activated" ? "#e8f5e9" : "#f0f0f0")};
  color: ${(p) => (p.$variant === "activated" ? "#2e7d32" : "#595959")};
`;

export const StatusChip = styled.span<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  background: ${(p) => (p.$active ? "#3fa34d" : "#5b6579")};
  color: #fff;
`;

export const ApplicabilityNote = styled.div`
  font-size: 12.5px;
  color: #ad6800;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 4px;
  padding: 0.4rem 0.6rem;
  margin-bottom: 0.5rem;
`;

export const DateGroupBlock = styled.div`
  & + & {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px dashed #e2e6ee;
  }
`;

export const DateGroupHeading = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.6rem;
  font-size: 13px;

  strong {
    font-weight: 600;
  }
`;

export const ErrorBox = styled.div`
  font-size: 12.5px;
  color: #a8071a;
  background: #fff1f0;
  border: 1px solid #ffa39e;
  border-radius: 4px;
  padding: 0.5rem 0.6rem;
  white-space: break-spaces;
`;

export const Eyebrow = styled.div`
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: #8c94a6;
  margin-bottom: 0.35rem;
`;

export const ExpressionBox = styled.div`
  background: #f4f6fa;
  border: 1px solid #e2e6ee;
  border-radius: 6px;
  padding: 0.6rem 0.75rem;
  margin-bottom: 0.75rem;
`;

export const ExpressionCode = styled.div`
  font-family: "SF Mono", Consolas, Menlo, monospace;
  font-size: 12.5px;
  line-height: 1.5;
  word-break: break-word;
`;

export const ExpressionLineRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4em;
`;

export const ExpressionToken = styled.span<{
  $variant: "true" | "false" | "muted";
  $interactive?: boolean;
}>`
  color: ${(p) =>
    p.$variant === "true"
      ? "#2e7d32"
      : p.$variant === "false"
        ? "#c62828"
        : "#5b6579"};
  font-weight: ${(p) => (p.$variant === "muted" ? 400 : 600)};

  ${(p) =>
    p.$interactive &&
    `
    display: inline-block;
    cursor: pointer;
    border-radius: 3px;
    padding: 0 2px;
    margin: 0 -2px;
    transition: background-color 0.15s ease, transform 0.15s ease;

    &:hover {
      background-color: ${
        p.$variant === "true"
          ? "#e8f5e9"
          : p.$variant === "false"
            ? "#ffebee"
            : "#f0f0f0"
      };
      transform: translateY(-1px);
    }
  `}
`;

export const SubstitutedLine = styled.div`
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px dotted #dde2ec;
  font-family: "SF Mono", Consolas, Menlo, monospace;
  font-size: 12px;
  color: #5b6579;
  word-break: break-word;

  .result-chip {
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    font-weight: 600;
  }
`;

const highlightPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(22, 119, 255, 0.5); background: #eef4ff; }
  70% { box-shadow: 0 0 0 6px rgba(22, 119, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(22, 119, 255, 0); background: #fff; }
`;

export const VariableNode = styled.div<{
  $stripe: "true" | "false" | "muted";
  $highlighted?: boolean;
}>`
  border: 1px solid #e2e6ee;
  border-left: 4px solid
    ${(p) =>
      p.$stripe === "true"
        ? "#2e7d32"
        : p.$stripe === "false"
          ? "#c62828"
          : "#bfbfbf"};
  border-radius: 4px;
  padding: 0.55rem 0.7rem;
  margin-bottom: 0.6rem;
  background: #fff;
  scroll-margin: 12px;

  ${(p) =>
    p.$highlighted &&
    css`
      animation: ${highlightPulse} 1.5s ease-out;
    `}
`;

export const VariableRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.3rem;

  .field-label {
    font-size: 12.5px;
    color: #5b6579;
  }

  .spacer {
    flex: 1;
  }
`;

export const MonoChip = styled.span`
  font-family: "SF Mono", Consolas, Menlo, monospace;
  font-size: 11.5px;
  background: #eef1f6;
  color: #33415c;
  padding: 1px 6px;
  border-radius: 4px;
`;

export const ResultChip = styled.span<{ $result: "true" | "false" | "muted" }>`
  font-size: 11px;
  font-weight: 600;
  padding: 1px 8px;
  border-radius: 999px;
  background: ${(p) =>
    p.$result === "true"
      ? "#e8f5e9"
      : p.$result === "false"
        ? "#ffebee"
        : "#f0f0f0"};
  color: ${(p) =>
    p.$result === "true"
      ? "#2e7d32"
      : p.$result === "false"
        ? "#c62828"
        : "#595959"};
`;

export const Headline = styled.div`
  font-size: 13px;
  color: var(--nh-text-color, #262626);
  margin-bottom: 0.4rem;
`;

export const DetailChipsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.3rem;
`;

export const LabeledChip = styled.span`
  font-size: 11.5px;
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 1px 7px;

  .k {
    color: #8c94a6;
    margin-right: 0.3rem;
  }

  .v {
    font-family: "SF Mono", Consolas, Menlo, monospace;
    color: #33415c;
  }
`;

export const ToggleLink = styled.span`
  display: inline-block;
  font-size: 12px;
  color: #1677ff;
  cursor: pointer;
  margin-top: 0.15rem;

  &:hover {
    text-decoration: underline;
  }
`;

export const CodeChipsWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.4rem;
`;

export const TableScrollWrap = styled.div`
  max-height: 270px;
  overflow: auto;
  border: 1px solid #e2e6ee;
  border-radius: 4px;
  margin-top: 0.4rem;
`;

export const CombinationTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;

  thead th {
    position: sticky;
    top: 0;
    background: #f4f6fa;
    text-align: left;
    padding: 0.35rem 0.5rem;
    font-size: 11px;
    color: #5b6579;
    border-bottom: 1px solid #e2e6ee;
  }

  tbody td {
    padding: 0.3rem 0.5rem;
    border-bottom: 1px solid #f0f0f0;
    vertical-align: top;
  }

  tbody tr.matched {
    background: #f2faf3;
  }

  .status-ok {
    color: #2e7d32;
    font-weight: 600;
  }

  .status-fail {
    color: #c62828;
    font-weight: 600;
  }

  .status-na {
    color: #bfbfbf;
  }
`;

export const VariableFooter = styled.div`
  margin-top: 0.4rem;
  padding-top: 0.35rem;
  border-top: 1px dotted #eef1f6;

  .reason {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: #8c94a6;
    text-transform: uppercase;
    margin-right: 0.4rem;
  }

  .raw-message {
    font-family: "SF Mono", Consolas, Menlo, monospace;
    font-size: 11px;
    color: #8c94a6;
    word-break: break-word;
  }
`;

export const RelatedBanner = styled.div`
  margin-top: 0.6rem;
  background: #f2faf3;
  border: 1px solid #b7eb8f;
  border-radius: 4px;
  padding: 0.5rem 0.65rem;
  font-size: 12.5px;
  color: #2e7d32;
`;
