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

  renderSpendingGraph(rawData, month) {
    const data = Object.entries(rawData.find(d => d.date === month).spending)
      .filter(row => !incomes.includes(row[0]) && row[1] !== 0)
      .sort((a, b) => b[1] - a[1]);

    const avg = {};
    const keyCat = data.map(([key, val]) => key);
    rawData.forEach(({ spending }) => {
      Object.keys(spending).forEach(key => {
        if(!keyCat.includes(key)){return;}
        avg[key] = (key in avg)
          ? avg[key] + spending[key]
          : spending[key];
      });
    });

    const average = Object.entries(avg)
      .map(([key, val]) => [key, Number((val / rawData.length).toFixed(2))]);

    const plotData = [
      { name: month, data },
      { name: 'avgerage', data: average },
    ];
    return data.length
      ? <ColumnChart data={plotData} />
      : <p>No data to display</p>;
  }

  renderCategoryGraph(rawData, month, category) {
    const data = rawData.find(d => d.date === month).category[category];
    const buffer = Object.entries(data)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    return buffer.length
      ? <ColumnChart data={buffer} />
      : <p>No data to display</p>;
  }

  renderEarnSpendingGraph(data) {
    const buffer = ['earn', 'spend'].map(category =>
      ({ name: category, data: data.map(d => [d.date, d.earning[category]]) }));
    return buffer.length
      ? <ColumnChart data={buffer} />
      : <p>No data to display</p>;
  }

  renderGraph() {
    const {
      data,
      graphType,
      month,
      category,
    } = this.props;

    if (graphType === 'spending') {
      return this.renderSpendingGraph(data, month);
    } else if (graphType === 'category') {
      return this.renderCategoryGraph(data, month, category);
    } else if (graphType === 'earning') {
      return this.renderEarnSpendingGraph(data);
    }
    return <p>select graph type</p>;
  }

  render() {
    return (
      <div>
        { this.renderTypeSelect() }
        { this.renderCategorySelect() }
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
