import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Table, Alert, Button } from 'react-bootstrap';
import styled from 'styled-components';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Bert } from 'meteor/themeteorchef:bert';
import moment from 'moment';
import ExpensesCollection from '../../../api/Expenses/Expenses';
import { timeago, monthDayYearAtTime } from '../../../modules/dates';
import Loading from '../../components/Loading/Loading';
import BlankState from '../../components/BlankState/BlankState';

const StyledExpenses = styled.div`
  table tbody tr td {
    vertical-align: middle;
  }
`;

const handleRemove = (expenseId) => {
  if (confirm('Are you sure? This is permanent!')) {
    Meteor.call('expenses.remove', expenseId, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Expense deleted!', 'success');
      }
    });
  }
};

const Expenses = ({
  loading, expenses, match, history,
}) => (!loading ? (
  <StyledExpenses>
    <div className="page-header clearfix">
      <h4 className="pull-left">Expenses</h4>
      <Link className="btn btn-success pull-right" to={`${match.url}/new`}>Add Expense</Link>
    </div>
    {expenses.length ?
      <Table responsive>
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Method</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map(({
            _id, date, amount, category, payment, description,
          }) => (
            <tr key={_id} onClick={() => history.push(`${match.url}/${_id}/edit`)}>
              <td>{ moment.utc(date).format('MMM/D') }</td>
              <td>{ amount }</td>
              <td>{ category }</td>
              <td>{ payment }</td>
              <td>{ description }</td>
            </tr>
          ))}
        </tbody>
      </Table> : <BlankState
        icon={{ style: 'solid', symbol: 'file-alt' }}
        title="You're plum out of expenses, friend!"
        subtitle="Add your first expense by clicking the button below."
        action={{
          style: 'success',
          onClick: () => history.push(`${match.url}/new`),
          label: 'Create Your First Expense',
        }}
      />}
  </StyledExpenses>
) : <Loading />);

Expenses.propTypes = {
  loading: PropTypes.bool.isRequired,
  expenses: PropTypes.arrayOf(PropTypes.object).isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withTracker(() => {
  const subscription = Meteor.subscribe('expenses');
  return {
    loading: !subscription.ready(),
    expenses: ExpensesCollection.find({}, { sort: { date: -1 } }).fetch(),
  };
})(Expenses);
