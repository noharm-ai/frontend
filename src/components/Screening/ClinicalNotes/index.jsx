import React, { useState, useEffect, useCallback } from 'react';
import { format, parseISO } from 'date-fns';

import { annotationManifest } from '@utils/featureManifest';
import { Row, Col } from '@components/Grid';
import LoadBox from '@components/LoadBox';
import Empty from '@components/Empty';
import { Select } from '@components/Inputs';
import Tooltip from '@components/Tooltip';
import Button from '@components/Button';
import notification from '@components/notification';
import Tag from '@components/Tag';
import { getFirstAndLastName } from '@utils';

import View from './View';
import ClinicalNotesIndicator from './ClinicalNotesIndicator';
import { Container, List, FilterContainer } from './index.style';

export default function ClinicalNotes({
  isFetching,
  list,
  selected,
  select,
  update,
  positionList,
  security,
  saveStatus,
  access_token,
  userId
}) {
  const [positions, setPositions] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [selectedPositions, selectPositions] = useState([]);
  const [selectedIndicators, selectIndicators] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const filterList = useCallback(
    (stateList, selectFirst, positionsArray, indicatorsArray) => {
      const filteredGroup = [];
      Object.keys(stateList).forEach(g => {
        const clinicalNotes = stateList[g];

        if (positionsArray.length === 0 && indicatorsArray.length === 0) {
          filteredGroup.push({
            label: g,
            value: clinicalNotes
          });
        } else {
          const filteredNotes = clinicalNotes.filter(item => {
            const hasPosition =
              positionsArray.length === 0 ? true : positionsArray.indexOf(item.position) !== -1;

            let hasIndicator = false;
            if (indicatorsArray.length > 0) {
              indicatorsArray.forEach(indicator => {
                hasIndicator = hasIndicator || item[indicator] > 0;
              });
            } else {
              hasIndicator = true;
            }

            return hasPosition && hasIndicator;
          });

          if (filteredNotes.length) {
            filteredGroup.push({
              label: g,
              value: filteredNotes
            });
          }
        }
      });

      if (selectFirst) {
        if (filteredGroup.length) {
          select(filteredGroup[0].value[0]);
        } else {
          select({});
        }
      }

      return filteredGroup;
    },
    [select]
  );

  useEffect(() => {
    if (saveStatus.success) {
      notification.success({
        message: 'Uhu! Anotação salva com sucesso! :)'
      });
    }

    if (saveStatus.error) {
      notification.error({
        message: 'Ops! Algo de errado aconteceu.',
        description:
          'Aconteceu algo que nos impediu de salvar os dados desta anotação. Por favor, tente novamente.'
      });
    }
  }, [saveStatus]);

  useEffect(() => {
    setFilteredList(filterList(list, false, selectedPositions, selectedIndicators));
  }, [list]); //eslint-disable-line

  const handlePositionChange = p => {
    setPositions(p);
  };

  const handleIndicatorsChange = i => {
    setIndicators(i);
  };

  const search = () => {
    selectPositions(positions);
    selectIndicators(indicators);

    setFilteredList(filterList(list, true, positions, indicators));
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
          <View
            selected={selected}
            update={update}
            security={security}
            access_token={access_token}
            userId={userId}
          />
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
                  style={{ width: '90%' }}
                  mode="multiple"
                  optionFilterProp="children"
                  dropdownMatchSelectWidth={false}
                >
                  {positionList.map((p, i) => (
                    <Select.Option value={p} key={i}>
                      {p}
                    </Select.Option>
                  ))}
                </Select>
              </div>
              <div>
                <label>Indicadores</label>
                <Select
                  placeholder="Filtrar por indicadores"
                  onChange={handleIndicatorsChange}
                  allowClear
                  style={{ width: '100%' }}
                  mode="multiple"
                  optionFilterProp="children"
                  dropdownMatchSelectWidth={false}
                >
                  {ClinicalNotesIndicator.list().map((indicator, i) => (
                    <Select.Option value={indicator.key} key={indicator.key}>
                      <span
                        style={{
                          backgroundColor: indicator.backgroundColor,
                          borderColor: indicator.color,
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          borderRadius: '5px',
                          padding: '0 2px',
                          display: 'inline-block',
                          fontWeight: 500
                        }}
                      >
                        {indicator.label}
                      </span>
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
            {filteredList.length === 0 && (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Nenhuma evolução encontrada"
              />
            )}
            {filteredList.length > 0 && (
              <>
                {filteredList.map(group => (
                  <React.Fragment key={group.label}>
                    <h2>{format(parseISO(group.label), 'dd/MM/yyyy')}</h2>
                    <div className="line-group">
                      {group.value.map((c, i) => (
                        <div
                          className={`line ${selected && c.id === selected.id ? 'active' : ''}`}
                          key={i}
                          onClick={() => select(c)}
                          aria-hidden="true"
                        >
                          <div className="time">
                            {c.date.substr(11, 5)}
                            <div>&nbsp;</div>
                          </div>
                          <div className="name">
                            {getFirstAndLastName(c.prescriber)}
                            <span>{c.position}</span>
                          </div>
                          <div className="indicators">
                            {annotationManifest.isEnabled(security) &&
                              ClinicalNotesIndicator.listByCategory('priority').map(indicator => (
                                <React.Fragment key={indicator.key}>
                                  {c[indicator.key] > 0 && (
                                    <Tooltip title={indicator.label}>
                                      <Tag className={indicator.key}>{c[indicator.key]}</Tag>
                                    </Tooltip>
                                  )}
                                </React.Fragment>
                              ))}
                          </div>
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
