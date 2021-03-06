
/* eslint-disable consistent-return */

import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import moment from 'moment';
import Expenses from './Expenses';
import handleMethodException from '../../modules/handle-method-exception';
import rateLimit from '../../modules/rate-limit';
import { categories, incomes } from './categories';

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
  'expenses.stats': function expensesStats(increment = 'month', quantity = 12) {
    check(increment, String);
    check(quantity, Number);
    if (!['month', 'week'].includes(increment)) { throw new Meteor.Error('403', 'Sorry, bud. You only get stats in month or week increments'); }
    if (quantity < 1 || quantity > 12) { throw new Meteor.Error('403', 'Sorry, bud. You only get 1-12 quantities of data points'); }

    const format = increment === 'month' ? 'MMM' : moment.defaultFormat;
    const start = moment().startOf(increment).subtract(quantity - 1, increment);
    const userId = Meteor.userId();
    const expenses = Expenses.find({ owner: userId, date: { $gte: start.toDate() } }, { sort: { date: 1 } }).fetch();
    const result = new Array(quantity).fill(0).map(() => {
      const x = {};
      x.date = start.clone().format(format);
      x.spending = { other: 0 };
      categories.forEach((c) => { x.spending[c] = 0; });
      x.category = {};
      categories.forEach((c) => { x.category[c] = {}; });
      x.earning = { earn: 0, spend: 0 };
      start.add(1, increment);
      return x;
    });

    const getIndex = (inc, qty, exp) => {
      if (inc === 'week') {
        return qty - 1 - moment().endOf(inc).diff(exp.date, inc);
      } else if (inc === 'month') {
        const startMonth = moment(exp.date).month();
        let endMonth = moment().endOf(inc).month();
        if (endMonth < startMonth) endMonth += 12;
        return qty - 1 - (endMonth - startMonth);
      }
      return false;
    };

    const addd = (a, b) => Number((a + b).toFixed(2));

    expenses.forEach((exp) => {
      const index = getIndex(increment, quantity, exp);
      const row = result[index];

      // spending
      if (!(exp.category in row.spending)) {
        row.spending.other = addd(exp.amount, row.spending.other);
      } else if (exp.category) {
        row.spending[exp.category] = addd(exp.amount, row.spending[exp.category]);
      }

      // category
      if (!(exp.category in row.category)) { row.category[exp.category] = {}; }
      if (!(exp.description in row.category[exp.category])) {
        row.category[exp.category][exp.description] = Number(exp.amount.toFixed(2));
      } else {
        row.category[exp.category][exp.description] = addd(exp.amount, row.category[exp.category][exp.description]);
      }

      // earning
      if (incomes.includes(exp.category)) {
        row.earning.earn = addd(exp.amount, row.earning.earn);
      } else {
        row.earning.spend = addd(exp.amount, row.earning.spend);
      }
    });

    return result;
  },
});

rateLimit({
  methods: [
    'expenses.insert',
    'expenses.update',
    'expenses.remove',
    'expenses.stats',
  ],
  limit: 5,
  timeRange: 1000,
});
