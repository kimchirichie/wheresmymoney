import React from 'react';
import PropTypes from 'prop-types';
import ExpenseEditor from '../../components/ExpenseEditor/ExpenseEditor';

const NewBill = ({ history }) => (
  <div className="NewBill">
    <h4 className="page-header">New Bill</h4>
    <ExpenseEditor history={history} bill />
  </div>
);

NewBill.propTypes = {
  history: PropTypes.object.isRequired,
};

export default NewBill;
