import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Signature from '@components/UserConfig/Signature';

const mapStateToProps = ({ reports }) => ({ reports });
const mapDispatchToProps = dispatch => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Signature);
