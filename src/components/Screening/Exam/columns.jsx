import React from 'react';
import { Row, Col } from 'antd';

import { toDataSource } from '@utils';
import Table, { NestedTableContainer } from '@components/Table';
import Empty from '@components/Empty';
import Chart from 'react-google-charts';
import LoadBox from '@components/LoadBox';

const columns = [
  {
    title: 'Exame',
    dataIndex: 'name',
    align: 'left'
  },
  {
    title: 'Percentual',
    dataIndex: 'perc',
    align: 'center'
  },
  {
    title: 'Valor',
    dataIndex: 'value',
    align: 'center'
  },
  {
    title: 'Referência',
    dataIndex: 'ref',
    align: 'left'
  },
  {
    title: 'Data',
    dataIndex: 'date',
    align: 'center'
  }
];

export default columns;

export const examRowClassName = record => {
  if (record.alert) {
    return 'danger';
  }

  return '';
};

export const expandedExamRowRender = record => {
  const expandedColumns = [
    {
      title: 'Histórico de exames',
      align: 'left',
      children: [
        {
          title: 'Valor',
          dataIndex: 'value',
          align: 'center'
        },
        {
          title: 'Data',
          dataIndex: 'date',
          align: 'center'
        }
      ]
    }
  ];

  const history = record.history.map((item, index) => ({ ...item, key: index }));

  const dsHistory = toDataSource(history, 'key');
  const graphDataArray = history.map(item => {
    return [item.date, parseFloat(item.value.match(/[\d|,|.|e|E|\+]+/g)[0], 10)]; // eslint-disable-line
  });
  const dsGraph = [['data', 'valor']].concat(graphDataArray.reverse());

  return (
    <NestedTableContainer>
      <Row gutter={8} justify="center">
        <Col md={12}>
          <Table
            columns={expandedColumns}
            pagination={false}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Nenhum exame encontrado."
                />
              )
            }}
            dataSource={dsHistory}
            rowClassName={examRowClassName}
          />
        </Col>
        <Col md={12}>
          {dsGraph.length > 2 && (
            <Chart
              width={'100%'}
              height={'400px'}
              chartType="LineChart"
              loader={<LoadBox />}
              data={dsGraph}
              options={{
                hAxis: {
                  title: 'Data'
                },
                vAxis: {
                  title: 'Valor'
                },
                backgroundColor: 'transparent'
              }}
              rootProps={{ 'data-testid': '1' }}
            />
          )}
        </Col>
      </Row>
    </NestedTableContainer>
  );
};
