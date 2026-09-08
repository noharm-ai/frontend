import styled from "styled-components";

import { get } from "styles/utils";

export const Container = styled.div`
  width: 100%;
  max-height: 205px;
  overflow-y: auto;
  padding-right: 5px;

  &::-webkit-scrollbar-track {
    background-color: #f5f5f5;
    border-radius: 10px;
  }

  &::-webkit-scrollbar {
    width: 8px;
    background-color: #f5f5f5;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #2e3c5a;
    border-radius: 10px;
  }
`;

export const Group = styled.div`
  & + & {
    margin-top: 10px;
  }

  .group-title {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 5px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #6d7a94;

    .anticon {
      color: #a991d6;
    }

    .count {
      font-weight: 400;
    }
  }
`;

// mirrors the exams grid (components/PrescriptionCard.jsx .exam-list)
export const List = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 10px;
  row-gap: 8px;

  @media (min-width: ${get("breakpoints.md")}) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  @media only screen and (min-width: 1515px) {
    column-gap: 15px;
  }
`;

const borderColor = (props) => {
  if (props.$prediction) return "#a991d6";

  return props.$resistant ? "#F68C97" : "#e0e0e0";
};

const backgroundColor = (props) => {
  if (props.$prediction) return "#F4EFFB";

  return props.$resistant ? "#F8DEE2" : "#fff";
};

export const Item = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 5px;
  border: 1px solid ${borderColor};
  border-radius: 5px;
  background: ${backgroundColor};

  .name {
    flex: 1;
    font-size: 14px;
    font-weight: 400;
    color: var(--nh-text-color);
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .marker {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    color: var(--nh-text-color);

    .anticon {
      color: #a991d6;
    }
  }

  &:hover {
    box-shadow: 0px 1px 4px 0px rgb(0 0 0 / 16%);
  }
`;
