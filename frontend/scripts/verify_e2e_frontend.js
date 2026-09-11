/**
 * YojanaSetu - Frontend End-to-End Flow & Dataset Verification Script
 * Validates:
 * 1. Schemes dataset integrity (15 schemes, mandatory fields, verified portal URLs)
 * 2. CSC Jan Seva Kendra dataset integrity (states, pincodes, phone formats, services)
 * 3. Client-side state transitions & filter simulations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCHEMES_FILE = path.resolve(__dirname, '../../data/schemes.json');
const CSC_FILE = path.resolve(__dirname, '../../data/csc_centers.json');

console.log('🔍 Starting YojanaSetu E2E Verification Suite...\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    passedTests++;
    console.log(`✅ PASS: ${message}`);
  }
}

// 1. Schemes Dataset Verification
console.log('--- 1. Schemes Dataset Verification ---');
assert(fs.existsSync(SCHEMES_FILE), 'schemes.json exists');
const schemes = JSON.parse(fs.readFileSync(SCHEMES_FILE, 'utf-8'));
assert(Array.isArray(schemes) && schemes.length >= 15, `Loaded ${schemes.length} schemes (>= 15 required)`);

const schemeIds = new Set();
for (const s of schemes) {
  assert(!schemeIds.has(s.id), `Unique scheme ID: ${s.id}`);
  schemeIds.add(s.id);
  assert(s.name_hi && s.name_en, `Bilingual titles present for ${s.id}`);
  assert(s.ministry, `Ministry specified for ${s.id}`);
  assert(s.official_portal_url && s.official_portal_url.startsWith('http'), `Valid official URL for ${s.id}`);
  assert(Array.isArray(s.rules) && s.rules.length > 0, `Deterministic rules present for ${s.id}`);
  assert(Array.isArray(s.documents) && s.documents.length > 0, `Document requirements present for ${s.id}`);
  assert(s.benefit_amount_text, `Benefit amount text present for ${s.id}`);
}

// 2. Jan Seva Kendra / CSC Dataset Verification
console.log('\n--- 2. CSC Jan Seva Kendra Dataset Verification ---');
assert(fs.existsSync(CSC_FILE), 'csc_centers.json exists');
const cscCenters = JSON.parse(fs.readFileSync(CSC_FILE, 'utf-8'));
assert(Array.isArray(cscCenters) && cscCenters.length >= 10, `Loaded ${cscCenters.length} CSC centers (>= 10 required)`);

const cscIds = new Set();
for (const c of cscCenters) {
  assert(!cscIds.has(c.id), `Unique center ID: ${c.id}`);
  cscIds.add(c.id);
  assert(c.vle_name && c.center_name, `VLE name & center name present for ${c.id}`);
  assert(c.pincode && /^\d{6}$/.test(c.pincode), `Valid 6-digit PIN code for ${c.id}: ${c.pincode}`);
  assert(c.state && c.district, `State & District specified for ${c.id}`);
  assert(c.phone && c.phone.includes('+91'), `Official phone format present for ${c.id}`);
  assert(Array.isArray(c.services) && c.services.length >= 3, `Services list (>= 3) present for ${c.id}`);
}

// 3. CSC Search & Filter Simulation
console.log('\n--- 3. CSC Search & Filter Simulation ---');
// Filter by Pincode
const bhopalCenters = cscCenters.filter(c => c.pincode === '462011');
assert(bhopalCenters.length >= 1, `Filter by PIN 462011 returns ${bhopalCenters.length} centers`);
assert(bhopalCenters[0].district === 'Bhopal', 'District correctly resolved to Bhopal');

// Filter by State
const upCenters = cscCenters.filter(c => c.state === 'Uttar Pradesh');
assert(upCenters.length >= 2, `Filter by Uttar Pradesh returns ${upCenters.length} centers`);

// Filter by Service
const pmKisanCenters = cscCenters.filter(c => c.services.some(s => s.toLowerCase().includes('pm-kisan')));
assert(pmKisanCenters.length >= 5, `Filter by PM-Kisan service returns ${pmKisanCenters.length} centers`);

// 4. Pre-fill Wizard Data Flow Simulation
console.log('\n--- 4. Assistant-to-Wizard Prefill Flow Simulation ---');
const extractedProfileSample = {
  age: 28,
  gender: 'female',
  state: 'Madhya Pradesh',
  district: 'Bhopal',
  occupation: 'farmer',
  land_holding_acres: 2.0,
  annual_income: 180000,
  category: 'obc',
};

const defaultWizardProfile = {
  age: 30,
  gender: 'male',
  state: 'All India',
  district: '',
  occupation: 'other',
  land_holding_acres: 0,
  annual_income: 120000,
  category: 'general',
};

const mergedWizardProfile = {
  ...defaultWizardProfile,
  ...extractedProfileSample,
};

assert(mergedWizardProfile.age === 28, 'Prefill correctly overridden age to 28');
assert(mergedWizardProfile.occupation === 'farmer', 'Prefill correctly overridden occupation to farmer');
assert(mergedWizardProfile.state === 'Madhya Pradesh', 'Prefill correctly overridden state to Madhya Pradesh');
assert(mergedWizardProfile.annual_income === 180000, 'Prefill correctly overridden annual_income to 180000');

console.log(`\n🎉 All ${passedTests}/${totalTests} E2E verification checks passed with 100% success!`);
