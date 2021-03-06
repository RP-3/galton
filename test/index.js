/* eslint-disable import/no-extraneous-dependencies */

const path = require('path');
const test = require('tape');
const request = require('supertest-koa-agent');
const geojsonhint = require('@mapbox/geojsonhint');
const galton = require('../dist/bundle.js');

test('galton', (t) => {
  t.plan(2);

  const point = [52.517037, 13.388860];
  const osrmPath = path.join(__dirname, '../node_modules/osrm/test/data/berlin-latest.osrm');

  const app = galton.app({
    osrmPath,
    bufferSize: 1,
    cellSize: 0.1,
    sharedMemory: false,
    units: 'kilometers'
  });

  request(app)
    .get(`/?lng=${point[0]}&lat=${point[1]}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((error, res) => {
      t.error(error, 'No error');
      const errors = geojsonhint.hint(res.text);
      if (errors.length > 0) {
        t.comment(errors);
        t.fail('Invalid GeoJSON');
      } else {
        t.pass('Valid GeoJSON');
      }
      t.end();
    });
});
