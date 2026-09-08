import styled from "styled-components";

export const List = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 10px;
  row-gap: 8px;
  width: 100%;
  max-height: 210px;
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

const borderColor = (props) => {
  if (props.$prediction) return "#a991d6";

  return props.$alert ? "#F68C97" : "#e0e0e0";
};

const backgroundColor = (props) => {
  if (props.$prediction) return "#f2edfa";

  return props.$alert ? "#F8DEE2" : "#fff";
};

export const Item = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
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

  .result {
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
