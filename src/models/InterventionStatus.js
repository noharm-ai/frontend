export default {
  getClosedStatuses: () => {
    return ['a', 'n', 'x', 'j'];
  },
  translate: status => {
    switch (status) {
      case 'a':
        return {
          label: 'Aceita',
          color: 'green'
        };

      case 'n':
        return {
          label: 'Não aceita',
          color: 'red'
        };
      case 'j':
        return {
          label: 'Não aceita com Justificativa',
          color: 'red'
        };
      case 'x':
        return {
          label: 'Não se aplica',
          color: null
        };
      case 's':
        return {
          label: 'Pendente',
          color: 'orange'
        };
      default:
        return {
          label: `Indefinido (${status})`,
          color: null
        };
    }
  }
};
