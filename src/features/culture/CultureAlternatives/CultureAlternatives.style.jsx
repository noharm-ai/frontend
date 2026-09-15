import styled from "styled-components";

import { AWARE_COLORS, AWARE_UNKNOWN } from "features/culture/awareLevel";

export const Container = styled.div`
  .culture-alternatives-substance {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
    font-weight: 500;
  }

  .culture-alternatives-disclaimer {
    margin-top: 12px;
    font-size: 12px;
    line-height: 1.4;
    color: #6d7a94;
  }

  .culture-alternatives-none,
  .culture-alternatives-no-cultures {
    color: #6d7a94;
  }
`;

// one block per specimen: the antibiogram of a collection tests many drugs
// against the same microorganism, and the options only hold inside it
export const Specimen = styled.div`
  padding: 10px 12px;
  border-radius: 5px;
  border-left: 3px solid
    ${(props) => (props.$resistant ? "#f44336" : "#7ebe9a")};
  background: #f7f7fb;

  & + & {
    margin-top: 10px;
  }

  .culture-alternatives-specimen-header {
    display: grid;
    grid-template-columns: 1fr;
    row-gap: 2px;
    font-size: 13px;
  }

  .culture-alternatives-result {
    font-weight: 500;
    color: ${(props) => (props.$resistant ? "#f44336" : "#3f8f66")};
  }

  .culture-alternatives-mode {
    margin-top: 8px;
    font-size: 12px;
    line-height: 1.4;
    color: #6d7a94;
  }

  .culture-alternatives-none {
    margin-top: 8px;
    font-size: 13px;
  }
`;

export const LevelGroup = styled.div`
  margin-top: 10px;

  .culture-alternatives-level {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #6d7a94;

    .culture-alternatives-level-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: ${(props) => AWARE_COLORS[props.$level] || AWARE_COLORS[AWARE_UNKNOWN]};
    }
  }

  .culture-alternatives-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 6px;
    margin-top: 6px;
  }

  .culture-alternative-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 5px 10px;
    border-radius: 4px;
    background: #fff;
    border: 1px solid #e8e8ef;
    font-size: 13px;

    .name {
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* a susceptible result that says more than "sensível" keeps its wording:
       dose-dependent, intermediate */
    .detail {
      font-size: 12px;
      color: #6d7a94;
      white-space: nowrap;
    }
  }
`;
