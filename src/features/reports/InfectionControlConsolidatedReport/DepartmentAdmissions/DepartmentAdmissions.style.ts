import styled from "styled-components";

/** The modal's body: the description stays put and the list scrolls below it. */
export const AdmissionsBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;

  p {
    margin: 0;
  }

  .admissions-list {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }
`;
