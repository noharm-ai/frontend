import styled from "styled-components";

// Rail colors for nested condition groups, one per depth level.
const DEPTH_COLORS = ["#1677ff", "#722ed1", "#13c2c2", "#fa8c16"];

export const SentenceBox = styled.div`
  margin-top: 12px;
  padding: 10px 12px 12px;
  font-size: 13px;
  line-height: 1.6;
  color: #595959;
  background: #f6f7f9;
  border: 1px solid #f0f0f0;
  border-radius: 6px;

  .sentence-title {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 12px;
    font-weight: 600;
    color: #8c8c8c;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .sentence-loading {
    font-size: 11px;
    font-weight: 400;
    color: #bfbfbf;
    text-transform: none;
    letter-spacing: 0;
  }

  .group-headline {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
    font-weight: 600;
    color: #434343;
  }

  .group-not {
    padding: 0 5px;
    font-size: 10px;
    font-weight: 700;
    color: #cf1322;
    background: #fff1f0;
    border: 1px solid #ffa39e;
    border-radius: 3px;
  }

  .group-items {
    display: flex;
    flex-direction: column;
  }

  /* Nested groups get an indented, colored rail so the shape of the logic
     stays readable without parentheses. */
  .sentence-group .sentence-group {
    padding-left: 10px;
    margin: 2px 0;
    border-left: 2px solid #d9d9d9;

    &[data-depth="1"] {
      border-left-color: ${DEPTH_COLORS[0]};
    }

    &[data-depth="2"] {
      border-left-color: ${DEPTH_COLORS[1]};
    }

    &[data-depth="3"] {
      border-left-color: ${DEPTH_COLORS[2]};
    }

    &[data-depth="4"] {
      border-left-color: ${DEPTH_COLORS[3]};
    }

    &.is-negated {
      border-left-color: #ffa39e;
    }
  }

  .sentence-connector {
    padding: 4px 0;

    span {
      padding: 1px 8px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      border-radius: 10px;
    }

    .connector-and {
      color: #2f54eb;
      background: #f0f5ff;
    }

    .connector-or {
      color: #d46b08;
      background: #fff7e6;
    }
  }
`;

export const ConditionCard = styled.div`
  padding: 7px 10px;
  background: #fff;
  border: 1px solid #ebedf0;
  border-radius: 6px;

  &.is-dangling {
    background: #fff1f0;
    border-color: #ffa39e;

    .condition-subject {
      color: #cf1322;
    }
  }

  &.is-incomplete {
    border-style: dashed;
    border-color: #ffd591;
  }

  .condition-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
  }

  .condition-not {
    padding: 0 5px;
    font-size: 10px;
    font-weight: 700;
    color: #cf1322;
    background: #fff1f0;
    border: 1px solid #ffa39e;
    border-radius: 3px;
  }

  .condition-subject {
    font-weight: 600;
    color: #262626;
  }

  .condition-varname {
    font-family: monospace;
    font-size: 11px;
    color: #bfbfbf;
  }

  .condition-criterion {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 4px;
    margin-top: 3px;
  }

  .criterion-label {
    font-size: 11px;
    font-weight: 600;
    color: #8c8c8c;
    text-transform: uppercase;
  }

  .criterion-phrase {
    color: #595959;
  }

  .criterion-text {
    font-weight: 600;
    color: #262626;
  }

  .criterion-items {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .item-chip {
    padding: 0 6px;
    font-size: 12px;
    color: #135200;
    background: #f6ffed;
    border: 1px solid #d9f7be;
    border-radius: 4px;

    &.is-unresolved {
      font-family: monospace;
      color: #8c8c8c;
      background: #fafafa;
      border-color: #f0f0f0;
    }
  }

  .items-toggle {
    padding: 0 6px;
    font-size: 11px;
    color: #1677ff;
    cursor: pointer;
    background: transparent;
    border: 1px dashed #91caff;
    border-radius: 4px;

    &:hover {
      background: #f0f8ff;
    }
  }

  .condition-note {
    margin-top: 3px;
    font-size: 12px;
    color: #8c8c8c;
  }
`;
