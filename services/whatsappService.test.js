const { Client } = require('whatsapp-web.js');
const axios = require('axios');
const db = require('./dbService');

// Mock the dependencies
jest.mock('whatsapp-web.js');
jest.mock('axios');
jest.mock('./dbService');

// Import the service to be tested *after* mocking
const whatsappService = require('./whatsappService');

describe('WhatsApp Service', () => {
  let mockClient;
  const mockClientInfo = { wid: { _serialized: '12345@c.us' }, pushname: 'Test User' };

  beforeEach(() => {
    // Reset the service's internal state and all mocks before each test
    whatsappService._resetState();
    jest.clearAllMocks();

    // Mock the Client constructor and its methods
    mockClient = {
      on: jest.fn(),
      initialize: jest.fn().mockResolvedValue(),
      logout: jest.fn().mockResolvedValue(),
      destroy: jest.fn().mockResolvedValue(),
      sendMessage: jest.fn().mockResolvedValue(),
      info: mockClientInfo,
    };
    Client.mockImplementation(() => mockClient);

    // Mock db functions
    db.findOrCreateAccount.mockResolvedValue({ id: 'test-account-id', ...mockClientInfo });
    db.getSetting.mockResolvedValue('http://fake.webhook.url');
  });

  afterEach(async () => {
    // Ensure the session is cleaned up after each test to prevent open handles
    await whatsappService.logoutSession();
  });

  test('startSession should initialize a client and set up handlers', async () => {
    await whatsappService.startSession();
    expect(Client).toHaveBeenCalledTimes(1);
    expect(mockClient.initialize).toHaveBeenCalledTimes(1);
    expect(mockClient.on).toHaveBeenCalledWith('qr', expect.any(Function));
    expect(mockClient.on).toHaveBeenCalledWith('ready', expect.any(Function));
    expect(mockClient.on).toHaveBeenCalledWith('disconnected', expect.any(Function));
  });

  test('should update status on QR code event', async () => {
    await whatsappService.startSession();
    const qrCallback = mockClient.on.mock.calls.find(call => call[0] === 'qr')[1];
    qrCallback('test_qr_code');
    const status = whatsappService.getStatus();
    expect(status.qrCode).toBe('test_qr_code');
  });

  test('should update status on ready event', async () => {
    await whatsappService.startSession();
    const readyCallback = mockClient.on.mock.calls.find(call => call[0] === 'ready')[1];
    await readyCallback();
    expect(db.findOrCreateAccount).toHaveBeenCalledWith('12345@c.us', 'Test User');
    expect(whatsappService.getActiveAccountId()).toBe('test-account-id');
    expect(whatsappService.getStatus().connected).toBe(true);
  });

  test('should reset state on disconnected event', async () => {
    // Get client into a ready state
    await whatsappService.startSession();
    const readyCallback = mockClient.on.mock.calls.find(call => call[0] === 'ready')[1];
    await readyCallback();
    expect(whatsappService.getStatus().connected).toBe(true);

    // Simulate the 'disconnected' event
    const disconnectedCallback = mockClient.on.mock.calls.find(call => call[0] === 'disconnected')[1];
    await disconnectedCallback('LOGOUT');

    const status = whatsappService.getStatus();
    expect(status.connected).toBe(false);
    expect(status.message).toContain('Desconectado');
    expect(whatsappService.getActiveAccountId()).toBeNull();
    // Crucially, logout/destroy should NOT be called from this event handler
    expect(mockClient.logout).not.toHaveBeenCalled();
    expect(mockClient.destroy).not.toHaveBeenCalled();
  });

  test('should log message and call webhook on message event', async () => {
    await whatsappService.startSession();
    const readyCallback = mockClient.on.mock.calls.find(call => call[0] === 'ready')[1];
    await readyCallback();
    const messageCallback = mockClient.on.mock.calls.find(call => call[0] === 'message')[1];
    const mockMessage = { from: 'sender@c.us', body: 'Hello', timestamp: 123, hasMedia: false, _data: {} };
    await messageCallback(mockMessage);
    // The third argument is `downloadedMedia`, which is null when hasMedia is false
    expect(db.logMessage).toHaveBeenCalledWith('test-account-id', mockMessage, null);
    expect(axios.post).toHaveBeenCalledWith('http://fake.webhook.url', expect.any(Object));
  });

  test('should download media, log, and call webhook on message with media', async () => {
    await whatsappService.startSession();
    const readyCallback = mockClient.on.mock.calls.find(call => call[0] === 'ready')[1];
    await readyCallback();

    const messageCallback = mockClient.on.mock.calls.find(call => call[0] === 'message')[1];

    const mockMedia = {
      mimetype: 'image/jpeg',
      filename: 'test.jpg',
      data: 'base64-encoded-data',
    };

    const mockMessageWithMedia = {
      from: 'sender@c.us',
      body: 'A nice picture',
      timestamp: 456,
      hasMedia: true,
      _data: {},
      downloadMedia: jest.fn().mockResolvedValue(mockMedia),
    };

    await messageCallback(mockMessageWithMedia);

    // Check that media was downloaded
    expect(mockMessageWithMedia.downloadMedia).toHaveBeenCalledTimes(1);

    // Check that the message was logged with the media
    expect(db.logMessage).toHaveBeenCalledWith('test-account-id', mockMessageWithMedia, mockMedia);

    // Check that the webhook was called with the correct payload
    const expectedPayload = {
      chatId: mockMessageWithMedia.from,
      timestamp: mockMessageWithMedia.timestamp,
      body: mockMessageWithMedia.body,
      hasMedia: true,
      media: mockMedia,
    };
    expect(axios.post).toHaveBeenCalledWith('http://fake.webhook.url', expectedPayload);
  });

  test('should queue webhook if axios post fails', async () => {
    axios.post.mockRejectedValue(new Error('Network Error'));
    await whatsappService.startSession();
    const readyCallback = mockClient.on.mock.calls.find(call => call[0] === 'ready')[1];
    await readyCallback();
    const messageCallback = mockClient.on.mock.calls.find(call => call[0] === 'message')[1];
    const mockMessage = { from: 'sender@c.us', body: 'Hello again' };
    await messageCallback(mockMessage);
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(db.createQueuedWebhook).toHaveBeenCalledWith('test-account-id', expect.any(Object));
  });

  test('logoutSession should call client methods and then reset state', async () => {
    await whatsappService.startSession();
    const readyCallback = mockClient.on.mock.calls.find(call => call[0] === 'ready')[1];
    await readyCallback();

    await whatsappService.logoutSession();

    expect(mockClient.logout).toHaveBeenCalledTimes(1);
    expect(mockClient.destroy).toHaveBeenCalledTimes(1);
    // The disconnected event will fire, which resets the state. We can test the end state.
    const status = whatsappService.getStatus();
    expect(status.connected).toBe(false);
    expect(whatsappService.getActiveAccountId()).toBeNull();
  });
});