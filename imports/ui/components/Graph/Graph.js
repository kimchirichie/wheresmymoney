import React from 'react';
import PropTypes from 'prop-types';
import ReactChartkick, { ColumnChart } from 'react-chartkick';
import Chart from 'chart.js';

import Loading from '../../components/Loading/Loading';

class Graph extends React.Component {
  constructor(props) {
    super(props);
    ReactChartkick.addAdapter(Chart);
  }

  render() {
    const earning = this.props.data
      ? this.props.data.map(r => [r.date, r.earning])
      : [];

    return this.state.stats.length
      ? <ColumnChart data={earning} />
      : <Loading />;
  }
}

Graph.defaultProps = {
  data: [],
};

Graph.PropTypes = {
  data: PropTypes.array.isRequired,
};

export default Graph;
