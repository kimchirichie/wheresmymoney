import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Bills from '../Bills';

Meteor.publish('bills', function bills() {
  console.log(this.userId);
  const query = { owner: this.userId };
  return Bills.find(query, { sort: { date: -1 } });
});

// Note: bills.view is also used when editing an existing expense.
Meteor.publish('bills.view', (billId) => {
  check(billId, String);
  return Bills.find({ _id: billId });
});

Meteor.publish('bills.edit', function expensesEdit(billId) {
  check(billId, String);
  return Bills.find({ _id: billId, owner: this.userId });
});
