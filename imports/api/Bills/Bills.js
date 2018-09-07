/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Bills = new Mongo.Collection('bills');

Bills.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Bills.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Bills.schema = new SimpleSchema({
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
    label: 'The date of the bill.',
  },
  amount: {
    type: Number,
    label: 'The price of the bill.',
  },
  category: {
    type: String,
    label: 'The category of the bill.',
  },
  payment: {
    type: String,
    label: 'The type of the bill.',
  },
  description: {
    type: String,
    label: 'The description of the bill.',
  },
  frequency: {
    type: String,
    label: 'Recurring bill frequency.',
  },
});

Bills.attachSchema(Bills.schema);

export default Bills;
