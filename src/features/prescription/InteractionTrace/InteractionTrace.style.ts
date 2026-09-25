import styled from "styled-components";

export const TraceRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-size: 13px;
`;

export const TraceMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 0.75rem;
  color: #595959;

  .divider {
    color: #d9d9d9;
  }
`;

export const PickerRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: end;
  gap: 0.75rem;

  label {
    display: block;
    font-size: 12px;
    color: #8c94a6;
    margin-bottom: 0.25rem;
  }

  .arrow {
    padding-bottom: 6px;
    color: #8c94a6;
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;

    .arrow {
      display: none;
    }
  }
`;

export const Summary = styled.div<{ $alerted: boolean }>`
  padding: 0.6rem 0.8rem;
  border-radius: 6px;
  font-weight: 500;
  background: ${(p) => (p.$alerted ? "#fff1f0" : "#f4f6fa")};
  border: 1px solid ${(p) => (p.$alerted ? "#ffa39e" : "#e2e6ee")};
  color: ${(p) => (p.$alerted ? "#a8071a" : "#33415c")};
`;

export const Note = styled.div`
  font-size: 12.5px;
  color: #ad6800;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 4px;
  padding: 0.4rem 0.6rem;
`;

export const Section = styled.section`
  h4 {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #8c94a6;
    margin: 0 0 0.4rem;
  }
`;

export const SidesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const SideCard = styled.div`
  border: 1px solid #e2e6ee;
  border-radius: 6px;
  padding: 0.6rem 0.75rem;

  .name {
    font-weight: 600;
    margin-bottom: 0.4rem;
  }

  dl {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 0.15rem 0.6rem;
    margin: 0;
  }

  dt {
    color: #8c94a6;
  }

  dd {
    margin: 0;
    word-break: break-word;
  }
`;

export const RuleList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    display: flex;
    gap: 0.5rem;
    padding: 0.2rem 0;
  }

  .icon {
    flex-shrink: 0;
    width: 1rem;
    font-weight: 700;
  }

  .passed {
    color: #2e7d32;
  }

  .failed {
    color: #c62828;
  }
`;

export const KindBlock = styled.div`
  border: 1px solid #e2e6ee;
  border-radius: 6px;
  padding: 0.6rem 0.75rem;

  & + & {
    margin-top: 0.6rem;
  }

  .kind-title {
    font-weight: 600;
    margin-bottom: 0.4rem;
  }
`;

export const DirectionBlock = styled.div`
  & + & {
    margin-top: 0.6rem;
    padding-top: 0.6rem;
    border-top: 1px dashed #e2e6ee;
  }

  .direction-heading {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.3rem;
  }

  .message {
    color: #595959;
    margin-bottom: 0.3rem;
  }

  .alert-text {
    background: #f4f6fa;
    border-radius: 4px;
    padding: 0.4rem 0.6rem;
    margin-top: 0.3rem;
  }
`;

export const Chip = styled.span<{ $variant: "success" | "danger" | "muted" }>`
  align-self: flex-start;
  white-space: nowrap;
  font-size: 11px;
  font-weight: 600;
  padding: 1px 8px;
  border-radius: 999px;
  background: ${(p) =>
    p.$variant === "success"
      ? "#e8f5e9"
      : p.$variant === "danger"
        ? "#ffebee"
        : "#f0f0f0"};
  color: ${(p) =>
    p.$variant === "success"
      ? "#2e7d32"
      : p.$variant === "danger"
        ? "#c62828"
        : "#595959"};
`;

export const RelationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const RelationCard = styled.div<{ $inactive: boolean }>`
  border: 1px solid #e2e6ee;
  border-radius: 6px;
  padding: 0.55rem 0.75rem;
  opacity: ${(p) => (p.$inactive ? 0.7 : 1)};

  .relation-heading {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .relation-substances {
    margin-top: 0.25rem;
    color: #595959;
  }

  .relation-text {
    margin-top: 0.4rem;
    padding: 0.4rem 0.6rem;
    background: #f4f6fa;
    border-radius: 4px;

    p {
      margin: 0 !important;
    }

    p + p {
      margin-top: 0.3rem !important;
    }
  }
`;

// same colors the prescription uses for alert levels
const LEVEL_COLORS: Record<string, { bg: string; fg: string }> = {
  high: { bg: "#ffebee", fg: "#c62828" },
  medium: { bg: "#fff3e0", fg: "#e65100" },
  low: { bg: "#fff8e1", fg: "#8d6e00" },
};

export const LevelChip = styled.span<{ $level: string | null }>`
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  padding: 1px 8px;
  border-radius: 999px;
  background: ${(p) => LEVEL_COLORS[p.$level ?? ""]?.bg ?? "#f0f0f0"};
  color: ${(p) => LEVEL_COLORS[p.$level ?? ""]?.fg ?? "#595959"};
`;

export const Muted = styled.div`
  color: #8c94a6;
`;
