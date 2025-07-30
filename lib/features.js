import makeEventHandler from './event-handler/index.js';
import query from './event-handler/query.js';
import feature from './feature/index.js';
import object from './feature/object.js';
import { refresh } from './feature/source.js';

export { query, refresh };

export default function init(options) {
  const { map: _m } = options;
  const map = {
    _m,
    _eventHandler: makeEventHandler(_m)
  };

  function add(options) {
    return feature({
      ...options,
      map
    });
  }

  function remove(f) {
    f.remove();
  }

  function destroy() {
    self.off();
    delete map._m;
    delete self._m;
  }

  const self = object(
    {
      ...map,
      add,
      remove,
      destroy
    }
  );
  return self;
}
