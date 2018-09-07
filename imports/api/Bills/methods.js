
/* eslint-disable consistent-return */

import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import Bills from './Bills';
import handleMethodException from '../../modules/handle-method-exception';
import rateLimit from '../../modules/rate-limit';

Meteor.methods({
  'bills.findOne': function billsFindOne(billId) {
    check(billId, Match.OneOf(String, undefined));

    try {
      return Bills.findOne(billId);
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  'bills.insert': function billsInsert(exp) {
    check(exp, {
      date: Date,
      amount: Number,
      category: String,
      payment: String,
      description: String,
      frequency: String,
    });

    try {
      return Bills.insert({ owner: this.userId, ...exp });
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  'bills.update': function billsUpdate(exp) {
    check(exp, {
      _id: String,
      date: Date,
      amount: Number,
      category: String,
      payment: String,
      description: String,
      frequency: String,
    });

    try {
      const billId = exp._id;
      const expToUpdate = Bills.findOne(billId, { fields: { owner: 1 } });

      if (expToUpdate.owner === this.userId) {
        Bills.update(billId, { $set: exp });
        return billId; // Return _id so we can redirect to bill after update.
      }

      throw new Meteor.Error('403', 'Sorry, pup. You\'re not allowed to edit this bill.');
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  'bills.remove': function billsRemove(billId) {
    check(billId, String);

    try {
      const expToRemove = Bills.findOne(billId, { fields: { owner: 1 } });

      if (expToRemove.owner === this.userId) {
        return Bills.remove(billId);
      }

      throw new Meteor.Error('403', 'Sorry, pup. You\'re not allowed to delete this bill.');
    } catch (exception) {
      handleMethodException(exception);
    }
  },
});

rateLimit({
  methods: [
    'bills.insert',
    'bills.update',
    'bills.remove',
  ],
  limit: 5,
  timeRange: 1000,
});
