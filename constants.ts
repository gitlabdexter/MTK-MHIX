
import { AppData, ServerProtocol, SubscriptionType } from './types';

export const INITIAL_DATA: AppData = {
  users: [
    { id: 'user-1', name: 'John Doe', email: 'john@example.com', subscriptionId: 'sub-1', bandwidthUsage: 150, dataUsage: 50 },
    { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', subscriptionId: 'sub-1', bandwidthUsage: 250, dataUsage: 80 },
    { id: 'user-3', name: 'AI User', email: 'ai@example.com', subscriptionId: 'sub-2', bandwidthUsage: 500, dataUsage: 200 },
  ],
  servers: [
    { id: 'server-1', countryCode: 'US', countryName: 'United States', protocol: ServerProtocol.WIREGUARD, serverIp: '192.168.1.1', provideTo: 'Free', latitude: 38.9072, longitude: -77.0369 },
    { id: 'server-2', countryCode: 'DE', countryName: 'Germany', protocol: ServerProtocol.OPENVPN_TCP, serverIp: '10.8.0.1', provideTo: 'Premium', latitude: 52.5200, longitude: 13.4050 },
    { id: 'server-3', countryCode: 'JP', countryName: 'Japan', protocol: ServerProtocol.IPSEC_PSK, serverIp: '172.16.0.1', provideTo: 'Premium', remoteId: 'jp-remote', localId: 'jp-local', secretKey: 'supersecret', latitude: 35.6895, longitude: 139.6917 },
  ],
  subscriptions: [
    { id: 'sub-1', name: 'Free Tier', type: SubscriptionType.FREE },
    { id: 'sub-2', name: 'Premium Monthly', type: SubscriptionType.PREMIUM, price: 9.99, paymentApi: 'paypal-api-key-live' },
  ],
  settings: {
    adMobId: 'ca-app-pub-3940256099942544/6300978111',
    rewardId: 'ca-app-pub-3940256099942544/5224354917',
    androidLink: 'https://play.google.com',
    iosLink: 'https://www.apple.com/app-store/',
    desktopLink: '#',
    macOsLink: '#',
    logoUrl: '',
    bannerUrl: '',
  },
  faq: [
    { id: 'faq-1', question: 'How to connect?', answer: 'Simply tap the connect button on the main screen.' },
  ],
  feedback: [],
};
