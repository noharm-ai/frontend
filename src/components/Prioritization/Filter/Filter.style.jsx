import styled from "styled-components";

export const Box = styled.div`
  align-items: ${(props) =>
    props.alignItems ? props.alignItems : "flex-start"};
  display: flex;
  flex-direction: ${(props) =>
    props.flexDirection ? props.flexDirection : "column"};
`;

export const HelpText = styled.div`
  font-size: 12px;
  margin-top: 5px;
`;
