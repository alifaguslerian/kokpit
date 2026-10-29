/* global fetch, AbortSignal, TextEncoder, ReadableStream, FormData, Blob */
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { createServer } from 'node:net';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import path from 'node:path';
import process from 'node:process';
import { setTimeout } from 'node:timers/promises';
import { Buffer } from 'node:buffer';

test(
  'native Workers/D1/R2 private materials, Ideas covers and 50 MB boundary',
  { timeout: 180000 },
  async () => {
    const workspace = process.cwd();
    const persistence = path.resolve(workspace, '.wrangler', `materials-runtime-${randomUUID()}`);
    assert.ok(persistence.startsWith(path.resolve(workspace, '.wrangler') + path.sep));
    const cli = path.resolve(workspace, 'node_modules/wrangler/bin/wrangler.js');
    const env = { ...process.env, CI: 'true', WRANGLER_SEND_METRICS: 'false' };
    const command = (args) =>
      execFileSync(process.execPath, [cli, ...args], {
        cwd: workspace,
        env,
        windowsHide: true,
        timeout: 60000,
        stdio: 'pipe',
      });
    command(['d1', 'migrations', 'apply', 'kokpit-db', '--local', '--persist-to', persistence]);
    command([
      'd1',
      'execute',
      'kokpit-db',
      '--local',
      '--persist-to',
      persistence,
      '--file',
      'drizzle/seed.sql',
    ]);
    const reserve = createServer();
    reserve.listen(0, '127.0.0.1');
    await once(reserve, 'listening');
    const port = reserve.address().port;
    await new Promise((resolve, reject) =>
      reserve.close((error) => (error ? reject(error) : resolve())),
    );
    const base = `http://127.0.0.1:${port}`;
    const child = spawn(
      process.execPath,
      [
        cli,
        'dev',
        '--local',
        '--port',
        String(port),
        '--inspector-port',
        '0',
        '--persist-to',
        persistence,
        '--show-interactive-dev-session=false',
      ],
      {
        cwd: workspace,
        env,
        windowsHide: true,
        detached: process.platform !== 'win32',
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );
    let output = '';
    const capture = (chunk) => {
      output = (output + chunk).slice(-12000);
    };
    child.stdout.on('data', capture);
    child.stderr.on('data', capture);
    // Miniflare can reset a reused connection after rejecting an unread upload body.
    const request = (route, init = {}) =>
      fetch(base + route, {
        ...init,
        headers: { Connection: 'close', ...init.headers },
        signal: AbortSignal.timeout(60000),
      });
    try {
      let ready = false;
      for (let attempt = 0; attempt < 120; attempt++) {
        if (child.exitCode !== null) throw new Error(`Worker exited: ${output}`);
        try {
          const response = await fetch(base + '/api/system/health', {
            signal: AbortSignal.timeout(500),
          });
          if (response.ok) {
            await response.text();
            ready = true;
            break;
          }
        } catch {
          /* Wait for the isolated local runtime to listen. */
        }
        await setTimeout(250);
      }
      assert.ok(ready, output);
      assert.match(output, /R2 Bucket/);
      const postJson = async (route, body) => {
        const response = await request(route, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const text = await response.text();
        assert.equal(response.status, 201, text);
        return JSON.parse(text).data;
      };
      const collection = await postJson('/api/idea-collections', { name: 'Isolated cover test' });
      const otherCollection = await postJson('/api/idea-collections', {
        name: 'Isolated reorder test',
      });
      const collectionOrder = await request('/api/idea-collections/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [otherCollection.id, collection.id] }),
      });
      assert.equal(collectionOrder.status, 200, await collectionOrder.text());
      const listedCollections = await request('/api/idea-collections?limit=1');
      const collectionPage = await listedCollections.json();
      assert.equal(collectionPage.data[0].id, otherCollection.id);
      assert.equal(collectionPage.nextOffset, 1);
      const thought = await postJson('/api/ideas', {
        content: 'Runtime private cover',
        isFavorite: true,
        collectionId: collection.id,
      });
      const png = Uint8Array.from(
        Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
          'base64',
        ),
      );
      const form = new FormData();
      form.set('file', new Blob([png], { type: 'image/png' }), 'cover.png');
      const cover = await request(`/api/ideas/${thought.id}/cover`, { method: 'PUT', body: form });
      const coverText = await cover.text();
      assert.equal(cover.status, 200, coverText);
      const coverUrl = JSON.parse(coverText).data.coverUrl;
      const image = await request(coverUrl);
      assert.equal(image.status, 200, await image.clone().text());
      assert.equal(image.headers.get('Cache-Control'), 'private, no-store');
      assert.deepEqual(new Uint8Array(await image.arrayBuffer()), png);
      const coverLength = 50 * 1024 * 1024;
      const largePng = new Uint8Array(coverLength);
      const chunkOffset = png.length - 12;
      largePng.set(png.subarray(0, chunkOffset));
      const paddingLength = coverLength - png.length - 12;
      const view = new DataView(largePng.buffer);
      view.setUint32(chunkOffset, paddingLength);
      largePng.set(new TextEncoder().encode('npAD'), chunkOffset + 4);
      const crcTable = Uint32Array.from({ length: 256 }, (_, value) => {
        let crc = value;
        for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
        return crc >>> 0;
      });
      let crc = 0xffffffff;
      for (let offset = chunkOffset + 4; offset < chunkOffset + paddingLength + 8; offset++)
        crc = (crc >>> 8) ^ crcTable[(crc ^ largePng[offset]) & 255];
      view.setUint32(chunkOffset + paddingLength + 8, (crc ^ 0xffffffff) >>> 0);
      largePng.set(png.subarray(chunkOffset), coverLength - 12);
      const largeCoverForm = new FormData();
      largeCoverForm.set('file', new Blob([largePng], { type: 'image/png' }), 'boundary-cover.png');
      const largeCover = await request(`/api/ideas/${thought.id}/cover`, {
        method: 'PUT',
        body: largeCoverForm,
      });
      const largeCoverText = await largeCover.text();
      assert.equal(largeCover.status, 200, largeCoverText);
      const coverHead = await request(JSON.parse(largeCoverText).data.coverUrl, { method: 'HEAD' });
      assert.equal(coverHead.status, 200);
      assert.equal(coverHead.headers.get('Content-Length'), String(coverLength));
      const clearCollection = await request(`/api/idea-collections/${collection.id}`, {
        method: 'DELETE',
      });
      assert.equal(clearCollection.status, 200, await clearCollection.text());
      const retained = await request(`/api/ideas/${thought.id}`);
      const retainedThought = (await retained.json()).data;
      assert.equal(retainedThought.collectionId, null);
      assert.equal(retainedThought.isFavorite, true);
      const deleteThought = await request(`/api/ideas/${thought.id}`, { method: 'DELETE' });
      assert.equal(deleteThought.status, 200, await deleteThought.text());
      assert.equal((await request(coverUrl)).status, 404);
      const create = async (route, body) => {
        const response = await request('/api/college' + route, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const text = await response.text();
        assert.equal(response.status, 201, text);
        return JSON.parse(text).data;
      };
      const semester = await create('/semesters', { name: 'Isolated runtime semester' });
      const course = await create(`/semesters/${semester.id}/courses`, {
        name: 'Runtime course',
        description: 'Native schedule and material verification.',
      });
      assert.equal(course.description, 'Native schedule and material verification.');
      const classInput = { weekday: 6, startMinute: 1430, endMinute: 1440, room: 'Native room' };
      const classEntry = await create(`/courses/${course.id}/schedule`, classInput);
      const duplicateClass = await request(`/api/college/courses/${course.id}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classInput),
      });
      assert.equal(duplicateClass.status, 409, await duplicateClass.text());
      const changedClass = await request(`/api/college/schedule/${classEntry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekday: 7, room: null }),
      });
      assert.equal(changedClass.status, 200, await changedClass.text());
      const scheduleResponse = await request(`/api/college/semesters/${semester.id}/schedule`);
      const schedule = await scheduleResponse.json();
      assert.equal(scheduleResponse.status, 200);
      assert.equal(schedule.data[0].weekday, 7);
      assert.equal(schedule.data[0].endMinute, 1440);
      assert.equal(schedule.week.days.length, 7);
      assert.equal(schedule.timezone, 'Asia/Jakarta');
      const week = await create(`/courses/${course.id}/weeks`, { weekNumber: 1 });
      const upload = (filename, body, size, type = 'application/pdf') =>
        request(
          `/api/college/weeks/${week.id}/materials/upload?filename=${encodeURIComponent(filename)}&sizeBytes=${size}`,
          {
            method: 'POST',
            headers: { 'Content-Type': type, Origin: base },
            body,
            duplex: 'half',
          },
        );
      const pdf = new TextEncoder().encode('%PDF-1.7\nNative streaming test.\n%%EOF');
      const stored = await upload('native.pdf', pdf, pdf.length);
      const result = await stored.json();
      assert.equal(stored.status, 201, JSON.stringify(result));
      const file = result.data;
      assert.equal('r2Key' in file, false);
      const full = await request(file.fileUrl);
      assert.equal(full.status, 200);
      assert.equal(full.headers.get('Cache-Control'), 'private, no-store');
      assert.deepEqual(new Uint8Array(await full.arrayBuffer()), pdf);
      const range = await request(file.fileUrl, { headers: { Range: 'bytes=2-5' } });
      assert.equal(range.status, 206);
      assert.deepEqual(new Uint8Array(await range.arrayBuffer()), pdf.slice(2, 6));
      const head = await request(file.fileUrl, { method: 'HEAD' });
      assert.equal(head.status, 200);
      assert.equal(head.headers.get('Content-Length'), String(pdf.length));
      const shortBody = new ReadableStream({
        start(controller) {
          controller.enqueue(pdf);
          controller.close();
        },
      });
      const mismatch = await upload('short.pdf', shortBody, pdf.length + 1);
      assert.equal(mismatch.status, 400, await mismatch.text());
      const link = await create(`/weeks/${week.id}/materials`, {
        title: 'Native link',
        externalUrl: 'https://example.com/reading',
      });
      assert.equal((await request(`/api/files/${link.id}`)).status, 404);
      const probe = await create(`/weeks/${week.id}/materials`, {
        title: 'Delete probe',
        externalUrl: 'https://example.com',
      });
      const probeDeleted = await request(`/api/college/materials/${probe.id}`, {
        method: 'DELETE',
      });
      assert.equal(probeDeleted.status, 200, await probeDeleted.text());
      const first = await request(`/api/college/semesters/${semester.id}/materials?limit=1`);
      const page = await first.json();
      assert.equal(page.data[0].courseName, 'Runtime course');
      assert.ok(page.nextCursor);
      const second = await request(
        `/api/college/semesters/${semester.id}/materials?limit=1&cursor=${encodeURIComponent(page.nextCursor)}`,
      );
      assert.equal((await second.json()).data.length, 1);
      const length = 50 * 1024 * 1024;
      let remaining = length;
      const chunk = new Uint8Array(64 * 1024).fill(65);
      const body = new ReadableStream({
        pull(controller) {
          if (!remaining) {
            controller.close();
            return;
          }
          const size = Math.min(remaining, chunk.length);
          controller.enqueue(chunk.subarray(0, size));
          remaining -= size;
        },
      });
      const large = await upload('boundary.txt', body, length, 'text/plain');
      const largeResult = await large.json();
      assert.equal(large.status, 201, JSON.stringify(largeResult));
      assert.equal(largeResult.data.sizeBytes, length);
      const tail = await request(largeResult.data.fileUrl, { headers: { Range: 'bytes=-8' } });
      assert.equal(tail.status, 206);
      assert.equal(await tail.text(), 'AAAAAAAA');
      const over = await upload('oversized.txt', new Uint8Array([65]), length + 1, 'text/plain');
      assert.equal(over.status, 413, await over.text());
      const removed = await request(`/api/college/materials/${file.id}`, { method: 'DELETE' });
      assert.equal(removed.status, 200, await removed.text());
      assert.equal((await request(file.fileUrl)).status, 404);
      const hierarchyRemoved = await request(`/api/college/courses/${course.id}`, {
        method: 'DELETE',
      });
      assert.equal(hierarchyRemoved.status, 200, await hierarchyRemoved.text());
      assert.equal((await request(largeResult.data.fileUrl)).status, 404);
      assert.equal((await request(`/api/college/materials/${link.id}`)).status, 404);
      const remainingSchedule = await request(`/api/college/semesters/${semester.id}/schedule`);
      assert.deepEqual((await remainingSchedule.json()).data, []);
      const afterRejectedUpload = await request('/api/system/health');
      assert.equal(afterRejectedUpload.status, 200, await afterRejectedUpload.text());
    } catch (error) {
      process.stderr.write(`\nIsolated runtime diagnostics:\n${output}\n`);
      throw error;
    } finally {
      if (process.platform === 'win32' && child.pid) {
        try {
          execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
            windowsHide: true,
            stdio: 'pipe',
          });
        } catch {
          child.kill();
        }
      } else if (child.pid) {
        try {
          process.kill(-child.pid, 'SIGTERM');
        } catch {
          child.kill();
        }
      }
    }
  },
);
