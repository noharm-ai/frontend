import React, { useState } from 'react';
import isEmpty from 'lodash.isempty';
import { format, parseISO } from 'date-fns';

import { Row, Col } from '@components/Grid';
import LoadBox from '@components/LoadBox';
import Empty from '@components/Empty';
import { Select } from '@components/Inputs';

import {
  Container,
  Paper,
  List,
  PaperHeader,
  PaperContainer,
  FilterContainer,
  Legend
} from './index.style';

export default function ClinicalNotes({ isFetching, list, selected, select, positionList }) {
  const [selectedPositions, setPositions] = useState([]);

  const handlePositionChange = p => {
    setPositions(p);
  };

  const getFilteredList = clinicalNotes => {
    if (selectedPositions.length === 0) {
      return clinicalNotes;
    }

    return clinicalNotes.filter(i => selectedPositions.indexOf(i.position) !== -1);
  };

  if (isFetching) {
    return (
      <Container>
        <LoadBox />
      </Container>
    );
  }

  return (
    <Container>
      <Row type="flex" gutter={0}>
        <Col md={14} xl={16} className="paper-panel">
          {!isEmpty(selected) && (
            <>
              <PaperHeader>
                <div className="line">
                  <div className="info">
                    {format(parseISO(selected.date), 'dd/MM/yyyy HH:mm')} -{' '}
                    <span className="name">{selected.prescriber}</span>
                  </div>
                </div>
              </PaperHeader>
              <PaperContainer>
                <Paper
                  dangerouslySetInnerHTML={{ __html: selected.text.replaceAll('  ', '<br/>') }}
                />
              </PaperContainer>
              <Legend>
                * Nomes presentes na evolução são substituídos por três asteriscos (***).
              </Legend>
            </>
          )}
        </Col>
        <Col md={10} xl={8} className="list-panel">
          {positionList.length > 0 && (
            <FilterContainer>
              <label>Cargo</label>
              <Select
                placeholder="Filtrar por cargo"
                onChange={handlePositionChange}
                allowClear
                style={{ minWidth: '300px' }}
                mode="multiple"
                optionFilterProp="children"
              >
                {positionList.map((p, i) => (
                  <Select.Option value={p} key={i}>
                    {p}
                  </Select.Option>
                ))}
              </Select>
            </FilterContainer>
          )}
          <List>
            {Object.keys(list).length === 0 && (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Nenhuma evolução encontrada"
              />
            )}
            {Object.keys(list).length > 0 && (
              <>
                {Object.keys(list).map(g => (
                  <React.Fragment key={g}>
                    <h2>{format(parseISO(g), 'dd/MM/yyyy')}</h2>
                    <div className="line-group">
                      {getFilteredList(list[g]).map((c, i) => (
                        <div
                          className={`line ${selected && c.id === selected.id ? 'active' : ''}`}
                          key={i}
                          onClick={() => select(c)}
                        >
                          <div className="time">{c.date.substr(11, 5)}</div>
                          <div className="name">
                            {c.prescriber}
                            <span>{c.position}</span>
                          </div>
                          <div className="indicators" />
                        </div>
                      ))}
                    </div>
                  </React.Fragment>
                ))}
              </>
            )}
          </List>
        </Col>
      </Row>
    </Container>
  );
}
