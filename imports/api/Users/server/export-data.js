/* eslint-disable consistent-return */

import JSZip from 'jszip';
import Expenses from '../../Expenses/Expenses';

let action;

const generateZip = (zip) => {
  try {
    zip.generateAsync({ type: 'base64' })
      .then(content => action.resolve(content));
  } catch (exception) {
    throw new Error(`[exportData.generateZip] ${exception.message}`);
  }
};

const addExpensesToZip = (expenses, zip) => {
  try {
    expenses.forEach((expense) => {
      zip.file(`${expense.title}.txt`, `${expense.title}\n\n${expense.body}`);
    });
  } catch (exception) {
    throw new Error(`[exportData.addExpensesToZip] ${exception.message}`);
  }
};

const getExpenses = (userId) => {
  try {
    return Expenses.find({ owner: userId }).fetch();
  } catch (exception) {
    throw new Error(`[exportData.getExpenses] ${exception.message}`);
  }
};

const exportData = ({ userId }, promise) => {
  try {
    action = promise;
    const zip = new JSZip();
    const expenses = getExpenses(userId);
    addExpensesToZip(expenses, zip);
    generateZip(zip);
  } catch (exception) {
    action.reject(exception.message);
  }
};

export default options =>
  new Promise((resolve, reject) =>
    exportData(options, { resolve, reject }));
