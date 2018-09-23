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
    this.fetchStats('month', 12);
  }

  fetchStats(increment, quantity) {
    Meteor.call('expenses.stats', increment, quantity, (error, result) => {
      this.setState({ stats: result });
    });
  }

  render() {
    return this.state.stats && this.state.stats.length
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
