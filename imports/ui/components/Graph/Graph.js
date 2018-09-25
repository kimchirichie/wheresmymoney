import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import ReactChartkick, { ColumnChart } from 'react-chartkick';
import Chart from 'chart.js';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import moment from 'moment';
import { categories, incomes } from '../../../api/Expenses/categories';

const analyticSelect = field => (
  <FormGroup controlId="formControlsSelect">
    <ControlLabel>Select Graph Type</ControlLabel>
    <FormControl componentClass="select" placeholder="Type" {...field.input}>
      <option value="spending">Spending</option>
      <option value="category">Category Spending</option>
      <option value="earning">Earning & Spending</option>
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

const categorySelect = field => (
  <FormGroup controlId="formControlsSelect">
    <ControlLabel>Select Category</ControlLabel>
    <FormControl componentClass="select" placeholder="Category" {...field.input}>
      { categories.map(c => <option key={c} value={c}>{c}</option>) }
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
    return ['spending', 'category'].includes(graphType) && data.length
      ? <Field name="month" options={data.map(d => ({ val: d.date, label: d.date })).reverse()} component={monthSelect} />
      : null;
  }

  renderCategorySelect() {
    const { graphType } = this.props;
    return ['category'].includes(graphType)
      ? <Field name="category" component={categorySelect} />
      : null;
  }

  renderSpendingGraph(data) {
    const buffer = Object.entries(data.spending)
      .filter(row => !incomes.includes(row[0]) && row[1] !== 0)
      .sort((a, b) => b[1] - a[1]);
    return buffer.length
      ? <ColumnChart data={buffer} />
      : null;
  }

  renderCategoryGraph(data) {
    const buffer = Object.entries(data)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    return buffer.length
      ? <ColumnChart data={buffer} />
      : null;
  }

  renderEarnSpendingGraph(data) {
    if (!data.length) { return null; }
    const buffer = ['earning', 'spending'].map(category =>
      ({ name: category, data: data.map(d => [d.date, d[category]]) }));
    return buffer.length
      ? <ColumnChart data={buffer} />
      : null;
  }

  renderGraph() {
    const {
      data,
      graphType,
      month,
      category,
    } = this.props;

    if (graphType === 'earning') {
      return this.renderEarnSpendingGraph(data);
    } else if (graphType === 'category') {
      return this.renderCategoryGraph(data.find(d => d.date === month).category[category]);
    } else if (graphType === 'spending') {
      return this.renderSpendingGraph(data.find(d => d.date === month));
    }
    return <p>select graph type</p>;
  }

  render() {
    console.log(this.props.data);
    return (
      <div>
        { this.renderTypeSelect() }
        { this.renderMonthSelect() }
        { this.renderCategorySelect() }
        { this.renderGraph() }
      </div>
    );
  }
}

Graph.propTypes = {
  data: PropTypes.array.isRequired,
  graphType: PropTypes.string.isRequired,
  month: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  graphType: (state.form.graph && state.form.graph.values && state.form.graph.values.graphType)
    ? state.form.graph.values.graphType
    : undefined,
  month: (state.form.graph && state.form.graph.values && state.form.graph.values.month)
    ? state.form.graph.values.month
    : undefined,
  category: (state.form.graph && state.form.graph.values && state.form.graph.values.category)
    ? state.form.graph.values.category
    : undefined,
});

const GraphContainer = connect(mapStateToProps)(Graph);
export default reduxForm({
  form: 'graph',
  initialValues: {
    graphType: 'spending',
    month: moment().format('MMM'),
    category: categories[0],
  },
})(GraphContainer);
