import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Table, Alert, Button, FormGroup, FormControl, InputGroup } from 'react-bootstrap';
import styled from 'styled-components';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Bert } from 'meteor/themeteorchef:bert';
import moment from 'moment';
import { ReactiveVar } from 'meteor/reactive-var';
import ExpensesCollection from '../../../api/Expenses/Expenses';
import { timeago, monthDayYearAtTime } from '../../../modules/dates';
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

class Expenses extends React.Component {
  constructor(props) {
    super(props);
    this.state = { searchTerm: '' };
  }

  handleRemove(expenseId) {
    if (confirm('Are you sure? This is permanent!')) {
      Meteor.call('expenses.remove', expenseId, (error) => {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          Bert.alert('Expense deleted!', 'success');
        }
      });
    }
  }

  render() {
    return (!this.props.loading ? (
      <StyledExpenses>
        <Link className="btn btn-success" to={`${this.props.match.url}/new`}>Add Expense</Link>
        <form onSubmit={event => event.preventDefault()}>
          <FormGroup>
            <InputGroup>
              <FormControl type="text" value={this.state.searchTerm} onChange={event => this.setState({ searchTerm: event.target.value })} />
              <InputGroup.Button>
                <Button onClick={() => searchTerm.set(this.state.searchTerm)}>Search</Button>
              </InputGroup.Button>
            </InputGroup>
          </FormGroup>
        </form>
        {this.props.expenses.length ?
          <Table responsive hover>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th className="hidden-sm">Category</th>
                <th className="hidden-sm">Method</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {this.props.expenses.map(({
                _id, date, amount, category, payment, description,
              }) => (
                <tr key={_id} onClick={() => this.props.history.push(`${this.props.match.url}/${_id}/edit`)}>
                  <td>{ moment.utc(date).format('MMM/D') }</td>
                  <td>{ amount.toFixed(2) }</td>
                  <td className="hidden-sm">{ category }</td>
                  <td className="hidden-sm">{ payment }</td>
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

Expenses.propTypes = {
  loading: PropTypes.bool.isRequired,
  expenses: PropTypes.arrayOf(PropTypes.object).isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withTracker(() => {
  const subscription = Meteor.subscribe('expenses', limit.get(), searchTerm.get());
  return {
    loading: !subscription.ready(),
    expenses: ExpensesCollection.find({}, { sort: { date: -1 } }).fetch(),
  };
})(Expenses);
