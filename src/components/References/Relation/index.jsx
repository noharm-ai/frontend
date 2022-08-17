import React, { useEffect } from "react";
import styled from "styled-components/macro";

import { Row, Col } from "components/Grid";
import { Select } from "components/Inputs";
import Heading from "components/Heading";
import Editor from "components/Editor";
import RichTextView from "components/RichTextView";
import Switch from "components/Switch";
import { get } from "styles/utils";

import { getTypeName } from "./columns";

export const Box = styled.div`
  border-top: 1px solid ${get("colors.detail")};
  padding: 20px 0;
`;

export const EditorBox = styled.div`
  .ck-content {
    min-height: 100px;
  }
`;

export default function Relation({
  relation,
  relationTypes,
  substance,
  update,
  fetchSubstances,
}) {
  useEffect(() => {
    fetchSubstances();
  }, [fetchSubstances]);

  const onEditObs = (text) => {
    update({ text });
  };

  const onChangeSctidB = (obj) => {
    update({ sctidB: obj.key, nameB: obj.label });
  };

  return (
    <>
      <header>
        <Heading margin="0 0 11px">Relação</Heading>
      </header>
      <Box>
        <Row type="flex" gutter={24} css="padding: 7px 0">
          <Col span={8}>
            <Heading as="p" size="14px">
              Substância:
            </Heading>
          </Col>
          <Col span={24 - 8}>{relation.item.sctNameA}</Col>
        </Row>
        {relation.item.new && (
          <>
            <Row type="flex" gutter={24} css="padding: 7px 0">
              <Col span={8}>
                <Heading as="p" size="14px">
                  Subst. relacionada:
                </Heading>
              </Col>
              <Col span={24 - 8}>
                <Select
                  id="sctidB"
                  labelInValue
                  showSearch
                  optionFilterProp="children"
                  style={{ width: "100%" }}
                  placeholder="Selecione o medicamento..."
                  onChange={onChangeSctidB}
                  value={{ key: relation.item.sctidB || "" }}
                  loading={substance.isFetching}
                >
                  {substance.list.map(({ sctid, name }) => (
                    <Select.Option key={sctid} value={sctid}>
                      {name}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
            </Row>
            <Row type="flex" gutter={24} css="padding: 7px 0">
              <Col span={8}>
                <Heading as="p" size="14px">
                  Tipo:
                </Heading>
              </Col>
              <Col span={24 - 8}>
                <Select
                  id="type"
                  showSearch
                  optionFilterProp="children"
                  style={{ width: "100%" }}
                  placeholder="Selecione o tipo de relação..."
                  onChange={(type) => update({ type })}
                  defaultValue={relation.item.type || undefined}
                >
                  {relationTypes.map(({ key, value }) => (
                    <Select.Option key={key} value={key}>
                      {value}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </>
        )}
        {relation.item.sctidB && !relation.item.new && (
          <>
            <Row type="flex" gutter={24} css="padding: 7px 0">
              <Col span={8}>
                <Heading as="p" size="14px">
                  Med. relacionado:
                </Heading>
              </Col>
              <Col span={24 - 8}>{relation.item.nameB}</Col>
            </Row>
            <Row type="flex" gutter={24} css="padding: 7px 0">
              <Col span={8}>
                <Heading as="p" size="14px">
                  Tipo:
                </Heading>
              </Col>
              <Col span={24 - 8}>
                {getTypeName(relation.item.type, relation.item.relationTypes)}
              </Col>
            </Row>
          </>
        )}
        {!relation.item.editable && (
          <>
            <Row type="flex" gutter={24} css="padding: 7px 0">
              <Col span={8}>
                <Heading as="p" size="14px">
                  Efeito:
                </Heading>
              </Col>
              <Col span={24 - 8}>
                <RichTextView text={relation.item.text} />
              </Col>
            </Row>
          </>
        )}
        <Row type="flex" gutter={24} css="padding: 7px 0">
          <Col span={8}>
            <Heading as="p" size="14px">
              Ativo:
            </Heading>
          </Col>
          <Col span={24 - 8}>
            <Switch
              onChange={(active) => update({ active })}
              checked={relation.item.active}
            />
          </Col>
        </Row>
        {relation.item.editable && (
          <Row type="flex" gutter={24} css="padding: 7px 0">
            <Col span={24}>
              <Heading as="p" size="14px">
                Efeito:
              </Heading>
            </Col>
            <Col span={24}>
              <EditorBox>
                <Editor
                  content={relation.item.text || ""}
                  onEdit={onEditObs}
                  readOnly={true}
                />
              </EditorBox>
            </Col>
          </Row>
        )}
      </Box>
    </>
  );
}
