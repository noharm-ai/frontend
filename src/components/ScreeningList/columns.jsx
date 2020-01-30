import React from 'react';
import styled from 'styled-components/macro';
import { Link } from '@components/Button';
import Icon from '@components/Icon';
import Tooltip from '@components/Tooltip';

const setDataIndex = list => list.map(({ key, ...column }) => ({
  ...column,
  key,
  dataIndex: key
}))

const Flag = styled.span`
  border-radius: 3px;
  display: inline-block;
  height: 15px;
  width: 5px;

  &.red {
    background-color: #e46666;
  }

  &.yellow {
    background-color: #e4da66;
  }

  &.green {
    background-color: #7ebe9a;
  }
`;

const Action = ({ slug }) => (
  <Link type="primary" href={`/triagem/${slug}`}>
    <Icon type="search" />
  </Link>
);

export const defaultAction = {
  title: 'Ações',
  key: 'operations',
  width: 60,
  fixed: 'right',
  render: (text, prescription) => <Action {...prescription} />
};

export const desktopAction = {
  ...defaultAction,
  fixed: 'right'
};

export default setDataIndex([
  {
    key: 'class',
    width: 20,
    render: className => <Flag className={className || 'green'} />
  },
  {
    title: 'Nome',
    width: 250,
    key: 'namePatient'
  },
  {
    title: 'Data',
    width: 150,
    key: 'dateFormated'
  },
  {
    title: 'Risco do paciente',
    className: 'bg-light-gray',
    children: setDataIndex([
      {
        title: (
          <Tooltip title="Modification of Diet in Renal Disease">
            MDRD
          </Tooltip>
        ),
        className: 'bg-light-gray',
        key: 'mdrd',
        width: 80,
      },
      {
        title: (
          <Tooltip title="Cockcroft-Gault">
            CG
          </Tooltip>
        ),
        className: 'bg-light-gray',
        key: 'cg',
        width: 80,
      },
      {
        title: (
          <Tooltip title="Transaminase Glutâmico-Pxalacética">
            TGO
          </Tooltip>
        ),
        className: 'bg-light-gray',
        key: 'tgo',
        width: 80,
      },
      {
        title: (
          <Tooltip title="Transaminase Glutâmico-Pirúvica">
            TGP
          </Tooltip>
        ),
        className: 'bg-light-gray',
        key: 'tgp',
        width: 80,
      },
      {
        title: (
          <Tooltip title="Potássio">
            K
          </Tooltip>
        ),
        className: 'bg-light-gray',
        key: 'k',
        width: 80,
      },
      {
        title: (
          <Tooltip title="Sódio">
            NA
          </Tooltip>
        ),
        className: 'bg-light-gray',
        key: 'na',
        width: 80,
      },
      {
        title: (
          <Tooltip title="Relação Normatizada Internacional">
            RNI
          </Tooltip>
        ),
        className: 'bg-light-gray',
        key: 'rni',
        width: 80,
      }
    ])
  },
  {
    title: 'Risco da prescrição',
    children: setDataIndex([
      {
        title: (
          <Tooltip title="Antimicrobianos">
            AM
          </Tooltip>
        ),
        key: 'am',
        width: 80,
      },
      {
        title: (
          <Tooltip title="Alta Vigilância">
            AV
          </Tooltip>
        ),
        key: 'av',
        width: 80,
      },
      {
        title: (
          <Tooltip title="Sonda">
            S
          </Tooltip>
        ),
        key: 'tube',
        width: 80,
      },
      {
        title: (
          <Tooltip title="Controlados">
            C
          </Tooltip>
        ),
        key: 'controlled',
        width: 80,
      },
      {
        title: (
          <Tooltip title="Diferentes">
            D
          </Tooltip>
        ),
        key: 'diff',
        width: 80,
      },
      {
        title: (
          <Tooltip title="Escore Alto">
            A
          </Tooltip>
        ),
        key: 'scoreThree',
        width: 80,
      },
      {
        title: (
          <Tooltip title="Escore Médio">
            M
          </Tooltip>
        ),
        key: 'scoreTwo',
        width: 80,
      },
      {
        title: (
          <Tooltip title="Escore Baixo">
            B
          </Tooltip>
        ),
        key: 'scoreOne',
        width: 80,
      },
      {
        title: (
          <Tooltip title="Escore Total">
            T
          </Tooltip>
        ),
        key: 'prescriptionScore',
        width: 80,
      }
    ])
  },
]);
