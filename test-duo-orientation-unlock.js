'use strict';
// iPhone Duo support, part 1: the installed app must be allowed to rotate.
//
// manifest.json used to declare "orientation": "portrait-primary". On a slab
// phone that only ever forbade landscape. On the iPhone Duo it is actively
// wrong: the unfolded inner display is wider than it is tall (~890x626pt in
// its natural, hinge-vertical hold), so a portrait lock would force someone
// to hold the open device sideways — hinge horizontal — to use the app at
// all. A home-screen web app has no way to lock "portrait on the cover
// screen, landscape when open", so the only correct value is "any" and the
// layout adapts to whatever width it gets (see the open-posture layout).
//
// Like test-icon-manifest-paths.js this validates the real on-disk file —
// there is no index.html function involved.
const fs = require('fs');
const path = require('path');
const { makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-duo-orientation-unlock.js');
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf8'));

test('manifest.json declares orientation exactly once (sabotage anchor: a duplicate key would silently win)', (assert)=>{
  const raw = fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf8');
  assert.equal((raw.match(/"orientation"\s*:/g) || []).length, 1);
});

test('orientation is not locked to portrait — the unfolded Duo is landscape-shaped', (assert)=>{
  assert.ok(!/^portrait/.test(manifest.orientation || ''), `orientation "${manifest.orientation}" locks portrait`);
  assert.ok(!/^landscape/.test(manifest.orientation || ''), `orientation "${manifest.orientation}" would lock out the folded cover screen instead`);
  assert.equal(manifest.orientation, 'any');
});

run();
