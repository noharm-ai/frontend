import styled from "styled-components";

// a collection: the collection on the left, its microorganisms and their
// antibiogram in the middle, its details button on the right. The card is
// narrow beside the exams card: a container query (CollectionList), not the
// screen, decides when the findings go under the exam
export const CollectionRow = styled.div`
  align-items: start;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  display: grid;
  gap: 6px 16px;
  grid-template-areas: "time exam findings action";
  grid-template-columns: 64px minmax(170px, 1.1fr) minmax(0, 3fr) auto;
  padding: 10px 16px;

  &:hover {
    background: #f6f8fb;
  }

  /* a drug of the prescription the lab found resistant */
  &.resistant-in-use {
    box-shadow: inset 3px 0 0 #cf1322;
  }

  @container (max-width: 760px) {
    grid-template-areas:
      "time exam action"
      "time findings findings";
    grid-template-columns: 56px minmax(0, 1fr) auto;
  }

  .collection-time {
    align-items: center;
    color: #595959;
    display: flex;
    font-size: 13px;
    font-variant-numeric: tabular-nums;
    gap: 6px;
    grid-area: time;
    padding-top: 1px;
  }

  .status-dot {
    background: #d9d9d9;
    border-radius: 50%;
    flex: none;
    height: 8px;
    width: 8px;

    &.isolated {
      background: #cf1322;
    }
  }

  .collection-exam {
    display: flex;
    flex-direction: column;
    grid-area: exam;
    line-height: 1.35;
    min-width: 0;

    .culture-exam {
      font-weight: 600;
    }
  }

  .collection-records {
    color: #8c8c8c;
    font-size: 12px;
    margin-top: 2px;
  }

  .collection-findings {
    display: flex;
    flex-direction: column;
    gap: 6px;
    grid-area: findings;
    min-width: 0;
  }

  .collection-action {
    grid-area: action;
  }

  .collection-text {
    color: #595959;
    font-size: 12.5px;
  }

  /* a microorganism and its antibiogram in one line when the card is wide */
  .organism {
    align-items: center;
    display: grid;
    gap: 2px 12px;
    grid-template-columns: minmax(130px, 190px) 185px minmax(0, 1fr);

    @container (max-width: 1000px) {
      grid-template-columns: minmax(120px, 170px) minmax(0, 1fr);

      .organism-drugs {
        grid-column: 1 / -1;
      }
    }
  }

  .organism-name {
    color: #2e3c5a;
    font-style: italic;
    font-weight: 600;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .organism-counts {
    align-items: center;
    color: #595959;
    display: flex;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    gap: 8px;
    white-space: nowrap;

    .resistant {
      color: #cf1322;
      font-weight: 600;
    }

    .susceptible {
      color: #389e0d;
      font-weight: 600;
    }

    .other {
      color: #ad6800;
      font-weight: 600;
    }
  }

  /* the share of resistant, other and susceptible results */
  .organism-bar {
    background: #f0f0f0;
    border-radius: 4px;
    display: flex;
    flex: none;
    height: 8px;
    overflow: hidden;
    width: 64px;

    > span {
      height: 100%;
    }

    .resistant {
      background: #f5636a;
    }

    .other {
      background: #f2c94c;
    }

    .susceptible {
      background: #8fcf9f;
    }
  }

  .organism-drugs {
    align-items: center;
    color: #595959;
    display: flex;
    flex-wrap: wrap;
    font-size: 12.5px;
    gap: 4px 6px;
    min-width: 0;

    .ant-tag {
      margin: 0;
    }

    .label {
      color: #8c8c8c;
    }
  }

  .in-use {
    align-items: center;
    display: inline-flex;
    gap: 4px;
  }
`;
