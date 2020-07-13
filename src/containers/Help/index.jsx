import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Help from '@components/Help';

const mapStateToProps = ({ app }) => ({ helpData: app.help });
const mapDispatchToProps = dispatch => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Help);
