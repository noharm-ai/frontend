import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckOutlined } from "@ant-design/icons";

import { Col, Row } from "components/Grid";
import Heading from "components/Heading";
import { Textarea } from "components/Inputs";
import { Box, EditorBox, ButtonContainer } from "components/Forms/Form.style";
import Button from "components/Button";
import notification from "components/notification";

import { SIGNATURE_STORE_ID, SIGNATURE_MEMORY_TYPE } from "utils/memory";

export default function Signature({ fetchMemory, saveMemory, memory, userId }) {
  const { t } = useTranslation();
  const [editedSignature, setSignature] = useState(null);
  const { isFetching, list: memoryData } = memory;
  const { isSaving, success, error } = memory.save;
  const memoryType = `${SIGNATURE_MEMORY_TYPE}_${userId}`;
  const signature = editedSignature ?? memoryData[0]?.value ?? "";

  useEffect(() => {
    fetchMemory(SIGNATURE_STORE_ID, memoryType);
  }, [fetchMemory]); //eslint-disable-line

  useEffect(() => {
    if (success) {
      notification.success({
        message: "Uhu! Assinatura salva com sucesso! :)",
      });
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      notification.error({
        message: t("error.title"),
        description: t("error.description"),
      });
    }
  }, [error, t]);

  const save = () => {
    saveMemory(SIGNATURE_STORE_ID, {
      ...memoryData[0],
      id: memoryData[0] ? memoryData[0].key : "",
      type: memoryType,
      value: signature,
    });
  };

  return (
    <Box>
      <Row style={{ width: "100%" }}>
        <Col xs={24} style={{ paddingBottom: "0" }}>
          <Heading as="label" $size="14px">
            Assinatura:
          </Heading>
        </Col>
        <Col xs={12} style={{ alignSelf: "flex-start" }}>
          <EditorBox>
            <Textarea
              autoFocus
              style={{ minHeight: "150px" }}
              disabled={isFetching}
              value={signature}
              onChange={({ target }) => setSignature(target.value)}
            />
          </EditorBox>
          <ButtonContainer>
            <Button
              type="primary"
              className="gtm-btn-save-signature"
              onClick={() => save()}
              disabled={isFetching || isSaving}
              loading={isSaving}
              icon={<CheckOutlined />}
            >
              Salvar
            </Button>
          </ButtonContainer>
        </Col>
      </Row>
    </Box>
  );
}
