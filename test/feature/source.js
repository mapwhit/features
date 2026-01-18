import test from 'node:test';
import { addToSource, removeFromSource } from '../../lib/feature/source.js';

const data = [
  {
    id: 1,
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [0, 0]
    },
    properties: { name: 'Feature 1' }
  },
  {
    id: 2,
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [0, 0]
    }
  }
];

test('addToSource', async t => {
  await t.test('map not ready', async t => {
    let ready = false;
    let newData;
    let newDiff;
    const map = {
      _m: {
        getSource() {
          if (!ready) {
            return;
          }
          return {
            setData(data) {
              newData = data;
            },
            updateData(diff) {
              newDiff = diff;
            }
          };
        }
      }
    };
    addToSource(map, 'source-id-a-1', data[0]);
    t.assert.equal(newData, undefined);
    t.assert.equal(newDiff, undefined);
    await new Promise(resolve => setTimeout(resolve, 1));
    ready = true;
    await new Promise(resolve => setTimeout(resolve, 101));
    t.assert.deepEqual(newData, {
      type: 'FeatureCollection',
      features: []
    });
    t.assert.deepEqual(newDiff, { add: [data[0]] });
  });

  await t.test('add second feature', async t => {
    let newData;
    let newDiff;
    const map = {
      _m: {
        getSource() {
          return {
            setData(data) {
              newData = data;
            },
            updateData(diff) {
              newDiff = diff;
            }
          };
        }
      }
    };
    addToSource(map, 'source-id-a-2', data[0]);
    addToSource(map, 'source-id-a-2', data[1]);
    await new Promise(resolve => setTimeout(resolve, 1));
    t.assert.deepEqual(newData, {
      type: 'FeatureCollection',
      features: []
    });
    t.assert.deepEqual(newDiff, { add: [data[0], data[1]] });
  });

  await t.test('add feature immediately after removing', async t => {
    let newDiff;
    const map = {
      _m: {
        getSource() {
          return {
            setData() {},
            updateData(diff) {
              newDiff = diff;
            }
          };
        }
      }
    };
    addToSource(map, 'source-id-a-3', data[0]);
    await new Promise(resolve => setTimeout(resolve, 1));
    removeFromSource(map, 'source-id-a-3', data[0].id);
    addToSource(map, 'source-id-a-3', data[0]);
    await new Promise(resolve => setTimeout(resolve, 1));
    t.assert.deepEqual(newDiff, {
      update: [
        {
          addOrUpdateProperties: [{ key: 'name', value: 'Feature 1' }],
          id: 1,
          newGeometry: {
            coordinates: [0, 0],
            type: 'Point'
          },
          removeAllProperties: true
        }
      ]
    });
  });
});

test('removeFromSource', async t => {
  await t.test('remove feature', async t => {
    let newDiff;
    const map = {
      _m: {
        getSource() {
          return {
            setData() {},
            updateData(diff) {
              newDiff = diff;
            }
          };
        }
      }
    };
    addToSource(map, 'source-id-r-1', data[0]);
    await new Promise(resolve => setTimeout(resolve, 1));
    removeFromSource(map, 'source-id-r-1', data[0].id);
    await new Promise(resolve => setTimeout(resolve, 1));
    t.assert.deepEqual(newDiff, { remove: [data[0].id] });
  });

  await t.test('remove feature immediately after adding', async t => {
    let newDiff;
    const map = {
      _m: {
        getSource() {
          return {
            setData() {},
            updateData(diff) {
              newDiff = diff;
            }
          };
        }
      }
    };
    addToSource(map, 'source-id-r-2', data[0]);
    removeFromSource(map, 'source-id-r-2', data[0].id);
    await new Promise(resolve => setTimeout(resolve, 1));
    t.assert.deepEqual(newDiff, {});
  });
});
