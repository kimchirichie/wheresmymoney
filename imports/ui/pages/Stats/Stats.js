import React from 'react';
// import { Link } from 'react-router-dom';
// import { Table, Button, FormGroup, FormControl, InputGroup } from 'react-bootstrap';
// import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
// import moment from 'moment';
import Loading from '../../components/Loading/Loading';

class Stats extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    Meteor.call('expenses.stats', (error, result) => {
      this.setState({ stats: result });
    });
  }

  render() {
    console.log(this.state.stats);
    return this.state.stats
      ? <div><p>stats page</p></div>
      : <Loading />;
  }
}
//
// Stats.defaultProps = {};
//
// Stats.propTypes = {};
//
export default withTracker(() => {
  const subscription = Meteor.subscribe('expenses.stats');
  return {
    loading: !subscription.ready(),
  };
})(Stats);
