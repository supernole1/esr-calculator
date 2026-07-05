#!/usr/bin/env node
'use strict';

const fs = require('fs');
const https = require('https');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'data', 'courses.json');
const INDEX_PATH = path.join(ROOT, 'index.html');
const START_MARKER = '  // COURSE_DATA_START';
const END_MARKER = '  // COURSE_DATA_END';
const NCRDB = 'https://ncrdb.usga.org';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith('--')) {
      args._.push(item);
      continue;
    }
    const key = item.slice(2);
    if (['push', 'help'].includes(key)) {
      args[key] = true;
    } else {
      args[key] = argv[i + 1];
      i += 1;
    }
  }
  return args;
}

function usage() {
  console.log([
    'Usage:',
    '  npm run sync:courses',
    '  npm run refresh:rocky',
    '  node scripts/update-courses.js --course-id 14208',
    '  node scripts/update-courses.js --from-json path/to/course.json',
    '  node scripts/update-courses.js --push',
    '',
    'Notes:',
    '  --course-id fetches NCRDB tee data when USGA allows automated access.',
    '  --push commits and pushes only course data workflow files.'
  ].join('\n'));
}

function readData() {
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_PATH, `${JSON.stringify(data, null, 2)}\n`);
}

function cleanText(value) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseNumber(value) {
  const parsed = Number(String(value).replace(/,/g, '').match(/-?\d+(\.\d+)?/)?.[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseTeeHtml(html) {
  const tableMatch = html.match(/<table[^>]+id=["']gvCourses["'][\s\S]*?<\/table>/i);
  const tableHtml = tableMatch ? tableMatch[0] : html;
  const rowMatches = tableHtml.match(/<tr[\s\S]*?<\/tr>/gi) || [];
  if (rowMatches.length < 2) return [];

  const headerCells = (rowMatches[0].match(/<t[hd][\s\S]*?<\/t[hd]>/gi) || []).map(cleanText);
  const colMap = {};
  headerCells.forEach((text, index) => {
    const lower = text.toLowerCase();
    if (/tee\s*name/.test(lower) || (index === 0 && /tee/.test(lower))) colMap.name = index;
    else if (/gender/.test(lower)) colMap.gender = index;
    else if (/^par$/.test(lower)) colMap.par = index;
    else if (/course\s*rating/.test(lower)) colMap.cr = index;
    else if (/slope\s*rating/.test(lower)) colMap.slope = index;
    else if (/^length$|yards?/.test(lower)) colMap.length = index;
  });

  if (colMap.name == null) colMap.name = 0;
  if (colMap.gender == null) colMap.gender = 1;
  if (colMap.par == null) colMap.par = 2;
  if (colMap.cr == null) colMap.cr = 3;
  if (colMap.slope == null) colMap.slope = 5;
  if (colMap.length == null) colMap.length = 15;

  const tees = [];
  rowMatches.slice(1).forEach((rowHtml) => {
    const cells = (rowHtml.match(/<td[\s\S]*?<\/td>/gi) || []).map(cleanText);
    if (cells.length < 6) return;

    const name = cells[colMap.name] || '';
    const gender = (cells[colMap.gender] || '').toUpperCase();
    const par = parseNumber(cells[colMap.par]);
    const cr = parseNumber(cells[colMap.cr]);
    const slope = parseNumber(cells[colMap.slope]);
    const yards = parseNumber(cells[colMap.length]);
    if (!name || par == null || cr == null || slope == null) return;

    tees.push({
      name,
      gender: gender || null,
      par,
      cr,
      slope,
      yards
    });
  });

  return tees;
}

function extractCourseHeader(html, fallbackName, fallbackLocation) {
  const nameMatch = html.match(/<td[^>]*class=["'][^"']*tableCellWidth[^"']*["'][^>]*>([\s\S]*?)<\/td>/i);
  const name = nameMatch ? cleanText(nameMatch[1]) : fallbackName;
  return { name: name || fallbackName, location: fallbackLocation || '' };
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': UA } }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.setTimeout(30000, () => req.destroy(new Error('Request timed out')));
    req.on('error', reject);
  });
}

async function fetchCourse(courseId, existingCourse, overrides) {
  const res = await httpsGet(`${NCRDB}/courseTeeInfo?CourseID=${encodeURIComponent(courseId)}`);
  if (res.status !== 200) {
    throw new Error(`NCRDB returned HTTP ${res.status}. USGA/Akamai may be blocking automated access; update data/courses.json manually, then run npm run sync:courses.`);
  }

  const tees = parseTeeHtml(res.body);
  if (!tees.length) throw new Error('No tee rows found in NCRDB response.');

  const header = extractCourseHeader(
    res.body,
    overrides.name || existingCourse?.name || `Course ${courseId}`,
    overrides.location || existingCourse?.location || ''
  );
  const defaultTee = overrides.defaultTee != null
    ? Number(overrides.defaultTee)
    : findDefaultTee(tees, existingCourse?.defaultTee);

  return {
    name: overrides.name || header.name,
    location: overrides.location || header.location,
    defaultTee,
    tees,
    updatedAt: new Date().toISOString()
  };
}

function findDefaultTee(tees, fallback) {
  if (Number.isInteger(fallback) && tees[fallback]) return fallback;
  const blue = tees.findIndex((tee) => /^blue$/i.test(tee.name) && tee.gender === 'M');
  if (blue >= 0) return blue;
  const anyBlue = tees.findIndex((tee) => /^blue$/i.test(tee.name));
  return anyBlue >= 0 ? anyBlue : 0;
}

function mergeJsonCourse(data, filePath) {
  const incoming = JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
  if (incoming.courses) {
    Object.assign(data.courses, incoming.courses);
    return;
  }

  const key = incoming.key || (incoming.courseId ? `usga-${incoming.courseId}` : null);
  if (!key) throw new Error('JSON import needs either "courses", "key", or "courseId".');
  data.courses[key] = normalizeCourse(incoming);
}

function normalizeCourse(course) {
  return {
    name: course.name || 'Imported Course',
    location: course.location || '',
    defaultTee: Number.isInteger(course.defaultTee) ? course.defaultTee : 0,
    tees: (course.tees || []).map((tee) => ({
      name: String(tee.name || '').trim(),
      gender: tee.gender || null,
      par: Number(tee.par),
      cr: Number(tee.cr),
      slope: Number(tee.slope),
      yards: tee.yards == null ? null : Number(tee.yards)
    })).filter((tee) => tee.name && Number.isFinite(tee.par) && Number.isFinite(tee.cr) && Number.isFinite(tee.slope)),
    updatedAt: course.updatedAt || new Date().toISOString()
  };
}

function injectIndex(data) {
  const courses = data.courses || {};
  const generated = [
    START_MARKER,
    '  var BUILTIN_COURSES = ' + JSON.stringify(courses, null, 2).replace(/\n/g, '\n  ') + ';',
    END_MARKER
  ].join('\n');

  const html = fs.readFileSync(INDEX_PATH, 'utf8');
  if (!html.includes(START_MARKER) || !html.includes(END_MARKER)) {
    throw new Error('index.html is missing course data markers.');
  }

  const before = html.slice(0, html.indexOf(START_MARKER));
  const after = html.slice(html.indexOf(END_MARKER) + END_MARKER.length);
  fs.writeFileSync(INDEX_PATH, before + generated + after);
}

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function publish() {
  const files = ['index.html', 'data/courses.json', 'package.json', 'scripts/update-courses.js', 'scripts/serve-local.js', 'COURSE_UPDATES.md'];
  git(['add', ...files]);
  const staged = git(['diff', '--cached', '--name-only']);
  if (!staged) {
    console.log('No course workflow changes to commit.');
    return false;
  }
  git(['commit', '-m', 'Update course data workflow']);
  const branch = git(['branch', '--show-current']) || 'master';
  git(['push', 'origin', branch]);
  console.log(`Pushed course workflow changes to origin/${branch}.`);
  return true;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const data = readData();
  data.courses = data.courses || {};

  if (args['from-json']) {
    mergeJsonCourse(data, args['from-json']);
    writeData(data);
  }

  if (args['course-id']) {
    const key = `usga-${args['course-id']}`;
    data.courses[key] = await fetchCourse(args['course-id'], data.courses[key], {
      name: args.name,
      location: args.location,
      defaultTee: args['default-tee']
    });
    writeData(data);
  }

  injectIndex(data);
  console.log(`Synced ${Object.keys(data.courses).length} course(s) into index.html.`);

  if (args.push) publish();
}

main().catch((err) => {
  const detail = err.message || err.code || String(err);
  console.error(detail);
  process.exit(1);
});
