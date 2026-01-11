import test from 'node:test';
import { addToSource } from '../../lib/feature/source.js';

test('addToSource', async t => {
  const data = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [0, 0]
    }
  };

  await t.test('map not ready', async t => {
    let ready = false;
    let newData;
    const map = {
      _m: {
        getSource() {
          if (!ready) {
            return;
          }
          return {
            setData(data) {
              newData = data;
            }
          };
        }
      }
    };
    addToSource(map, 'source-id', data);
    t.assert.equal(newData, undefined);
    await new Promise(resolve => setTimeout(resolve, 1));
    ready = true;
    await new Promise(resolve => setTimeout(resolve, 101));
    t.assert.deepEqual(newData, {
      type: 'FeatureCollection',
      features: [data]
    });
  });
});
