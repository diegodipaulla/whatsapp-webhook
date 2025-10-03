const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Define paths for the test database
const TEST_DB_FILE = 'test.db';
const PRISMA_DIR = path.join(__dirname, '..', 'prisma');
const TEST_DB_PATH = path.join(PRISMA_DIR, TEST_DB_FILE);
const TEST_DATABASE_URL = `file:${TEST_DB_PATH}`;

let db;

beforeAll(() => {
  // Ensure the test database file is clean before we start
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }

  // Set the environment variable for Prisma CLI
  const env = { ...process.env, DATABASE_URL: TEST_DATABASE_URL };

  // Run migrations to set up the test database schema
  execSync('npx prisma migrate deploy', { env, stdio: 'inherit' });
});

beforeEach(() => {
  // Reset modules before each test to ensure a fresh Prisma Client instance
  jest.resetModules();
  // Set the env var for the Prisma Client instance that will be created
  process.env.DATABASE_URL = TEST_DATABASE_URL;
  db = require('./dbService');
});

afterEach(async () => {
  // Disconnect after each test
  await db.prisma.$disconnect();
});

afterAll(() => {
  // Clean up the test database file after all tests are done
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
});

describe('Database Service (Multi-Account)', () => {

  test('should create a new account and find it', async () => {
    const wppId = '1111@c.us';
    const account = await db.findOrCreateAccount(wppId, 'Test Account 1');
    expect(account).toBeDefined();
    expect(account.wppId).toBe(wppId);

    const foundAccount = await db.prisma.whatsappAccount.findUnique({ where: { wppId } });
    expect(foundAccount).toBeDefined();
    expect(foundAccount.id).toBe(account.id);
  });

  test('should isolate settings between accounts', async () => {
    const accountA = await db.findOrCreateAccount('acc_A@c.us', 'Account A');
    const accountB = await db.findOrCreateAccount('acc_B@c.us', 'Account B');

    await db.updateSetting(accountA.id, 'webhookUrl', 'http://a.com');
    await db.updateSetting(accountB.id, 'webhookUrl', 'http://b.com');

    const urlA = await db.getSetting(accountA.id, 'webhookUrl');
    const urlB = await db.getSetting(accountB.id, 'webhookUrl');

    expect(urlA).toBe('http://a.com');
    expect(urlB).toBe('http://b.com');
  });

  test('should isolate messages between accounts', async () => {
    const accountC = await db.findOrCreateAccount('acc_C@c.us', 'Account C');
    const accountD = await db.findOrCreateAccount('acc_D@c.us', 'Account D');

    const mockMessage = (from, body) => ({
      from,
      body,
      timestamp: Math.floor(Date.now() / 1000),
      hasMedia: false,
      _data: { notifyName: 'Test Sender' },
      downloadMedia: () => Promise.resolve(null),
    });

    await db.logMessage(accountC.id, mockMessage('contact1@c.us', 'Message for C'));
    await db.logMessage(accountD.id, mockMessage('contact2@c.us', 'Message for D'));
    await db.logMessage(accountD.id, mockMessage('contact3@c.us', 'Another for D'));

    const messagesC = await db.getLatestMessages(accountC.id, 5);
    const messagesD = await db.getLatestMessages(accountD.id, 5);

    expect(messagesC.length).toBe(1);
    expect(messagesC[0].body).toBe('Message for C');

    expect(messagesD.length).toBe(2);
    const bodiesD = messagesD.map(m => m.body);
    expect(bodiesD).toContain('Message for D');
    expect(bodiesD).toContain('Another for D');
  });
});
