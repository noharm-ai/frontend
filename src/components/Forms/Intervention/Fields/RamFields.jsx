import React from "react";
import { CalculatorOutlined } from "@ant-design/icons";

import { Input, Select } from "components/Inputs";
import Switch from "components/Switch";
import { Col, Row } from "components/Grid";
import Button from "components/Button";
import Heading from "components/Heading";
import Tooltip from "components/Tooltip";
import DefaultModal from "components/Modal";
import { NaranjoCalculator } from "src/components/NaranjoCalculator";

import { Box, InternalBox } from "../../Form.style";
import { Flex } from "antd";

export function RamFields({ setFieldValue, layout, values }) {
  const {
    internalNotificationCode,
    detection,
    anvisaCode,
    brand,
    batch,
    expiration,
    symptoms,
    suspended,
    describedInLeaflet,
    severity,
    severityDetail,
    causality,
  } = values.ramData;

  const openCalculator = () => {
    const modal = DefaultModal.info({
      title: "Algoritmo de Naranjo",
      content: null,
      icon: null,
      width: 500,
      okText: "Fechar",
      okButtonProps: { type: "default" },
      wrapClassName: "default-modal",
      footer: null,
    });

    const setResponse = (total) => {
      let causality = null;
      if (total > 8) {
        causality = "comprovada";
      } else if (total > 4) {
        causality = "provavel";
      } else if (total > 0) {
        causality = "possivel";
      } else {
        causality = "duvidosa";
      }

      setFieldValue("ramData.causality", causality);
    };

    modal.update({
      content: <NaranjoCalculator modalRef={modal} setResponse={setResponse} />,
    });
  };

  return (
    <div>
      <Heading
        as="h3"
        $size="14px"
        style={{ marginBottom: "5px", paddingLeft: "8px" }}
      >
        Detalhes RAM
      </Heading>
      <InternalBox>
        <Row gutter={[16, 16]} style={{ marginTop: "5px" }}>
          <Box>
            <Col xs={layout.label}>
              <Heading as="label" $size="14px">
                Detecção:
              </Heading>
            </Col>
            <Col xs={layout.input}>
              <Select
                optionFilterProp="children"
                style={{ width: "100%" }}
                value={detection}
                onChange={(value) => setFieldValue("ramData.detection", value)}
              >
                <Select.Option value="gatilho">Gatilho</Select.Option>
                <Select.Option value="ia">IA</Select.Option>
                <Select.Option value="outro">Outro</Select.Option>
              </Select>
            </Col>
          </Box>
          <Box>
            <Col xs={layout.label}>
              <Heading as="label" $size="14px">
                Código interno da notificação:
              </Heading>
            </Col>
            <Col xs={layout.input}>
              <Input
                style={{ width: "100%" }}
                value={internalNotificationCode}
                onChange={({ target }) =>
                  setFieldValue(
                    "ramData.internalNotificationCode",
                    target.value
                  )
                }
              />
            </Col>
          </Box>

          <Box>
            <Col xs={layout.label}>
              <Heading as="label" $size="14px">
                Código Anvisa:
              </Heading>
            </Col>
            <Col xs={layout.input}>
              <Input
                style={{ width: "100%" }}
                value={anvisaCode}
                onChange={({ target }) =>
                  setFieldValue("ramData.anvisaCode", target.value)
                }
              />
            </Col>
          </Box>

          <Box>
            <Col xs={layout.label}>
              <Heading as="label" $size="14px">
                Marca:
              </Heading>
            </Col>
            <Col xs={layout.input}>
              <Input
                style={{ width: "100%" }}
                value={brand}
                onChange={({ target }) =>
                  setFieldValue("ramData.brand", target.value)
                }
              />
            </Col>
          </Box>

          <Box>
            <Col xs={layout.label}>
              <Heading as="label" $size="14px">
                Lote:
              </Heading>
            </Col>
            <Col xs={layout.input}>
              <Input
                style={{ width: "100%" }}
                value={batch}
                onChange={({ target }) =>
                  setFieldValue("ramData.batch", target.value)
                }
              />
            </Col>
          </Box>

          <Box>
            <Col xs={layout.label}>
              <Heading as="label" $size="14px">
                Validade:
              </Heading>
            </Col>
            <Col xs={layout.input}>
              <Input
                style={{ width: "100%" }}
                value={expiration}
                onChange={({ target }) =>
                  setFieldValue("ramData.expiration", target.value)
                }
              />
            </Col>
          </Box>

          <Box>
            <Col xs={layout.label}>
              <Heading as="label" $size="14px">
                Sintomas:
              </Heading>
            </Col>
            <Col xs={layout.input}>
              <Input
                style={{ width: "100%" }}
                value={symptoms}
                onChange={({ target }) =>
                  setFieldValue("ramData.symptoms", target.value)
                }
              />
            </Col>
          </Box>
          <Box>
            <Col xs={layout.label}>
              <Heading as="label" $size="14px">
                O medicamento ou infusão foi suspenso?:
              </Heading>
            </Col>
            <Col xs={layout.input}>
              <Switch
                checked={suspended}
                onChange={(value) => setFieldValue("ramData.suspended", value)}
              />
            </Col>
          </Box>

          <Box>
            <Col xs={layout.label}>
              <Heading as="label" $size="14px">
                RAM descrita em bula?:
              </Heading>
            </Col>
            <Col xs={layout.input}>
              <Switch
                checked={describedInLeaflet}
                onChange={(value) =>
                  setFieldValue("ramData.describedInLeaflet", value)
                }
              />
            </Col>
          </Box>

          <Box>
            <Col xs={layout.label}>
              <Heading as="label" $size="14px">
                Gravidade:
              </Heading>
            </Col>
            <Col xs={layout.input}>
              <Select
                optionFilterProp="children"
                style={{ width: "100%" }}
                value={severity}
                onChange={(value) => setFieldValue("ramData.severity", value)}
              >
                <Select.Option value="1">Leve</Select.Option>
                <Select.Option value="2">Moderada</Select.Option>
                <Select.Option value="3">Grave</Select.Option>
              </Select>
            </Col>
          </Box>

          <Box>
            <Col xs={layout.label}>
              <Heading as="label" $size="14px">
                Impacto:
              </Heading>
            </Col>
            <Col xs={layout.input}>
              <Select
                optionFilterProp="children"
                style={{ width: "100%" }}
                value={severityDetail}
                onChange={(value) =>
                  setFieldValue("ramData.severityDetail", value)
                }
              >
                <Select.Option value="1">Resultou em óbito</Select.Option>
                <Select.Option value="2">
                  Incapacidade, persistente ou significativa
                </Select.Option>
                <Select.Option value="3">Ameaça à vida</Select.Option>
                <Select.Option value="4">
                  Anomalia congênita ou malformação
                </Select.Option>
                <Select.Option value="5">
                  Hospitalização/Prolongamento da hospitalização
                </Select.Option>
                <Select.Option value="6">
                  Outro efeito clinicamente significativo
                </Select.Option>
              </Select>
            </Col>
          </Box>

          <Box>
            <Col xs={layout.label}>
              <Heading as="label" $size="14px">
                Causalidade:
              </Heading>
            </Col>
            <Col xs={layout.input}>
              <Flex>
                <Select
                  optionFilterProp="children"
                  style={{ width: "100%", marginRight: "5px" }}
                  value={causality}
                  onChange={(value) =>
                    setFieldValue("ramData.causality", value)
                  }
                  allowClear
                >
                  <Select.Option value="comprovada">Comprovada</Select.Option>
                  <Select.Option value="provavel">Provável</Select.Option>
                  <Select.Option value="possivel">Possível</Select.Option>
                  <Select.Option value="duvidosa">Duvidosa</Select.Option>
                </Select>
                <Tooltip title="Algoritmo de Naranjo">
                  <Button
                    icon={<CalculatorOutlined />}
                    onClick={() => openCalculator()}
                  />
                </Tooltip>
              </Flex>
            </Col>
          </Box>
        </Row>
      </InternalBox>
    </div>
  );
}
