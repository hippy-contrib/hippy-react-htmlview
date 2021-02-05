import { Platform, StyleSheet } from '@hippy/react';

const boldStyle = { fontWeight: 'bold' };
const italicStyle = { fontStyle: 'italic' };
const underlineStyle = { textDecorationLine: 'underline' };
const strikethroughStyle = { textDecorationLine: 'line-through' };
const codeStyle = { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' };

export default StyleSheet.create({
  b: boldStyle,
  strong: boldStyle,
  i: italicStyle,
  em: italicStyle,
  u: underlineStyle,
  s: strikethroughStyle,
  strike: strikethroughStyle,
  pre: codeStyle,
  code: codeStyle,
  a: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  h1: { fontWeight: 'bold', fontSize: 36 },
  h2: { fontWeight: 'bold', fontSize: 30 },
  h3: { fontWeight: 'bold', fontSize: 24 },
  h4: { fontWeight: 'bold', fontSize: 18 },
  h5: { fontWeight: 'bold', fontSize: 14 },
  h6: { fontWeight: 'bold', fontSize: 12 },
});
