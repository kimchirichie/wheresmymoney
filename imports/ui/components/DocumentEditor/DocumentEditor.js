/* eslint-disable max-len, no-return-assign */

import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { FormGroup, ControlLabel, Button, FormControl, Radio, Checkbox } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import validate from '../../../modules/validate';

const categories = [
  'dining',
  'coffee',
  'transportation',
  'leisure',
  'fitness',
  'fashion',
  'accommodation',
  'groceries',
  'entertainment',
  'living',
  'education',
  'car',
  'phone',
  'fee',
  'alcohol',
  'electronics',
  'gift',
  'home',
  'donation',
  'insurance',
  'work',
  'refund',
  'other income',
];

class DocumentEditor extends React.Component {
  componentDidMount() {
    const component = this;
    validate(component.form, {
      rules: {
        title: {
          required: true,
        },
        body: {
          required: true,
        },
      },
      messages: {
        title: {
          required: 'Need a title in here, Seuss.',
        },
        body: {
          required: 'This thneeds a body, please.',
        },
      },
      submitHandler() { component.handleSubmit(component.form); },
    });
  }

  handleSubmit(form) {
    const { history } = this.props;
    const existingDocument = this.props.doc && this.props.doc._id;
    const methodToCall = existingDocument ? 'documents.update' : 'documents.insert';
    const doc = {
      title: form.title.value.trim(),
      body: form.body.value.trim(),
    };

    if (existingDocument) doc._id = existingDocument;

    Meteor.call(methodToCall, doc, (error, documentId) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        const confirmation = existingDocument ? 'Document updated!' : 'Document added!';
        this.form.reset();
        Bert.alert(confirmation, 'success');
        history.push(`/documents/${documentId}`);
      }
    });
  }

  render() {
    const { doc } = this.props;
    return (
      <form ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
        <FormGroup>
          <ControlLabel>Date</ControlLabel>
          <input
            type="date"
            className="form-control"
            name="date"
            defaultValue={doc && doc.date ? doc.date : moment().format('YYYY-MM-DD')}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Amount</ControlLabel>
          <input
            type="number"
            className="form-control"
            name="amount"
            placeholder="9.99"
            step={0.01}
            defaultValue={doc && doc.amount}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Category</ControlLabel>
          <FormControl
            componentClass="select"
            name="category"
            placeholder="select category"
            defaultValue={doc && doc.category ? doc.category : categories[0]}
          >
            {categories.map(category => <option key={category} value={category}>{category}</option>)}
          </FormControl>
        </FormGroup>
        <FormGroup>
          <ControlLabel>Payment</ControlLabel>
          <Radio name="payment" inline>credit</Radio>
          <Radio name="payment" inline>debit</Radio>
          <Radio name="payment" inline>cash</Radio>
        </FormGroup>
        <Checkbox name="recurring">
            Recurring?
        </Checkbox>
        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <input
            type="text"
            className="form-control"
            name="description"
            defaultValue={doc && doc.description}
            placeholder="dinner at mels"
          />
        </FormGroup>
        <Button type="submit" bsStyle="success" block>
          {doc && doc._id ? 'Save Changes' : 'Submit Expense'}
        </Button>
      </form>
    );
  }
}

DocumentEditor.defaultProps = {
  doc: { title: '', body: '' },
};

DocumentEditor.propTypes = {
  doc: PropTypes.object,
  history: PropTypes.object.isRequired,
};

export default DocumentEditor;
