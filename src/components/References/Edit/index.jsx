import React from "react";
import styled from "styled-components";

import { Row, Col } from "components/Grid";
import Heading from "components/Heading";
import Editor from "components/Editor";
import { get } from "styles/utils";

export const Box = styled.div`
  border-top: 1px solid ${get("colors.detail")};
  padding: 20px 0;
`;

export const EditorBox = styled.div`
  .ck-content {
    min-height: 100px;
  }
`;

export default function Edit({ outlier, updateSelectedOutlier }) {
  const onEditObs = (obs) => {
    updateSelectedOutlier({ obs });
  };

  return (
    <>
      <header>
        <Heading $margin="0 0 11px">Comentário</Heading>
      </header>
      <Box>
        <Row type="flex" gutter={24} css="padding: 7px 0">
          <Col span={8}>
            <Heading as="p" $size="14px">
              Medicamento:
            </Heading>
          </Col>
          <Col span={24 - 8}>{outlier.item.name}</Col>
        </Row>
        <Row type="flex" gutter={24} css="padding: 7px 0">
          <Col span={8}>
            <Heading as="p" $size="14px">
              Dose:
            </Heading>
          </Col>
          <Col span={24 - 8}>{outlier.item.dose}</Col>
        </Row>
        <Row type="flex" gutter={24} css="padding: 7px 0;margin-bottom: 20px">
          <Col span={8}>
            <Heading as="p" $size="14px">
              Frequencia diária:
            </Heading>
          </Col>
          <Col span={24 - 8}>{outlier.item.frequency}</Col>
        </Row>
        <EditorBox>
          <Editor
            content={outlier.item.obs || ""}
            onEdit={onEditObs}
            onReady={(editor) => {
              editor.editing.view.focus();
            }}
          />
        </EditorBox>
      </Box>
    </>
  );
}
