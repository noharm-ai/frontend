import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Reports from '@components/Reports';
import widgets from './widgets';

const mapStateToProps = () => ({ widgets });
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      loadPage: () => () => {
        console.log('loadPage');
      }
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Reports);
