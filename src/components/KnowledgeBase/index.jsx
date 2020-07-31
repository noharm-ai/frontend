import React, { useEffect, useState } from 'react';
import { RichText } from 'prismic-reactjs';

import api from '@services/api';

import LoadBox from '@components/LoadBox';
import notification from '@components/notification';
import List from '@components/List';
import Card from '@components/Card';

export default function KnowledgeBase() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await api.getKnowledgeBaseArticles();
      if (response) {
        setData(response);
      } else {
        setError('Nenhum conteúdo encontrado.');
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (error) {
      notification.error({ message: error });
    }
  }, [error]);

  if (!data) {
    return <LoadBox />;
  }

  return (
    <List
      itemLayout="vertical"
      size="large"
      dataSource={data.results}
      renderItem={item => (
        <Card>
          <List.Item
            key={item.uid}
            extra={<img width={272} alt="Descrição visual do artigo" src={item.data.image.url} />}
          >
            <List.Item.Meta
              title={
                <a href={`base-de-conhecimento/${item.uid}`}>{RichText.asText(item.data.title)}</a>
              }
            />
            {RichText.asText(item.data.brief)}
          </List.Item>
        </Card>
      )}
    />
  );
}
