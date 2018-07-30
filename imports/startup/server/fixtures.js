import seeder from '@cleverbeagle/seeder';
import { Meteor } from 'meteor/meteor';
import Expenses from '../../api/Expenses/Expenses';

const expensesSeed = userId => ({
  collection: Expenses,
  environments: ['development', 'staging'],
  noLimit: true,
  modelCount: 5,
  model(dataIndex) {
    return {
      owner: userId,
      date: '2018-01-01',
      amount: 9.99,
      category: 'dining',
      payment: 'credit',
      recurring: false,
      description: 'dinner at mels',
    };
  },
});

seeder(Meteor.users, {
  environments: ['development', 'staging'],
  noLimit: true,
  data: [{
    email: 'admin@admin.com',
    password: 'password',
    profile: {
      name: {
        first: 'Andy',
        last: 'Warhol',
      },
    },
    roles: ['admin'],
    data(userId) {
      return expensesSeed(userId);
    },
  }],
  modelCount: 5,
  model(index, faker) {
    const userCount = index + 1;
    return {
      email: `user+${userCount}@test.com`,
      password: 'password',
      profile: {
        name: {
          first: faker.name.firstName(),
          last: faker.name.lastName(),
        },
      },
      roles: ['user'],
      data(userId) {
        return expensesSeed(userId);
      },
    };
  },
});
