import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ChangePassword from '@components/UserConfig/ChangePassword';

const mapStateToProps = () => ({});
const mapDispatchToProps = dispatch => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ChangePassword);
