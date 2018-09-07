import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import Expenses from '../../../api/Expenses/Expenses';
import ExpenseEditor from '../../components/ExpenseEditor/ExpenseEditor';
import NotFound from '../NotFound/NotFound';

const EditExpense = ({ exp, history }) => (exp ? (
  <div className="EditExpense">
    <h4 className="page-header">Editing Expense</h4>
    <ExpenseEditor exp={exp} history={history} />
  </div>
) : <NotFound />);

EditExpense.defaultProps = {
  exp: null,
};

EditExpense.propTypes = {
  exp: PropTypes.object,
  history: PropTypes.object.isRequired,
};

export default withTracker(({ match }) => {
  const expenseId = match.params._id;
  const subscription = Meteor.subscribe('expenses.edit', expenseId);

  return {
    loading: !subscription.ready(),
    exp: Expenses.findOne(expenseId),
  };
})(EditExpense);
