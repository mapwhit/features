const sources = new Map();
const updates = new Map();

function updateMap(map, id, data, timeout = 0) {
  if (updates.get(id)) {
    return;
  }
  updates.set(
    id,
    setTimeout(() => {
      updates.delete(id);
      if (!map?._m) {
        // there is no map instance
        return;
      }
      const source = map._m.getSource(id);
      if (!source) {
        // map is not ready yet
        return updateMap(map, id, data, 2 * timeout + 100);
      }
      source.setData(data);
    }, timeout)
  );
}

export function addToSource(map, id, feature) {
  let data = sources.get(id);
  if (!data) {
    data = {
      type: 'FeatureCollection',
      features: []
    };
    sources.set(id, data);
  }
  data.features.push(feature);
  updateMap(map, id, data);
}

export function removeFromSource(map, id, featureId) {
  const data = sources.get(id);
  if (!data) {
    return;
  }
  const idx = data.features.findIndex(f => f.id === featureId);
  if (idx === -1) {
    return;
  }
  data.features.splice(idx, 1);
  updateMap(map, id, data);
}

export function refresh(map) {
  sources.forEach((data, id) => updateMap(map, id, data));
}
