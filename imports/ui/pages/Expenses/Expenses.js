import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import styled from 'styled-components';

import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { ReactiveVar } from 'meteor/reactive-var';
import { Field, reduxForm } from 'redux-form';
import {
  Table,
  Button,
  FormGroup,
  FormControl,
  InputGroup,
} from 'react-bootstrap';

import ExpensesCollection from '../../../api/Expenses/Expenses';
import Loading from '../../components/Loading/Loading';
import BlankState from '../../components/BlankState/BlankState';

const INCREMENT = 20;
const limit = new ReactiveVar(INCREMENT);
const searchTerm = new ReactiveVar('');

const StyledExpenses = styled.div`
  table tbody tr td {
    vertical-align: middle;
  }
`;

const searchBar = field => (
  <FormGroup>
    <InputGroup>
      <FormControl type="text" {...field.input} />
      <InputGroup.Button>
        <Button onClick={e => field.onClick(e)}>Search</Button>
      </InputGroup.Button>
    </InputGroup>
  </FormGroup>
);

class Expenses extends React.Component {
  search(e) {
    e.preventDefault();
    searchTerm.set(this.props.searchTerm);
  }

  render() {
    return (!this.props.loading || this.props.expenses.length ? (
      <StyledExpenses>
        <Link className="btn btn-success d-block" style={{ display: 'block' }} to={`${this.props.match.url}/new`}>Add Expense</Link>
        <br />
        <form onSubmit={e => this.search(e)} >
          <Field name="searchTerm" component={searchBar} onClick={e => this.search(e)} />
        </form>
        {this.props.expenses.length ?
          <Table hover>
            <thead>
              <tr>
                <th>Date</th>
                <th className="text-right">Amount</th>
                <th className="hidden-xs hidden-sm">Category</th>
                <th className="hidden-xs hidden-sm">Method</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {this.props.expenses.map(({
                _id, date, amount, category, payment, description,
              }) => (
                <tr key={_id} onClick={() => this.props.history.push(`${this.props.match.url}/${_id}/edit`)}>
                  <td>{ moment.utc(date).format('MMM/D') }</td>
                  <td className="text-right">{ amount.toFixed(2) }</td>
                  <td className="hidden-xs hidden-sm">{ category }</td>
                  <td className="hidden-xs hidden-sm">{ payment }</td>
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
              onClick: () => this.props.history.push(`${this.props.match.url}/new`),
              label: 'Create Your First Expense',
            }}
          />}
        <Button onClick={() => limit.set(limit.get() + INCREMENT)} block>Load More</Button>
      </StyledExpenses>
    ) : <Loading />);
  }
}

Expenses.defaultProps = {
  searchTerm: '',
};

Expenses.propTypes = {
  loading: PropTypes.bool.isRequired,
  expenses: PropTypes.arrayOf(PropTypes.object).isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  searchTerm: PropTypes.string,
};

const mapStateToProps = state => ({
  searchTerm: (state.form.expense && state.form.expense.values && state.form.expense.values.searchTerm)
    ? state.form.expense.values.searchTerm
    : undefined,
});

let ExpenseContainer = connect(mapStateToProps)(Expenses);
ExpenseContainer = reduxForm({ form: 'expense' })(ExpenseContainer);
export default withTracker(() => {
  const subscription = Meteor.subscribe('expenses', limit.get(), searchTerm.get());
  return {
    loading: !subscription.ready(),
    expenses: ExpensesCollection.find({}, { sort: { date: -1 } }).fetch(),
  };
})(ExpenseContainer);
