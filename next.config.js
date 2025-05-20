module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['dqevdpzo1zu4d.cloudfront.net'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb' // 필요에 따라 더 크게 설정 가능
    },
    serverComponentsExternalPackages: ['bull', 'ioredis', 'redis']
  },
  webpack: (config, { isServer }) => {
    // 서버 환경에서만 Bull 및 Redis 관련 모듈 로드
    if (isServer) {
      return config;
    }

    // 클라이언트 번들에서 서버 전용 패키지 제외
    config.resolve.alias = {
      ...config.resolve.alias,
      'bull': false,
      'ioredis': false,
      'redis': false,
    };

    return config;
  }
};