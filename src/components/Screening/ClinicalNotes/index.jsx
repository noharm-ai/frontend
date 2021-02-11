import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';

import { Row, Col } from '@components/Grid';
import LoadBox from '@components/LoadBox';
import Empty from '@components/Empty';
import { Select } from '@components/Inputs';
import Tooltip from '@components/Tooltip';
import Button from '@components/Button';

import View from './View';
import { Container, List, FilterContainer } from './index.style';

export default function ClinicalNotes({
  isFetching,
  list,
  selected,
  select,
  update,
  positionList,
  security
}) {
  const [positions, setPositions] = useState([]);
  const [selectedPositions, selectPositions] = useState([]);

  const handlePositionChange = p => {
    setPositions(p);
  };

  const search = () => {
    selectPositions(positions);
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
          <View selected={selected} update={update} security={security} />
        </Col>
        <Col md={10} xl={8} className="list-panel">
          {positionList.length > 0 && (
            <FilterContainer>
              <div>
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
              </div>
              <div className="btn-search">
                <Tooltip title="Pesquisar">
                  <Button
                    type="secondary gtm-cn-btn-search"
                    shape="circle"
                    icon="search"
                    size="large"
                    onClick={search}
                  />
                </Tooltip>
              </div>
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
                          aria-hidden="true"
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
