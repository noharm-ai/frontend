import styled from "styled-components";

export const RecordsRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  tr.inactive > td {
    opacity: 0.55;
  }
`;

export const Summary = styled.div`
  color: #595959;
`;

export const Muted = styled.span`
  color: #8c94a6;
  font-style: italic;
`;
