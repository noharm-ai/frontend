import React, { useEffect, useState } from 'react';
import { RichText } from 'prismic-reactjs';

import api from '@services/api';

import LoadBox from '@components/LoadBox';
import notification from '@components/notification';
import Card from '@components/Card';
import Heading from '@components/Heading';
import RichTextContainer from '@components/RichTextContainer';

export default function KnowledgeBaseArticle({ match }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await api.getKnowledgeBaseArticleByUID(match.params.uid);
      if (response) {
        setData(response);
      } else {
        setError('Nenhum conteúdo encontrado para: ' + match.params.uid);
      }
    };
    fetchData();
  }, [match.params.uid]);

  useEffect(() => {
    if (error) {
      notification.error({ message: error });
    }
  }, [error]);

  if (!data) {
    return <LoadBox />;
  }

  return (
    <Card>
      <Heading>{RichText.asText(data.data.title)}</Heading>
      <RichTextContainer style={{ marginTop: '20px' }}>
        {RichText.render(data.data.text)}
      </RichTextContainer>
    </Card>
  );
}
