/* eslint-disable max-len, no-return-assign */

import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { FormGroup, ControlLabel, Button, FormControl, Radio, Checkbox } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import validate from '../../../modules/validate';

const categories = [
  'dining',
  'coffee',
  'transportation',
  'leisure',
  'fitness',
  'fashion',
  'accommodation',
  'groceries',
  'entertainment',
  'living',
  'education',
  'car',
  'phone',
  'fee',
  'alcohol',
  'electronics',
  'gift',
  'home',
  'donation',
  'insurance',
  'work',
  'refund',
  'other income',
];

class ExpenseEditor extends React.Component {
  componentDidMount() {
    const component = this;
    validate(component.form, {
      rules: {
        date: {
          required: true,
        },
        amount: {
          required: true,
        },
        category: {
          required: true,
        },
        payment: {
          required: true,
        },
        description: {
          required: true,
        },
      },
      messages: {
        date: {
          required: 'needs date to be filled in',
        },
        amount: {
          required: 'needs amount to be filled in',
        },
        category: {
          required: 'needs category to be filled in',
        },
        payment: {
          required: 'needs payment to be filled in',
        },
        description: {
          required: 'needs description to be filled in',
        },
      },
      submitHandler() { component.handleSubmit(component.form); },
    });
  }

  handleSubmit(form) {
    const { history } = this.props;
    const existingExpense = this.props.exp && this.props.exp._id;
    const methodToCall = existingExpense ? 'expenses.update' : 'expenses.insert';
    const exp = {
      date: new Date(form.date.value),
      amount: Number(form.amount.value),
      category: form.category.value.trim(),
      payment: form.payment.value.trim(),
      recurring: Boolean(form.payment.value),
      description: form.description.value.trim(),
    };

    if (existingExpense) exp._id = existingExpense;

    Meteor.call(methodToCall, exp, (error, expenseId) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        const confirmation = existingExpense ? 'Expense updated!' : 'Expense added!';
        this.form.reset();
        Bert.alert(confirmation, 'success');
        history.push('/expenses');
      }
    });
  }

  render() {
    const { exp } = this.props;
    return (
      <form ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
        <FormGroup>
          <ControlLabel>Date</ControlLabel>
          <input
            type="date"
            className="form-control"
            name="date"
            defaultValue={exp && exp.date ? moment.utc(exp.date).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')}
          />
        </FormGroup>
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
        <FormGroup>
          <ControlLabel>Payment</ControlLabel>
          <Radio name="payment" inline defaultChecked>credit</Radio>
          <Radio name="payment" inline>debit</Radio>
          <Radio name="payment" inline>cash</Radio>
        </FormGroup>
        <Checkbox name="recurring">
            Recurring?
        </Checkbox>
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
        <Button type="submit" bsStyle="success" block>
          {exp && exp._id ? 'Save Changes' : 'Submit Expense'}
        </Button>
      </form>
    );
  }
}

ExpenseEditor.defaultProps = {
  exp: { title: '', body: '' },
};

ExpenseEditor.propTypes = {
  exp: PropTypes.object,
  history: PropTypes.object.isRequired,
};

export default ExpenseEditor;
