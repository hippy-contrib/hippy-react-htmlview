import React from 'react';
import AutoSizedImage from './AutoSizedImage';

export default class Img extends React.PureComponent {
  constructor (props) {
    super(props);
    this.state = {};
  }

  render () {
    const props = this.props;
    const width = parseInt(props.attribs['width'], 10) || parseInt(props.attribs['data-width'], 10) || 0;
    const height = parseInt(props.attribs['height'], 10) || parseInt(props.attribs['data-height'], 10) || 0;

    const imgStyle = {
      width,
      height,
    };

    const source = {
      uri: props.attribs.src,
      width,
      height,
    };
    return <AutoSizedImage source={ source } style={ imgStyle } />;
  }
}
