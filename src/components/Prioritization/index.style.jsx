import styled, { css } from "styled-components/macro";
import breakpoints from "styles/breakpoints";
import { timingFunctions } from "polished";

import { get } from "styles/utils";

export const PrioritizationPage = styled.div`
  position: relative;
  min-height: 60vh;
  padding-bottom: 5rem;
  padding-top: 1rem;

  .alert-container {
    padding: 0 1rem 1rem 1rem;
    margin-bottom: 1rem;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    grid-column-gap: 2rem;
    grid-row-gap: 4rem;

    ${({ collapsed }) =>
      collapsed
        ? css`
            @media (min-width: ${breakpoints.lg}) {
              grid-template-columns: repeat(2, minmax(0, 1fr));
              grid-column-gap: 1rem;
            }

            @media (min-width: ${breakpoints.xl}) {
              grid-template-columns: repeat(3, minmax(0, 1fr));
              grid-column-gap: 1rem;
            }

            @media (min-width: ${breakpoints.xxl}) {
              padding: 0 2rem;
              grid-template-columns: repeat(3, minmax(0, 1fr));
              grid-column-gap: 4rem;
              grid-row-gap: 4rem;
            }
          `
        : css`
            @media (min-width: ${breakpoints.lg}) {
              padding: 0 1rem;
              grid-template-columns: repeat(1, minmax(0, 1fr));
            }

            @media (min-width: ${breakpoints.xxl}) {
              padding: 0 1rem;
              grid-template-columns: repeat(3, minmax(0, 1fr));
              grid-column-gap: 2rem;
              grid-row-gap: 4rem;
            }
          `}
  }
`;

export const FilterCard = styled.div`
  background: #fff;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1rem;
  margin-top: 1rem;
  box-shadow: 0 -1px 7px rgb(0 0 0 / 16%);

  @media (min-width: ${get("breakpoints.lg")}) {
    margin-bottom: 2rem;
    margin-top: 2rem;
  }
`;

export const ResultActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1rem;
  transition: all 0.3s linear;
  flex-direction: column;

  @media (min-width: ${breakpoints.xl}) {
    flex-direction: row;
  }

  @media (min-width: ${breakpoints.xxl}) {
    padding: 0 1rem;
  }

  &.affixed {
    background: #fff;
    padding: 5px 1rem;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;

    .filters {
      display: none;

      @media (min-width: ${breakpoints.md}) {
        display: flex;
        flex-wrap: wrap;
      }
    }
  }

  .filters {
    display: flex;
    flex-wrap: wrap;

    .filters-item {
      min-width: 10rem;
      margin-right: 1rem;
      margin-bottom: 0.5rem;

      .filters-item-label {
        font-weight: 500;
      }

      .filters-item-value {
        &.flex {
          display: flex;
        }

        .search-input {
          width: 100%;

          @media (min-width: ${breakpoints.xl}) {
            width: 18rem;
          }
        }

        .ant-select {
          width: 100%;

          .ant-tag {
            margin-left: 0.5rem;
          }
        }

        .prioritization-select {
          .ant-select-selector {
            background-color: #70bdc4;
          }

          .ant-select-selection-item {
            color: #fff;
            font-weight: 500;
          }

          .ant-select-arrow {
            color: #fff;
          }
        }

        .order-desc,
        .order-asc {
          transition: transform 0.3s ${timingFunctions("easeOutQuint")};
        }

        .order-desc {
          transform: rotate(180deg);
        }
      }
    }
  }

  .pagination {
    margin-top: 1rem;

    @media (min-width: ${breakpoints.xl}) {
      margin-top: 0;
    }
  }
`;
