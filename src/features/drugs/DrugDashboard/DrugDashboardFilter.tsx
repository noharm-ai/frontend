import { useState } from "react";
import { Affix } from "antd";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";

import { Select } from "components/Inputs";
import { createSlug } from "utils/transformers/utils";

const NavBar = styled.div`
  background: #fff;
  padding: 10px 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e8e8e8;
  transition: box-shadow 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  &.affixed {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  }

  .nav-label {
    color: var(--ant-color-text-secondary, #8c8c8c);
    font-size: 13px;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .nav-separator {
    color: var(--ant-color-text-quaternary, #bfbfbf);
    font-size: 16px;
    flex-shrink: 0;
    line-height: 1;
    user-select: none;
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

  const [affixed, setAffixed] = useState(false);

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

  return (
    <Affix offsetTop={0} onChange={(value) => setAffixed(!!value)}>
      <NavBar className={affixed ? "affixed" : ""}>
        <span className="nav-label">Painel de Medicamentos</span>
        <span className="nav-separator">›</span>
        <Select
          style={{ minWidth: 180 }}
          placeholder="Segmento..."
          loading={segments.isFetching}
          value={idSegment}
          onChange={handleSegmentChange}
          showSearch
          options={segments.list.map(({ id, description }) => ({
            value: id,
            label: description,
          }))}
          popupMatchSelectWidth={false}
        />
        {idSegment && (
          <>
            <span className="nav-separator">›</span>
            <Select
              style={{ minWidth: 220 }}
              placeholder="Medicamento..."
              loading={drugs.isFetching}
              value={idDrug}
              onChange={handleDrugChange}
              showSearch={{
                optionFilterProp: ["label"],
                filterOption: (input, option) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase()),
              }}
              options={drugs.list.map(({ idDrug, name }) => ({
                value: `${idDrug}`,
                label: name,
              }))}
              popupMatchSelectWidth={false}
            />
          </>
        )}
      </NavBar>
    </Affix>
  );
}
