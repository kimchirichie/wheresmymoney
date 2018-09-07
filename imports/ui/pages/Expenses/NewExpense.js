import React from 'react';
import PropTypes from 'prop-types';
import ExpenseEditor from '../../components/ExpenseEditor/ExpenseEditor';

const NewExpense = ({ history }) => (
  <div className="NewExpense">
    <h4 className="page-header">New Expense</h4>
    <ExpenseEditor history={history} />
  </div>
);

NewExpense.propTypes = {
  history: PropTypes.object.isRequired,
};

export default NewExpense;
