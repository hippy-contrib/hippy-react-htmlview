import React from 'react';
import { View } from '@hippy/react';
import PropTypes from 'prop-types';
import htmlToElement from './htmlToElement';
import baseStyles from './styles';

const htmlToElementOptKeys = [
  'lineBreak',
  'paragraphBreak',
  'bullet',
  'TextComponent',
  'textComponentProps',
  'NodeComponent',
  'nodeComponentProps',
];

export default class HTMLView extends React.PureComponent {
  constructor () {
    super();
    this.state = {
      element: null,
    };
  }

  componentDidMount () {
    this.mounted = true;
    this.startHtmlRender(this.props.value);
  }

  componentDidUpdate (prevProps) {
    if (
      this.props.value !== prevProps.value ||
      this.props.stylesheet !== prevProps.stylesheet ||
      this.props.textComponentProps !== prevProps.textComponentProps ||
      this.props.nodeComponentProps !== prevProps.nodeComponentProps
    ) {
      this.startHtmlRender(
        this.props.value,
        this.props.stylesheet,
        this.props.textComponentProps,
        this.props.nodeComponentProps
      );
    }
  }

  componentWillUnmount () {
    this.mounted = false;
  }

  startHtmlRender (value, style, textComponentProps, nodeComponentProps) {
    const { addLineBreaks, onLinkPress, onLinkLongPress, stylesheet, renderNode, onError } = this.props;

    if (!value) {
      this.setState({ element: null });
    }

    const opts = {
      addLineBreaks,
      linkHandler: onLinkPress,
      linkLongPressHandler: onLinkLongPress,
      styles: { ...baseStyles, ...stylesheet, ...style },
      customRenderer: renderNode,
    };

    htmlToElementOptKeys.forEach((key) => {
      if (typeof this.props[key] !== 'undefined') {
        opts[key] = this.props[key];
      }
    });

    if (textComponentProps) {
      opts.textComponentProps = textComponentProps;
    }

    if (nodeComponentProps) {
      opts.nodeComponentProps = nodeComponentProps;
    }

    htmlToElement(value, opts, (err, element) => {
      if (err) {
        onError(err);
      }

      if (this.mounted) {
        this.setState({ element });
      }
    });
  }

  render () {
    const { RootComponent, style } = this.props;
    const { element } = this.state;
    if (element) {
      return (
        <RootComponent { ...this.props.rootComponentProps } style={ style }>
          { element }
        </RootComponent>
      );
    }
    return <RootComponent { ...this.props.rootComponentProps } style={ style } />;
  }
}

HTMLView.propTypes = {
  addLineBreaks: PropTypes.bool,
  bullet: PropTypes.string,
  lineBreak: PropTypes.string,
  NodeComponent: PropTypes.func,
  nodeComponentProps: PropTypes.object,
  onError: PropTypes.func,
  onLinkPress: PropTypes.func,
  onLinkLongPress: PropTypes.func,
  paragraphBreak: PropTypes.string,
  renderNode: PropTypes.func,
  RootComponent: PropTypes.func,
  rootComponentProps: PropTypes.object,
  style: PropTypes.object, // todo
  stylesheet: PropTypes.object,
  TextComponent: PropTypes.func,
  textComponentProps: PropTypes.object,
  value: PropTypes.string,
};

HTMLView.defaultProps = {
  addLineBreaks: true,
  onLinkPress: (url) => console.log(url),
  onLinkLongPress: null,
  onError: console.error.bind(console),
  RootComponent: (element) => <View { ...element } />, // eslint-disable-line react/display-name
};
