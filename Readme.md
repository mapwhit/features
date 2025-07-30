[![NPM version][npm-image]][npm-url]
[![Build Status][build-image]][build-url]
[![Dependency Status][deps-image]][deps-url]

# features

Manages features added to geojson sources predefined in map style.

## Install

```sh
$ npm install --save @mapwhit/features
```

## Usage

```js
import init from '@mapwhit/features';

const features = init({
  map, // map object initialized with map style
});

const feature = features.add({
  source, // name of geojson source defined in map style
  data
});

features.remove(feature);
```

## License

MIT © [Natalia](https://melitele.me)

[npm-image]: https://img.shields.io/npm/v/@mapwhit/features
[npm-url]: https://npmjs.org/package/@mapwhit/features

[build-url]: https://github.com/mapwhit/features/actions/workflows/check.yaml
[build-image]: https://img.shields.io/github/actions/workflow/status/mapwhit/features/check.yaml?branch=main

[deps-image]: https://img.shields.io/librariesio/release/npm/@mapwhit/features
[deps-url]: https://libraries.io/npm/@mapwhit%2Ffeature
