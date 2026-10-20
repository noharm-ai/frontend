import styled from "styled-components";

export const AntibiogramBox = styled.div`
  padding: 12px 16px 16px;

  /* the collection the antibiogram is of, in one line when it fits */
  .antibiogram-culture {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 32px;
    margin: 0 0 16px 0;

    dt {
      color: #8c8c8c;
      font-size: 12px;
    }

    dd {
      color: #2e3c5a;
      margin: 0;
    }
  }

  .antibiogram-lab-result {
    flex-basis: 100%;
  }

  /* the microorganisms side by side, to be compared drug by drug */
  .antibiogram-groups {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  }

  .antibiogram-microorganism {
    color: #2e3c5a;
    font-size: 14px;
    font-style: italic;
    font-weight: 600;
    margin: 0 0 8px 0;
  }

  .antibiogram-result {
    margin: 0;
  }

  .antibiogram-mic {
    white-space: nowrap;
  }

  .muted {
    color: #8c8c8c;
  }
`;
