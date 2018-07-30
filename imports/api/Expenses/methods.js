
/* eslint-disable consistent-return */

import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import Expenses from './Expenses';
import handleMethodException from '../../modules/handle-method-exception';
import rateLimit from '../../modules/rate-limit';

Meteor.methods({
  'expenses.findOne': function expensesFindOne(expenseId) {
    check(expenseId, Match.OneOf(String, undefined));

    try {
      return Expenses.findOne(expenseId);
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  'expenses.insert': function expensesInsert(exp) {
    check(exp, {
      date: Date,
      amount: Number,
      category: String,
      payment: String,
      recurring: Boolean,
      description: String,
    });

    try {
      return Expenses.insert({ owner: this.userId, ...exp });
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  'expenses.update': function expensesUpdate(exp) {
    check(exp, {
      _id: String,
      date: Date,
      amount: Number,
      category: String,
      payment: String,
      recurring: Boolean,
      description: String,
    });

    try {
      const expenseId = exp._id;
      const expToUpdate = Expenses.findOne(expenseId, { fields: { owner: 1 } });

      if (expToUpdate.owner === this.userId) {
        Expenses.update(expenseId, { $set: exp });
        return expenseId; // Return _id so we can redirect to expense after update.
      }

      throw new Meteor.Error('403', 'Sorry, pup. You\'re not allowed to edit this expense.');
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  'expenses.remove': function expensesRemove(expenseId) {
    check(expenseId, String);

    try {
      const expToRemove = Expenses.findOne(expenseId, { fields: { owner: 1 } });

      if (expToRemove.owner === this.userId) {
        return Expenses.remove(expenseId);
      }

      throw new Meteor.Error('403', 'Sorry, pup. You\'re not allowed to delete this expense.');
    } catch (exception) {
      handleMethodException(exception);
    }
  },
});

rateLimit({
  methods: [
    'expenses.insert',
    'expenses.update',
    'expenses.remove',
  ],
  limit: 5,
  timeRange: 1000,
});
