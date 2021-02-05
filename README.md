# hippy-react-htmlview

## Introduction

hippy-react-htmlview is a HTML rich text render. It is the implementation of [react-native-htmlview@0.16.0](https://github.com/jsdf/react-native-htmlview) for Hippy React.

## Install

```bash
npm install hippy-react-htmlview --save
```

## Usage

```javascript
import React from 'react';
import HTMLView from 'hippy-react-htmlview';

class App extends React.Component {
  render () {
    return <HTMLView value={ '<span style="color: red; font-size: 20px;"></span>' } />;
  }
}
```

## API

For more APIs, please refer to [react-native-htmlview](https://github.com/jsdf/react-native-htmlview).
