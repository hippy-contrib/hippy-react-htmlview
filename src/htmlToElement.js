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
        value = isNaN(parseFloat(value, 10)) ? value : parseFloat(value, 10);
        res[key] = value;
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
      node.cssStyle = node.attribs && node.attribs.style ? cssStyle2HippyStyle(node.attribs.style) : {};

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
          return <Img key={ index } attribs={ node.attribs } />;
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
