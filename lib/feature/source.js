const sources = new Set();
const updates = new Map();

function updateMap(map, id, { data, diff, add, remove } = {}, timeout = 0) {
  const update = updates.get(id);
  if (update) {
    if (data) {
      delete update.diff;
      update.data = data;
      return;
    }
    if (add) {
      if (!update.diff) {
        update.diff = { add: [add] };
        return;
      }
      diffAdd(update.diff, add);
      return;
    }
    if (remove) {
      if (!update.diff) {
        update.diff = { remove: [remove] };
        return;
      }
      diffRemove(update.diff, remove);
      return;
    }
    return;
  }
  if (add || remove) {
    diff = {};
    if (add) {
      diff.add = [add];
    }
    if (remove) {
      diff.remove = [remove];
    }
  }
  updates.set(id, {
    data,
    diff,
    timeout: setTimeout(() => {
      const { data, diff } = updates.get(id);
      updates.delete(id);
      if (!map?._m) {
        // there is no map instance
        sources.delete(id);
        return;
      }
      const source = map._m.getSource(id);
      if (!source) {
        // map is not ready yet
        return updateMap(map, id, { data, diff }, 2 * timeout + 100);
      }
      if (!(data || diff)) {
        source.updateData({});
        return;
      }
      if (data) {
        source.setData(data);
      }
      if (diff) {
        source.updateData(diff);
      }
    }, timeout)
  });
}

export function addToSource(map, id, feature) {
  if (!sources.has(id)) {
    sources.add(id);
    const data = {
      type: 'FeatureCollection',
      features: []
    };
    updateMap(map, id, { data });
  }
  updateMap(map, id, { add: feature });
}

export function removeFromSource(map, id, featureId) {
  if (!sources.has(id)) {
    return;
  }
  updateMap(map, id, { remove: featureId });
}

export function refresh(map) {
  sources.forEach(id => updateMap(map, id));
}

function diffAdd(diff, feature) {
  const index = diff.remove?.indexOf(feature.id);
  if (index > -1) {
    diff.remove.splice(index, 1);
    if (diff.remove.length === 0) {
      delete diff.remove;
    }
    diff.update ??= [];
    diff.update.push({
      id: feature.id,
      newGeometry: feature.geometry,
      removeAllProperties: true,
      addOrUpdateProperties: Object.entries(feature.properties || {}).map(([key, value]) => ({ key, value }))
    });
    return;
  }
  diff.add ??= [];
  diff.add.push(feature);
}

function diffRemove(diff, featureId) {
  const indexAdd = diff.add?.findIndex(f => f.id === featureId);
  if (indexAdd > -1) {
    diff.add.splice(indexAdd, 1);
    if (diff.add.length === 0) {
      delete diff.add;
    }
    return;
  }
  const indexUpdate = diff.update?.findIndex(f => f.id === featureId);
  if (indexUpdate > -1) {
    diff.update.splice(indexUpdate, 1);
    if (diff.update.length === 0) {
      delete diff.update;
    }
  }
  diff.remove ??= [];
  diff.remove.push(featureId);
}
