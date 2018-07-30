/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Expenses = new Mongo.Collection('expenses');

Expenses.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Expenses.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Expenses.schema = new SimpleSchema({
  owner: {
    type: String,
    label: 'The ID of the user this document belongs to.',
  },
  createdAt: {
    type: String,
    label: 'The date this document was created.',
    autoValue() {
      if (this.isInsert) return (new Date()).toISOString();
    },
  },
  updatedAt: {
    type: String,
    label: 'The date this document was last updated.',
    autoValue() {
      if (this.isInsert || this.isUpdate) return (new Date()).toISOString();
    },
  },
  date: {
    type: Date,
    label: 'The date of the expense.',
  },
  amount: {
    type: Number,
    label: 'The price of the expense.',
  },
  category: {
    type: String,
    label: 'The category of the expense.',
  },
  payment: {
    type: String,
    label: 'The type of the expense.',
  },
  recurring: {
    type: Boolean,
    label: 'Recurring expense.',
  },
  description: {
    type: String,
    label: 'The description of the expense.',
  },
});

Expenses.attachSchema(Expenses.schema);

export default Expenses;
