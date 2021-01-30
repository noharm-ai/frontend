import React from 'react';
import isEmpty from 'lodash.isempty';
import { format, parseISO } from 'date-fns';

import { Row, Col } from '@components/Grid';
import LoadBox from '@components/LoadBox';
import Empty from '@components/Empty';

import { Container, Paper, List, PaperHeader, PaperContainer } from './index.style';

export default function ClinicalNotes({ isFetching, list, selected, select }) {
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
            </>
          )}
        </Col>
        <Col md={10} xl={8} className="list-panel">
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
                      {list[g].map((c, i) => (
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
