import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import ReactChartkick, { ColumnChart } from 'react-chartkick';
import Chart from 'chart.js';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import moment from 'moment';
import { incomes, categories } from '../../../api/Expenses/categories';

const analyticSelect = field => (
  <FormGroup controlId="formControlsSelect">
    <ControlLabel>Select Graph Type</ControlLabel>
    <FormControl componentClass="select" placeholder="Type" {...field.input}>
      <option value="category">Category Spend</option>
      <option value="earn_&_spend">Earn & Spend</option>
    </FormControl>
  </FormGroup>
);

const monthSelect = field => (
  <FormGroup controlId="formControlsSelect">
    <ControlLabel>Select Month</ControlLabel>
    <FormControl componentClass="select" placeholder="Month" {...field.input}>
      { field.options.map(opt => <option key={opt.val} value={opt.val}>{opt.label}</option>) }
    </FormControl>
  </FormGroup>
);


class Graph extends React.Component {
  constructor(props) {
    super(props);
    ReactChartkick.addAdapter(Chart);
  }

  renderTypeSelect() {
    return (
      <Field name="graphType" component={analyticSelect} />
    );
  }

  renderMonthSelect() {
    const { graphType, data } = this.props;
    return graphType === 'category' && data.length
      ? <Field name="month" options={data.map(d => ({ val: d.date, label: d.date })).reverse()} component={monthSelect} />
      : null;
  }

  renderLong(data) {
    if (!data.length) { return null; }
    const buffer = ['earning', 'spending'].map(category =>
      ({ name: category, data: data.map(d => [d.date, d[category]]) }));
    console.log(buffer);
    return buffer.length
      ? <ColumnChart data={buffer} />
      : null;
  }

  renderShort(data) {
    console.log(data);
    const buffer = Object.entries(data.categories)
      .filter(row => !incomes.includes(row[0]) && row[1] !== 0)
      .sort((a, b) => b[1] - a[1]);
    console.log(buffer);
    return buffer.length
      ? <ColumnChart data={buffer} />
      : null;
  }

  renderGraph() {
    const { data, graphType, month } = this.props;
    if (graphType === 'earn_&_spend') {
      return this.renderLong(data, ['earning', 'spending']);
    } else if (graphType === 'category') {
      return this.renderShort(data.find(d => d.date === month), categories);
    }
    return <p>select graph type</p>;
  }

  render() {
    return (
      <div>
        { this.renderTypeSelect() }
        { this.renderMonthSelect() }
        { this.renderGraph() }
      </div>
    );
  }
}

Graph.propTypes = {
  data: PropTypes.array.isRequired,
  graphType: PropTypes.string.isRequired,
  month: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  graphType: (state.form.graph && state.form.graph.values)
    ? state.form.graph.values.graphType
    : undefined,
  month: (state.form.graph && state.form.graph.values)
    ? state.form.graph.values.month
    : unde1fined,
});

let GraphContainer = connect(mapStateToProps)(Graph);
GraphContainer = reduxForm({
  form: 'graph',
  initialValues: { graphType: 'category', month: moment().format('MMM') },
})(GraphContainer);

export default GraphContainer;
