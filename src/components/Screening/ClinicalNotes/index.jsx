import React from 'react';
import isEmpty from 'lodash.isempty';
import { format, parseISO } from 'date-fns';

import { Row, Col } from '@components/Grid';
import Tag from '@components/Tag';
import LoadBox from '@components/LoadBox';

import { Container, Paper, List, PaperHeader } from './index.style';

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
              <Paper>{selected.text}</Paper>
            </>
          )}
        </Col>
        <Col md={10} xl={8} className="list-panel">
          <List>
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
                        <div className="indicators">
                          <Tag color="orange">5</Tag>
                          <Tag color="red">2</Tag>
                        </div>
                      </div>
                    ))}
                  </div>
                </React.Fragment>
              ))}
              {/* <h2>12/01/2021</h2>

            <div className="line-group">
              <div className="line active">
                <div className="time">18:20</div>
                <div className="name">
                  Asdrubal Nelson
                  <span>Médico | CRM 123132</span>
                </div>
                <div className="indicators">
                  <Tag color="orange">5</Tag>
                  <Tag color="red">2</Tag>
                </div>
              </div>

              <div className="line">
                <div className="time">16:20</div>
                <div className="name">
                  Asdrubal Nelson
                  <span>Médico | CRM 123132</span>
                </div>
                <div className="indicators">
                  <Tag color="orange">5</Tag>
                  <Tag color="red">2</Tag>
                </div>
              </div>

              <div className="line">
                <div className="time">13:05</div>
                <div className="name">
                  Asdrubal Nelson
                  <span>Médico | CRM 123132</span>
                </div>
                <div className="indicators">
                  <Tag color="orange">5</Tag>
                </div>
              </div>
              <div className="line">
                <div className="time">09:10</div>
                <div className="name">
                  Asdrubal Nelson
                  <span>Médico | CRM 123132</span>
                </div>
                <div className="indicators" />
              </div>
            </div> */}
            </>
          </List>
        </Col>
      </Row>
    </Container>
  );
}
