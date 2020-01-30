import uuid from 'uuid/v1';

export default [
  {
    link: '#',
    icon: 'intervention',
    title: 'Tipo intervenção',
    excerpt: 'Percentual por tipo intervenção'
  },
  {
    link: '#',
    icon: 'drugPrescription',
    title: 'Intervenções por prescrição',
    excerpt: 'Percentual de intervenções por prescrição'
  },
  {
    link: '#',
    icon: 'drug',
    title: 'Intervenções por medicamento',
    excerpt: 'Percentual de intervenções por medicamento'
  },
  {
    link: '#',
    icon: 'star',
    title: 'TOP 10',
    excerpt: 'TOP 10 medicamentos com intervenções'
  },
  {
    link: '#',
    icon: 'calendar',
    title: 'Intervenções do dia',
    excerpt: 'Intervenções do dia'
  }
].map(item => ({
  ...item,
  id: uuid()
}));
