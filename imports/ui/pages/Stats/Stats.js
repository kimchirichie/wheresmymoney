import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import Loading from '../../components/Loading/Loading';
import Graph from '../../components/Graph/Graph';

class Stats extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stats: [],
    };
    Meteor.call('expenses.stats', (error, result) => {
      this.setState({ stats: result });
    });
  }

  render() {
    return this.state.stats.length
      ? <Graph data={this.state.stats} />
      : <Loading />;
  }
}

export default withTracker(() => {
  const subscription = Meteor.subscribe('expenses.stats');
  return {
    loading: !subscription.ready(),
  };
})(Stats);
