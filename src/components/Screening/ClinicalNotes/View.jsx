import React, { useState, useRef, useEffect } from 'react';
import isEmpty from 'lodash.isempty';
import { format, parseISO } from 'date-fns';

import { useOutsideAlerter } from '@lib/hooks';

import ClinicalNotesIndicator from './ClinicalNotesIndicator';
import { Paper, PaperHeader, PaperContainer, MenuPopup } from './index.style';

export default function View({ selected, update }) {
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
      const textNode = document.createTextNode(selectionRange.toString());
      selectionRange.deleteContents();
      selectionRange.insertNode(textNode);
    }
  }, [isMenuVisible]); //eslint-disable-line

  const annotate = option => {
    const elm = document.createElement('span');
    const close = document.createElement('a');
    const content = document.createTextNode(selectionRange.toString());

    close.setAttribute('class', 'close-btn');
    close.appendChild(document.createTextNode('X'));

    elm.setAttribute('class', `annotation annotation-${option.key}`);
    elm.appendChild(content);
    elm.appendChild(close);

    selectionRange.deleteContents();
    selectionRange.insertNode(elm);

    setSelectionRange(null);
    setMenuVisibility(false);
    update({ id: selected.id, text: paperContainerRef.current.firstChild.innerHTML });
  };

  const removeAnnotation = e => {
    const el = e.target.closest('SPAN');
    if (el && e.target.className === 'close-btn') {
      el.removeChild(el.getElementsByClassName('close-btn')[0]);
      el.replaceWith(document.createTextNode(el.innerText));
      update({ id: selected.id, text: paperContainerRef.current.firstChild.innerHTML });
    }
  };

  const isValidSelection = () => {
    const selection = window.getSelection();

    if (selection.toString() === '') return false;

    if (selection.focusNode.nodeName !== '#text') return false;

    const range = selection.getRangeAt(0);

    if (range.cloneContents().querySelectorAll('span').length) {
      return false;
    }

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
        {ClinicalNotesIndicator.list().map(i => (
          <MenuPopup.Item key={i.value}>
            <div className="avatar" style={{ backgroundColor: i.color }} /> {i.label}
          </MenuPopup.Item>
        ))}
      </MenuPopup>
    </div>
  );

  if (isEmpty(selected)) return null;

  return (
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
            onClick={e => removeAnnotation(e)}
            className={isMenuVisible ? 'disabled' : ''}
          />
          {menu}
        </>
      </PaperContainer>
    </>
  );
}
