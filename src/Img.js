import React from 'react';
import AutoSizedImage from './AutoSizedImage';

export default class Img extends React.PureComponent {
  constructor (props) {
    super(props);
    this.state = {};
  }

  render () {
    const props = this.props;
    return <AutoSizedImage source={ { uri: props.src } } style={ props.style } />;
  }
}
