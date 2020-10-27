import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { setJourneyThunk } from '@store/ducks/app/thunk';
import PageHeader from '@pages/ScreeningList/PageHeader';

const mapStateToProps = ({ app }) => ({
  journey: app.preferences.journey
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      setJourney: setJourneyThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(PageHeader);
