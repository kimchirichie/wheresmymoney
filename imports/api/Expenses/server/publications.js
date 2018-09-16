import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Expenses from '../Expenses';

const MAX_TODOS = 1000;

Meteor.publish('expenses', function expenses(limit, searchTerm) {
  check(limit, Number);
  check(searchTerm, String);
  const query = { owner: this.userId };
  if (searchTerm) query.description = { $regex: `.*${searchTerm}.*`, $options: 'i' };
  return Expenses.find(query, { sort: { date: -1 }, limit: Math.min(limit, MAX_TODOS) });
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

Meteor.publish('expenses.stats', function expensesStats() {
  const query = { owner: this.userId };
  return Expenses.find(query);
});
