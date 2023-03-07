import React from "react";
import styled from "styled-components/macro";
import { QuestionOutlined } from "@ant-design/icons";

import Tooltip from "./Tooltip";

export default function Help({ text }) {
  return (
    <Container>
      <Tooltip title={text}>
        <QuestionOutlined />
      </Tooltip>
    </Container>
  );
}

const Container = styled.div`
  border: 1px solid #2e3c5a;
  border-radius: 50%;
  display: inline-block;
  padding: 0px 5px;
  font-size: 14px;
  margin-left: 12px;
`;
