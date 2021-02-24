import React, { useState, useRef, useEffect } from 'react';
import isEmpty from 'lodash.isempty';
import { format, parseISO } from 'date-fns';

import { annotationManifest } from '@utils/featureManifest';
import { useOutsideAlerter } from '@lib/hooks';
import Button from '@components/Button';
import Tooltip from '@components/Tooltip';
import { PopoverWelcome } from '@components/Popover';

import ClinicalNotesIndicator from './ClinicalNotesIndicator';
import {
  Paper,
  PaperHeader,
  PaperContainer,
  MenuPopup,
  Legend,
  WelcomeBubble
} from './index.style';

export default function View({ selected, update, security, access_token, userId }) {
  const paperContainerRef = useRef(null);
  const menuRef = useRef(null);
  const [isMenuVisible, setMenuVisibility] = useState(false);
  const [menuPosition, setMenuPosition] = useState({});
  const [selectionRange, setSelectionRange] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);

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

  useEffect(() => {
    const shouldShowWelcome = async () => {
      const show = await annotationManifest.shouldShowWelcome(access_token, userId);

      if (show) {
        setShowWelcome(true);
      }
    };

    shouldShowWelcome();
  }, [access_token, userId]);

  const gotIt = () => {
    annotationManifest.gotIt(access_token, userId);
    setShowWelcome(false);
  };

  const goToHelp = () => {
    window.open('https://noharm.octadesk.com/kb/article/aba-evolucoes');
  };

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
    if (!security.isAdmin()) return false;

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
          <MenuPopup.Item key={i.value} className="gtm-indicator">
            <div className="avatar" style={{ backgroundColor: i.color }} /> {i.label}
          </MenuPopup.Item>
        ))}
      </MenuPopup>
    </div>
  );

  const welcomeTooltip = (
    <WelcomeBubble>
      A NoHarm criou uma <strong>Inteligência Artificial</strong> para destacar as partes mais
      relevantes das evoluções.
      <br />
      <br />
      <strong>Você pode ajudar a treiná-la!</strong>
      <br /> Clique no ícone de ajuda para mais detalhes.
      <div className="action">
        <Button type="primary gtm-annotation-btn-help-ok" ghost onClick={() => gotIt()}>
          OK, entendi!
        </Button>
      </div>
    </WelcomeBubble>
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
          <div className="help">
            <Tooltip title="Ajuda">
              <PopoverWelcome
                title="Nova funcionalidade!"
                content={welcomeTooltip}
                trigger="hover"
                placement="bottom"
                visible={showWelcome}
              >
                <Button
                  type="primary gtm-annotation-btn-help"
                  ghost
                  shape="circle"
                  icon="question"
                  style={{ width: '28px', height: '28px', minWidth: '28px' }}
                  onClick={goToHelp}
                />
              </PopoverWelcome>
            </Tooltip>
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
            className={`${isMenuVisible ? 'disabled' : ''} ${
              annotationManifest.isEnabled(security) ? 'annotation-enabled' : 'annotation-disabled'
            }`}
          />
          {menu}
        </>
      </PaperContainer>
      <Legend>* Nomes presentes na evolução são substituídos por três asteriscos (***).</Legend>
    </>
  );
}
