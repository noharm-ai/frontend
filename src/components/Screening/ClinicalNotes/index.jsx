import React, { useState, useRef, useEffect } from 'react';
import isEmpty from 'lodash.isempty';
import { format, parseISO } from 'date-fns';

import { Row, Col } from '@components/Grid';
import LoadBox from '@components/LoadBox';
import Empty from '@components/Empty';
import { useOutsideAlerter } from '@lib/hooks';

import { Container, Paper, List, PaperHeader, PaperContainer, MenuPopup } from './index.style';

export default function ClinicalNotes({ isFetching, list, selected, select, update }) {
  const paperContainerRef = useRef(null);
  const menuRef = useRef(null);
  const [isMenuVisible, setMenuVisibility] = useState(false);
  const [menuPosition, setMenuPosition] = useState({});
  const [selectionRange, setSelectionRange] = useState(null);

  useOutsideAlerter(menuRef, () => {
    setMenuVisibility(false);
  });

  useEffect(() => {
    if (!isMenuVisible && selectionRange) {
      console.log('clean span', selectionRange);
      const textNode = document.createTextNode(selectionRange.toString());
      selectionRange.deleteContents();
      selectionRange.insertNode(textNode);
    }
  }, [isMenuVisible]); //eslint-disable-line

  const annotate = option => {
    const elm = document.createElement('span');
    const content = document.createTextNode(selectionRange.toString());

    elm.setAttribute('class', `annotation-${option.key}`);
    elm.appendChild(content);

    selectionRange.deleteContents();
    selectionRange.insertNode(elm);

    setSelectionRange(null);
    setMenuVisibility(false);
    update({ id: selected.id, text: paperContainerRef.current.firstChild.innerHTML });
  };

  const isValidSelection = () => {
    const selection = window.getSelection();

    if (selection.toString() === '') return false;

    const range = selection.getRangeAt(0);

    if (range.commonAncestorContainer.offsetParent !== undefined) {
      const { className } = range.commonAncestorContainer.offsetParent;
      if (!className.includes('Paper-') && !className.includes('PaperContainer')) {
        console.log(
          'invalid selection',
          range.commonAncestorContainer.offsetParent.className,
          range
        );
        return false;
      }
    }

    return true;
  };

  const selectionChange = () => {
    if (isValidSelection()) {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);

      const elm = document.createElement('span');
      const content = document.createTextNode(window.getSelection().toString());

      elm.appendChild(content);

      range.deleteContents();
      range.insertNode(elm);

      const containerPosition = paperContainerRef.current.getBoundingClientRect();
      const menuContainerPosition = menuRef.current.getBoundingClientRect();
      const elmPosition = elm.getBoundingClientRect();

      const top = elmPosition.top - containerPosition.top - menuContainerPosition.height;

      setSelectionRange(range);
      setMenuVisibility(true);
      setMenuPosition({
        left: elmPosition.left - containerPosition.left + elmPosition.width,
        top: top < 0 ? -20 : top
      });
    }
  };

  const menu = (
    <div
      style={{
        position: 'absolute',
        top: menuPosition.top,
        left: menuPosition.left,
        visibility: isMenuVisible ? 'visible' : 'hidden'
      }}
      ref={menuRef}
    >
      <MenuPopup theme="dark" onClick={k => annotate(k)} selectable={false}>
        <MenuPopup.Item key="1">Evento adverso</MenuPopup.Item>
        <MenuPopup.Item key="2">Sintoma</MenuPopup.Item>
        <MenuPopup.Item key="3">Dado</MenuPopup.Item>
      </MenuPopup>
    </div>
  );

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
              <PaperContainer ref={paperContainerRef}>
                <>
                  <Paper
                    dangerouslySetInnerHTML={{
                      __html: selected.text.trim().replaceAll('  ', '<br/>')
                    }}
                    onMouseUp={e => selectionChange(e)}
                    className={isMenuVisible ? 'disabled' : ''}
                  />
                  {menu}
                </>
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
