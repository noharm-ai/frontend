import styled from "styled-components";

// the screening card, made for a column beside the patient card, here spans
// the page: more exams a row, and room under the slides for the carousel
// dots, which the card's height left them on the screening
export const ExamsBox = styled.div`
  && .content .exam-list {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }

  .slick-slider {
    margin-bottom: 30px;
  }
`;
