import styled from "styled-components/macro";

export const PrioritizationPage = styled.div`
  position: relative;
  min-height: 60vh;
  padding-bottom: 5rem;

  .grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-column-gap: 2rem;
    grid-row-gap: 4rem;
  }
`;

export const FilterCard = styled.div`
  background: #fff;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  margin-top: 2rem;
  box-shadow: 0 -1px 7px rgb(0 0 0 / 16%);
`;

export const ResultActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;

  .filters {
    display: flex;

    .filters-item {
      min-width: 10rem;
      margin-right: 1rem;

      .filters-item-label {
        font-weight: 500;
      }

      .filters-item-value {
        .ant-select {
          width: 100%;

          .ant-tag {
            margin-left: 0.5rem;
          }
        }
      }
    }
  }
`;
