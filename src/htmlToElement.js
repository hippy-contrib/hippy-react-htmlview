import React from 'react';
import { StyleSheet, Text } from '@hippy/react';
import htmlparser from 'htmlparser2-without-node-native';
import entities from 'entities';
import camelcase from 'camelcase';
import Img from './Img';

const defaultOpts = {
  lineBreak: '\n',
  paragraphBreak: '\n\n',
  bullet: '\u2022 ',
  TextComponent: Text,
  textComponentProps: null,
  NodeComponent: Text,
  nodeComponentProps: null,
};

export default (rawHtml, customOpts = {}, done) => {
  const opts = {
    ...defaultOpts,
    ...customOpts,
  };

  const inheritedHippyStyle = (parent) => {
    if (!parent) return null;
    const style = StyleSheet.create(opts.styles[parent.name] || {});
    const parentStyle = inheritedHippyStyle(parent.parent) || {};
    return { ...parentStyle, ...style };
  };

  const inheritedCssStyle = (parent) => {
    if (!parent) return null;
    const style = StyleSheet.create(parent.cssStyle || {});
    const parentStyle = inheritedCssStyle(parent.parent) || {};
    return { ...parentStyle, ...style };
  };

  const cssProperty2HippyProperty = (property = '') => {
    return isNaN(parseFloat(property, 10)) ? property : parseFloat(property, 10);
  };

  const cssStyle2HippyStyle = (cssRules = '') => {
    if (!cssRules) return {};

    const res = {};
    cssRules
      .split(';')
      .filter((item) => item)
      .map((item) => {
        let [key, value] = item.split(':');
        key = (key || '').trim();
        value = (value || '').trim();
        key = camelcase(key);
        value = cssProperty2HippyProperty(value);
        res[key] = value;

        // bugfix: fontWeight must be a String in iOS.
        if (key === 'fontWeight') {
          res[key] = value.toString();
        }
      });
    return res;
  };

  const domToElement = (dom, parent) => {
    if (!dom) return null;

    const renderNode = opts.customRenderer;
    let orderedListCounter = 1;

    return dom.map((node, index, list) => {
      if (renderNode) {
        const rendered = renderNode(node, index, list, parent, domToElement);
        if (rendered || rendered === null) return rendered;
      }

      const { TextComponent } = opts;

      // transform <el style="color: red; font-size: 12px;"/> to Hippy style: { color: 'red', fontSize: 12 }
      node.cssStyle = node.attribs && node.attribs.style ? cssStyle2HippyStyle(node.attribs.style) : {};

      // inject style to `node.cssStyle` such as: <el color="#000" width="16px" height="16px"/>
      if (node.attribs) {
        const independentStyleAttribs = ['color', 'width', 'height'];
        independentStyleAttribs.forEach((key) => {
          if (node.attribs[key]) {
            node.cssStyle[key] = cssProperty2HippyProperty(node.attribs[key]);
          }
        });
      }

      if (node.type === 'text') {
        const defaultStyle = opts.textComponentProps ? opts.textComponentProps.style : null;
        const customStyle = { ...inheritedHippyStyle(parent), ...inheritedCssStyle(parent) };

        return (
          <TextComponent
            { ...opts.textComponentProps }
            key={ index }
            style={ [defaultStyle || {}, customStyle, node.cssStyle] }
          >
            { entities.decodeHTML(node.data) }
          </TextComponent>
        );
      }

      if (node.type === 'tag') {
        if (node.name === 'img') {
          return <Img key={ index } src={ node.attribs.src } style={ node.cssStyle } />;
        }

        let linkPressHandler = null;
        let linkLongPressHandler = null;
        if (node.name === 'a' && node.attribs && node.attribs.href) {
          linkPressHandler = () => opts.linkHandler(entities.decodeHTML(node.attribs.href));
          if (opts.linkLongPressHandler) {
            linkLongPressHandler = () => opts.linkLongPressHandler(entities.decodeHTML(node.attribs.href));
          }
        }

        let linebreakBefore = null;
        let linebreakAfter = null;
        if (opts.addLineBreaks) {
          switch (node.name) {
          case 'pre':
            linebreakBefore = opts.lineBreak;
            break;
          case 'p':
            if (index < list.length - 1) {
              linebreakAfter = opts.paragraphBreak;
            }
            break;
          case 'br':
          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
          case 'h5':
            linebreakAfter = opts.lineBreak;
            break;
          }
        }

        let listItemPrefix = null;
        if (node.name === 'li') {
          const defaultStyle = opts.textComponentProps ? opts.textComponentProps.style : null;
          const customStyle = { ...inheritedHippyStyle(parent), ...inheritedCssStyle(parent) };

          if (!parent) {
            listItemPrefix = null;
          } else if (parent.name === 'ol') {
            listItemPrefix = (
              <TextComponent style={ [defaultStyle || {}, customStyle, node.cssStyle] }>
                { `${orderedListCounter++}. ` }
              </TextComponent>
            );
          } else if (parent.name === 'ul') {
            listItemPrefix = (
              <TextComponent style={ [defaultStyle || {}, customStyle, node.cssStyle] }>{ opts.bullet }</TextComponent>
            );
          }
          if (opts.addLineBreaks && index < list.length - 1) {
            linebreakAfter = opts.lineBreak;
          }
        }

        const { NodeComponent, styles } = opts;
        const customStyle = !node.parent ? styles[node.name] : null;

        return (
          <NodeComponent
            { ...opts.nodeComponentProps }
            key={ index }
            onPress={ linkPressHandler }
            style={ [customStyle || {}, node.cssStyle] }
            onLongPress={ linkLongPressHandler }
          >
            { linebreakBefore && <Text>{ linebreakBefore }</Text> }
            { listItemPrefix && <Text>{ listItemPrefix }</Text> }
            { domToElement(node.children, node) }
            { linebreakAfter && <Text>{ linebreakAfter }</Text> }
          </NodeComponent>
        );
      }
    });
  };

  const handler = new htmlparser.DomHandler((err, dom) => {
    if (err) done(err);
    done(null, domToElement(dom));
  });
  const parser = new htmlparser.Parser(handler);
  parser.write(rawHtml);
  parser.done();
};
