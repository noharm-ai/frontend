import { useState } from "react";
import { Affix } from "antd";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";

import { Row, Col } from "components/Grid";
import { Select } from "components/Inputs";
import { createSlug } from "utils/transformers/utils";

const FilterBar = styled.div`
  background: #fff;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e8e8e8;
  transition: box-shadow 0.2s;

  &.affixed {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  }

  .filter-field {
    display: inline-block;
    width: 100%;

    label {
      display: block;
      margin-bottom: 4px;
      color: #2e3c5a;
      font-weight: 600;
      font-size: 13px;
    }
  }
`;

interface Segment {
  id: number;
  description: string;
}

interface Drug {
  idDrug: number;
  name: string;
}

interface DrugDashboardFilterProps {
  segments: { list: Segment[]; isFetching: boolean };
  drugs: { list: Drug[]; isFetching: boolean };
}

const filterOption = (input: string, option: any) =>
  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;

export function DrugDashboardFilter({
  segments,
  drugs,
}: DrugDashboardFilterProps) {
  const navigate = useNavigate();
  const params = useParams();

  const idSegment = params.idSegment
    ? parseInt(params.idSegment, 10)
    : undefined;
  const idDrug = params.idDrug ? params.idDrug : undefined;

  const handleSegmentChange = (value: any) => {
    navigate(`/painel-medicamentos/${value}`);
  };

  const handleDrugChange = (value: any) => {
    if (!idSegment) return;
    const drug = drugs.list.find((d) => d.idDrug === value);
    if (!drug) return;
    const slug = createSlug(drug.name);
    navigate(`/painel-medicamentos/${idSegment}/${value}/${slug}`);
  };

  const [affixed, setAffixed] = useState(false);

  return (
    <Affix offsetTop={0} onChange={(value) => setAffixed(!!value)}>
      <FilterBar className={affixed ? "affixed" : ""}>
        <Row gutter={24}>
          <Col span={24} md={8}>
            <div className="filter-field">
              <label htmlFor="idSegment">Segmento</label>
              <Select
                id="idSegment"
                style={{ width: "100%" }}
                placeholder="Selecione um segmento..."
                loading={segments.isFetching}
                value={idSegment}
                onChange={handleSegmentChange}
                showSearch
                filterOption={filterOption}
              >
                {segments.list.map(({ id, description }) => (
                  <Select.Option key={id} value={id}>
                    {description}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </Col>
          <Col span={24} md={12}>
            <div className="filter-field">
              <label htmlFor="idDrug">Medicamento</label>
              <Select
                id="idDrug"
                style={{ width: "100%" }}
                placeholder="Selecione um medicamento..."
                loading={drugs.isFetching}
                disabled={!idSegment}
                value={idDrug}
                onChange={handleDrugChange}
                showSearch
                filterOption={filterOption}
              >
                {drugs.list.map(({ idDrug, name }) => (
                  <Select.Option key={`${idDrug}`} value={`${idDrug}`}>
                    {name}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </Col>
        </Row>
      </FilterBar>
    </Affix>
  );
}
