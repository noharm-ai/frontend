import Tag from "antd/lib/tag";
import styled from "styled-components";

const Container = styled.div`
  padding: 12px 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
`;

const Label = styled.span`
  font-weight: 600;
  margin-right: 8px;
  color: #2e3c5a;
`;

export const expandedRowRender = (record: any) => (
  <Container>
    <Label>Marcadores:</Label>
    {record.tags?.length ? (
      record.tags.map((tag: string) => <Tag key={tag}>{tag}</Tag>)
    ) : (
      <span style={{ color: "#aaa" }}>Sem marcadores</span>
    )}
  </Container>
);
