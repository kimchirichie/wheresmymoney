import React from 'react';
import PropTypes from 'prop-types';
import ReactChartkick, { ColumnChart } from 'react-chartkick';
import Chart from 'chart.js';

// import Loading from '../../components/Loading/Loading';

class Graph extends React.Component {
  constructor(props) {
    super(props);
    ReactChartkick.addAdapter(Chart);
  }

  renderCategories(data, categories) {
    if (!data.length) { return null; }
    const buffer = categories.map(category =>
      ({ name: category, data: data.map(d => [d.date, d[category]]) }));
    return buffer.length
      ? <ColumnChart data={buffer} />
      : null;
  }

  render() {
    return (
      <div>
        { this.renderCategories(this.props.data, ['earning', 'spending']) }
      </div>
    );
  }
}

Graph.propTypes = {
  data: PropTypes.array.isRequired,
};

export default Graph;
