import React from 'react';
import { format } from 'date-fns';
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
    align: 'center',
    render: (text, record) => {
      return record.value + ' ' + record.unit;
    }
  },
  {
    title: 'Referência',
    dataIndex: 'ref',
    align: 'left'
  },
  {
    title: 'Data',
    align: 'center',
    render: (text, record) => {
      return format(new Date(record.date), 'dd/MM/yyyy HH:mm');
    }
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
      key: 'test',
      children: [
        {
          title: 'Valor',
          align: 'center',
          key: 'key',
          render: (text, record) => {
            return record.value + ' ' + record.unit;
          }
        },
        {
          title: 'Data',
          align: 'center',
          key: 'testdata',
          render: (text, record) => {
            return format(new Date(record.date), 'dd/MM/yyyy HH:mm');
          }
        }
      ]
    }
  ];

  const history = record.history.map((item, index) => ({ ...item, objKey: index }));

  const dsHistory = toDataSource(history, 'objKey');
  const graphDataArray = history.map(item => {
    return [format(new Date(item.date), 'dd/MM'), parseFloat(item.value, 10)];
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
