/* eslint-disable consistent-return */

import { Meteor } from 'meteor/meteor';
import Expenses from '../../Expenses/Expenses';

let action;

const deleteUser = (userId) => {
  try {
    return Meteor.users.remove(userId);
  } catch (exception) {
    throw new Error(`[deleteAccount.deleteUser] ${exception.message}`);
  }
};

const deleteExpenses = (userId) => {
  try {
    return Expenses.remove({ owner: userId });
  } catch (exception) {
    throw new Error(`[deleteAccount.deleteExpenses] ${exception.message}`);
  }
};

const deleteAccount = ({ userId }, promise) => {
  try {
    action = promise;
    deleteExpenses(userId);
    deleteUser(userId);
    action.resolve();
  } catch (exception) {
    action.reject(exception.message);
  }
};

export default options =>
  new Promise((resolve, reject) =>
    deleteAccount(options, { resolve, reject }));
