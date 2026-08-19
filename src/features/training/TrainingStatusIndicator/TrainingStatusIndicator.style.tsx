import styled from "styled-components";

export const PendingTrainingPill = styled.button`
  align-items: center;
  background: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 16px;
  color: #ad6800;
  cursor: pointer;
  display: flex;
  font-size: 13px;
  font-weight: 500;
  gap: 6px;
  line-height: 1;
  margin-right: 8px;
  padding: 7px 14px;
  transition: background 0.2s;
  white-space: nowrap;

  &:hover {
    background: #ffe7ba;
  }

  .pill-label {
    display: none;

    @media (min-width: 992px) {
      display: inline;
    }
  }

  .pill-count {
    background: #ad6800;
    border-radius: 10px;
    color: #fff;
    font-size: 11px;
    padding: 2px 7px;
  }
`;
