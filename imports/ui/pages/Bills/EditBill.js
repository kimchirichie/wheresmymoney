import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import Bills from '../../../api/Bills/Bills';
import ExpenseEditor from '../../components/ExpenseEditor/ExpenseEditor';
import NotFound from '../NotFound/NotFound';

const EditBill = ({ bill, history }) => (bill ? (
  <div className="EditBill">
    <h4 className="page-header">Editing Bill</h4>
    <ExpenseEditor exp={bill} history={history} bill />
  </div>
) : <NotFound />);

EditBill.defaultProps = {
  bill: null,
};

EditBill.propTypes = {
  bill: PropTypes.object,
  history: PropTypes.object.isRequired,
};

export default withTracker(({ match }) => {
  const billId = match.params._id;
  const subscription = Meteor.subscribe('bills.edit', billId);

  return {
    loading: !subscription.ready(),
    bill: Bills.findOne(billId),
  };
})(EditBill);
