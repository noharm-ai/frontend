import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import KnowledgeBase from '@components/KnowledgeBase';

const mapStateToProps = ({ reports }) => ({ reports });
const mapDispatchToProps = dispatch => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(KnowledgeBase);
