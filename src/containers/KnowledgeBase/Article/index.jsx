import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import KnowledgeBaseArticle from '@components/KnowledgeBase/Article';

const mapStateToProps = () => ({});
const mapDispatchToProps = dispatch => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(KnowledgeBaseArticle);
