export default {
  list: () => [
    {
      key: 'conduct',
      label: 'Conduta',
      value: 'conduta',
      color: '#ff9f1c',
      backgroundColor: 'rgba(255, 159, 28, 0.1)',
      category: 'priority'
    },
    {
      key: 'info',
      label: 'Dados',
      value: 'dados',
      color: '#1919e0',
      backgroundColor: 'rgba(25,25,224, 0.1)',
      category: 'info'
    },
    {
      key: 'diseases',
      label: 'Doenças',
      value: 'doencas',
      color: '#f1d302',
      backgroundColor: 'rgba(241, 211, 2, 0.1)',
      category: 'priority'
    },
    {
      key: 'complication',
      label: 'Eventos Adversos',
      value: 'complicacoes',
      color: '#e71d36',
      backgroundColor: 'rgba(231, 29, 54, 0.1)',
      category: 'priority'
    },
    {
      key: 'medications',
      label: 'Medicamentos',
      value: 'medicamentos',
      color: '#662e9b',
      backgroundColor: 'rgba(102,46,155, 0.1)',
      category: 'info'
    },
    {
      key: 'names',
      label: 'Nomes',
      value: 'nomes',
      color: '#808080',
      backgroundColor: 'rgba(128, 128, 128, 0.1)',
      category: 'info'
    },
    {
      key: 'signs',
      label: 'Sinais',
      value: 'sinais',
      color: '#c157a3',
      backgroundColor: 'rgba(193,87,163, 0.1)',
      category: 'info'
    },
    {
      key: 'symptoms',
      label: 'Sintomas',
      value: 'sintomas',
      color: '#43bccd',
      backgroundColor: 'rgba(67,188,205, 0.1)',
      category: 'priority'
    }
  ],

  listByCategory(category) {
    return this.list().filter(i => i.category === category);
  }
};