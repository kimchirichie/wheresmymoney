import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Expenses from '../Expenses';

Meteor.publish('expenses', function expenses() {
  return Expenses.find({ owner: this.userId });
});

// Note: expenses.view is also used when editing an existing expense.
Meteor.publish('expenses.view', (expenseId) => {
  check(expenseId, String);
  return Expenses.find({ _id: expenseId });
});

Meteor.publish('expenses.edit', function expensesEdit(expenseId) {
  check(expenseId, String);
  return Expenses.find({ _id: expenseId, owner: this.userId });
});
