import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';

import Loading from '../../components/Loading/Loading';
import BlankState from '../../components/BlankState/BlankState';
import BillsCollection from '../../../api/Bills/Bills';
import { rosetta } from '../../../api/Expenses/categories';

const StyledBills = styled.div`
  table tbody tr td {
    vertical-align: middle;
  }
  .due {
    color: red
  }
`;

const labelFreq = (frequency) => {
  const stone = rosetta.find(p => p.moment.toString() === frequency);
  return stone ? stone.label : frequency;
};

const due = timestamp => moment().diff(timestamp, 'days') > 0;

const Bills = props =>
  ((!props.loading || props.bills.length) ?
    <StyledBills>
      <Link className="btn btn-success d-block" style={{ display: 'block' }} to={`${props.match.url}/new`} >Add Bill</Link>
      <br />
      { props.bills.length ?
        <Table hover>
          <thead>
            <tr>
              <th>Date</th>
              <th className="text-right">Amount</th>
              <th className="hidden-xs hidden-sm">Category</th>
              <th className="hidden-xs hidden-sm">Frequency</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {props.bills.map(({
              _id, date, amount, category, description, frequency,
            }) => (
              <tr key={_id} onClick={() => props.history.push(`${props.match.url}/${_id}/edit`)}>
                <td className={due(date) ? 'due' : ''}>{ moment.utc(date).format('MMM/D') }</td>
                <td className="text-right">{ amount.toFixed(2) }</td>
                <td className="hidden-xs hidden-sm">{ category }</td>
                <td className="hidden-xs hidden-sm">{ labelFreq(frequency) }</td>
                <td>{ description }</td>
              </tr>
            ))}
          </tbody>
        </Table> : <BlankState
          icon={{ style: 'solid', symbol: 'file-alt' }}
          title="You're plum out of bills, friend!"
          subtitle="Add your first bill by clicking the button below."
          action={{
            style: 'success',
            onClick: () => props.history.push(`${props.match.url}/new`),
            label: 'Create Your First Bill',
          }}
        />}
    </StyledBills>
    : <Loading />);

Bills.propTypes = {
  loading: PropTypes.bool.isRequired,
  bills: PropTypes.arrayOf(PropTypes.object).isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withTracker(() => {
  const subscription = Meteor.subscribe('bills');
  return {
    loading: !subscription.ready(),
    bills: BillsCollection.find({}, { sort: { date: 1 } }).fetch(),
  };
})(Bills);
