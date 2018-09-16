/* eslint-disable max-len, no-return-assign */

import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { FormGroup, ControlLabel, Button, FormControl, Radio, Checkbox } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import { categories, rosetta } from '../../../api/Expenses/categories';

class ExpenseEditor extends React.Component {
  handleSubmit(e) {
    e.preventDefault();
    const exp = {
      date: new Date(this.form.date.value),
      amount: Number(this.form.amount.value),
      category: this.form.category.value.trim(),
      payment: this.form.payment.value.trim(),
      description: this.form.description.value.trim(),
    };
    const existingExpense = this.props.exp && this.props.exp._id;
    if (existingExpense) exp._id = existingExpense;
    if (this.props.bill) exp.frequency = this.form.frequency.value.trim();
    this.handleUpsert(exp);
  }

  handleUpsert(exp, isExpense = false) {
    const { history } = this.props;
    const existingExpense = exp && exp._id;
    const item = isExpense || !this.props.bill
      ? {
        methodToCall: existingExpense ? 'expenses.update' : 'expenses.insert',
        confirmation: existingExpense ? 'Expense saved!' : 'Expense updated!',
        url: '/expenses',
      }
      : {
        methodToCall: existingExpense ? 'bills.update' : 'bills.insert',
        confirmation: existingExpense ? 'Bill saved!' : 'Bill updated!',
        url: '/bills',
      };
    Meteor.call(item.methodToCall, exp, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        if (this.form) this.form.reset();
        Bert.alert(item.confirmation, 'success');
        history.push(item.url);
      }
    });
  }

  handleRemove(exp) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    const { history } = this.props;
    const item = this.props.bill
      ? { methodToCall: 'bills.remove', successMsg: 'Bill Deleted', url: '/bills' }
      : { methodToCall: 'expenses.remove', successMsg: 'Expenses Deleted', url: '/expenses' };
    Meteor.call(item.methodToCall, exp._id, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert(item.successMsg, 'success');
        history.push(item.url);
      }
    });
  }

  handlePayBill(bill) {
    if (!confirm('Are you sure you want to proceed with payment?')) return;
    this.handleUpsert({
      date: bill.date,
      amount: bill.amount,
      category: bill.category,
      payment: bill.payment,
      description: bill.description,
    }, true);

    const period = bill.frequency.split(',');
    const nextDate = moment(bill.date).add(period[0], period[1]).toDate();
    console.log(bill)
    this.handleUpsert({
      _id: bill._id,
      date: nextDate,
      amount: bill.amount,
      category: bill.category,
      payment: bill.payment,
      frequency: bill.frequency,
      description: bill.description,
    }, false);
  }

  renderDate(exp) {
    return (
      <FormGroup>
        <ControlLabel>Date</ControlLabel>
        <input
          type="date"
          className="form-control"
          name="date"
          defaultValue={exp && exp.date ? moment.utc(exp.date).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')}
        />
      </FormGroup>
    );
  }

  renderAmount(exp) {
    return (
      <FormGroup>
        <ControlLabel>Amount</ControlLabel>
        <input
          type="number"
          className="form-control"
          name="amount"
          placeholder="9.99"
          step={0.01}
          defaultValue={exp && exp.amount}
        />
      </FormGroup>
    );
  }

  renderCategory(exp) {
    return (
      <FormGroup>
        <ControlLabel>Category</ControlLabel>
        <FormControl
          componentClass="select"
          name="category"
          placeholder="select category"
          defaultValue={exp && exp.category ? exp.category : categories[0]}
        >
          {categories.map(category => <option key={category} value={category}>{category}</option>)}
        </FormControl>
      </FormGroup>
    );
  }

  renderPayment(exp) {
    return (
      <FormGroup>
        <ControlLabel>Payment</ControlLabel>
        <Radio name="payment" value="debit" inline defaultChecked={exp.payment === 'debit'}>debit</Radio>
        <Radio name="payment" value="credit" inline defaultChecked={exp.payment === 'credit'} >credit</Radio>
        <Radio name="payment" value="cash" inline defaultChecked={exp.payment === 'cash'}>cash</Radio>
      </FormGroup>
    );
  }

  renderFrequency(exp) {
    return this.props.bill
      ? (
        <FormGroup>
          <Checkbox disabled defaultChecked={this.props.bill}>
              Recurring?
          </Checkbox>
          <ControlLabel>Frequency</ControlLabel>
          <FormControl
            componentClass="select"
            name="frequency"
            placeholder="select frequency"
            defaultValue={exp && exp.frequency ? exp.frequency : rosetta[0]}
          >
            {rosetta.map(stone => <option key={stone.label} value={stone.moment}>{stone.label}</option>)}
          </FormControl>
        </FormGroup>
      )
      : undefined;
  }

  renderDescription(exp) {
    return (
      <FormGroup>
        <ControlLabel>Description</ControlLabel>
        <input
          type="text"
          className="form-control"
          name="description"
          defaultValue={exp && exp.description}
          placeholder="dinner at mels"
        />
      </FormGroup>
    );
  }

  renderPayBill(exp) {
    return exp && exp._id && this.props.bill
      ? (
        <Button type="button" bsStyle="warning" onClick={() => this.handlePayBill(exp)} block>Pay Bill</Button>
      )
      : undefined;
  }

  renderSubmit(exp) {
    let label;
    if (this.props.bill) {
      label = exp && exp._id ? 'Save Bill Changes' : 'Submit Bill';
    } else {
      label = exp && exp._id ? 'Save Expense Changes' : 'Submit Expense';
    }

    return <Button type="submit" bsStyle="success" block>{label}</Button>;
  }

  renderDelete(exp) {
    return (exp && exp._id)
      ? <Button type="button" bsStyle="danger" block onClick={() => this.handleRemove(exp)}>Delete</Button>
      : undefined;
  }

  render() {
    const { exp } = this.props;
    return (
      <form ref={form => (this.form = form)} onSubmit={e => this.handleSubmit(e)}>
        { this.renderDate(exp) }
        { this.renderAmount(exp) }
        { this.renderCategory(exp) }
        { this.renderPayment(exp) }
        { this.renderFrequency(exp) }
        { this.renderDescription(exp) }
        { this.renderPayBill(exp) }
        { this.renderSubmit(exp) }
        { this.renderDelete(exp) }
      </form>
    );
  }
}

ExpenseEditor.defaultProps = {
  exp: { payment: 'debit' },
  bill: false,
};

ExpenseEditor.propTypes = {
  exp: PropTypes.object,
  history: PropTypes.object.isRequired,
  bill: PropTypes.bool,
};

export default ExpenseEditor;
