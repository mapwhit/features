export default function mapListenersBag() {
  const bag = Object.create(null);

  function getListeners(type) {
    return bag[type] || [];
  }

  function add(type, listener) {
    let listeners = bag[type];
    if (!listeners) {
      bag[type] = listeners = [listener];
      return true;
    }
    listeners.push(listener);
  }

  function remove(type, listener) {
    const listeners = bag[type];
    const index = listeners.indexOf(listener);
    if (index >= 0) {
      listeners.splice(index, 1);
    }
    if (listeners.length === 0) {
      delete bag[type];
      return true;
    }
  }

  return {
    add,
    remove,
    getListeners
  };
}
