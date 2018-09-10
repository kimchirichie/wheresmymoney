import React from 'react';
// import PropTypes from 'prop-types';
// import { Link } from 'react-router-dom';
// import { Table, Button, FormGroup, FormControl, InputGroup } from 'react-bootstrap';
// import styled from 'styled-components';
// import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
// import moment from 'moment';
// import { ReactiveVar } from 'meteor/reactive-var';
// import ExpensesCollection from '../../../api/Expenses/Expenses';
import Loading from '../../components/Loading/Loading';
// import BlankState from '../../components/BlankState/BlankState';

// const INCREMENT = 20;
// const limit = new ReactiveVar(INCREMENT);
// const searchTerm = new ReactiveVar('');

class Stats extends React.Component {
  testfunc(test) {
    console.log(test);
  }

  render() {
    this.testfunc(123);
    return true ? (
      <div><p>stats page</p></div>
    ) : <Loading />;
  }
}

Stats.propTypes = {
  // loading: PropTypes.bool.isRequired,
  // expenses: PropTypes.arrayOf(PropTypes.object).isRequired,
  // match: PropTypes.object.isRequired,
  // history: PropTypes.object.isRequired,
};

export default withTracker(() => {
  console.log('test');
  // const subscription = Meteor.subscribe('expenses', limit.get(), searchTerm.get());
  return {
    test: true,
    // loading: !subscription.ready(),
    // expenses: ExpensesCollection.find({}, { sort: { date: -1 } }).fetch(),
  };
})(Stats);
