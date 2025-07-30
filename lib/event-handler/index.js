import makeCountingSet from './counting-set.js';
import makeFeatureCollector from './feature-collector.js';
import makeListenersBag from './listeners-bag.js';
import query from './query.js';

const mouseEvents = asMap(['mouseenter', 'mouseover', 'mouseleave']);

const touchEvents = asMap(['touchstart', 'touchend', 'touchmove', 'touchcancel']);

// FIXME: we only support 'mouseover', 'mouseleave, and 'mouseenter' here
function translateEventType(type) {
  switch (type) {
    case 'mousemove':
      return 'mouseover';
    case 'mouseout':
      return 'mouseleave';
    default:
      return type;
  }
}

export default function featureEventHandler(_m) {
  const listenersBag = makeListenersBag();

  const activeTypes = makeCountingSet();
  const featureCollector = makeFeatureCollector(_m);

  function on(type, layers, featureId, listener) {
    type = translateEventType(type);
    listenersBag.add(type, layers, featureId, listener);
    addListener(type);
  }

  function off(type, layers, featureId, listener) {
    type = translateEventType(type);
    listenersBag.remove(type, layers, featureId, listener);
    removeMapListener(type);
  }

  function addListener(type) {
    if (mouseEvents[type]) {
      addListener('mousemove');
      addListener('mouseout');
    } else {
      if (activeTypes.inc(type)) {
        _m.on(type, getHandler(type));
      }
    }
  }

  function removeMapListener(type) {
    if (mouseEvents[type]) {
      removeMapListener('mousemove');
      removeMapListener('mouseout');
    } else {
      if (activeTypes.dec(type)) {
        _m.off(type, getHandler(type));
      }
    }
  }

  function getHandler(type) {
    switch (type) {
      case 'mousemove':
        return onmousemove;
      case 'mouseout':
        return onmouseout;
      default:
        return onevent;
    }
  }

  function getCurrentLayers(type) {
    return listenersBag.forType(type).filter(l => _m.getLayer(l));
  }

  function getCurrentMouseLayers() {
    const all = {};
    return Object.keys(mouseEvents)
      .reduce((all, type) => all.concat(listenersBag.forType(type)), [])
      .filter(l => {
        if (!_m.getLayer(l)) {
          return false;
        }
        if (all[l]) {
          return false;
        }
        all[l] = true;
        return true;
      });
  }

  function filterByZIndex(features) {
    if (features.length <= 1) {
      return features;
    }
    return [features[0]];
  }

  function fireEvent(type, e, features, filterByZ) {
    if (features.length === 0) {
      return;
    }
    if (filterByZ) {
      features = filterByZIndex(features);
    }
    features.forEach(feature => {
      const { id } = feature;
      e.feature = feature;
      listenersBag.getListeners(type, id).forEach(listener => listener.call(_m, e));
      delete e.feature;
    });
    e.preventDefault();
  }

  function onmousemove(e) {
    const { point } = e;
    const layers = getCurrentMouseLayers();
    const features = queryRenderedFeatures('mousemove', point, { layers });
    const result = featureCollector.onmove(features);
    Object.entries(result).forEach(([type, features]) => {
      e.type = type; // need to modify original event type
      fireEvent(type, e, features, type !== 'mouseleave');
    });
  }

  function onmouseout(e) {
    const result = featureCollector.onout();
    Object.entries(result).forEach(([type, features]) => {
      e.type = type; // need to modify original event type
      fireEvent(type, e, features);
    });
  }

  function onevent(e) {
    const { type, point } = e;
    const layers = getCurrentLayers(type);
    const features = layers.length > 0 ? queryRenderedFeatures(type, point, { layers }) : [];
    if (features.length > 0) {
      fireEvent(type, e, features, true); // true - only for top zindex
    }
  }

  function queryRenderedFeatures(type, point, options) {
    const fat = touchEvents[type] ? 10 : 3; // more fat for touch events
    return query(_m, point, fat, options);
  }

  return {
    on,
    off
  };
}

function asMap(arr) {
  return arr.reduce((obj, type) => {
    obj[type] = true;
    return obj;
  }, Object.create(null));
}
