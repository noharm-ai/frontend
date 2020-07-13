import React, { useEffect, useState } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { RichText } from 'prismic-reactjs';
import isEmpty from 'lodash.isempty';

import api from '@services/api';
import { routeToId } from '@utils/transformers/help';

import LoadBox from '@components/LoadBox';
import Collapse from '@components/Collapse';
import Heading from '@components/Heading';
import notification from '@components/notification';

import { RichTextContainer } from './Help.style';

export default function Help() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const location = useRouteMatch();

  useEffect(() => {
    const fetchData = async () => {
      const id = routeToId(location.path);
      const response = await api.getHelp(id);
      if (response) {
        setData(response);
      } else {
        setError('Nenhum conteúdo de ajuda encontrado para: ' + id);
      }
    };
    fetchData();
  }, [location.path]);

  useEffect(() => {
    if (error) {
      notification.error({ message: error });
    }
  }, [error]);

  if (!data) {
    return <LoadBox />;
  }

  return (
    <div>
      <Heading>Ajuda - {RichText.asText(data.data.title)}</Heading>
      <RichTextContainer>{RichText.render(data.data.description, null)}</RichTextContainer>

      {!isEmpty(data.data.questions) && (
        <>
          <Heading as="h2" size="14px" margin="20px 0 10px">
            Perguntas frequentes
          </Heading>
          <Collapse accordion>
            {data.data.questions.map((q, i) => (
              <Collapse.Panel header={RichText.asText(q.question)} key={i}>
                <RichTextContainer>{RichText.render(q.answer, null)}</RichTextContainer>
              </Collapse.Panel>
            ))}
          </Collapse>
        </>
      )}
    </div>
  );
}
