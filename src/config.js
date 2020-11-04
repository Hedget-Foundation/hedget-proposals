module.exports = {
  blockchain: {
    nodeApiUrl: 'http://35.205.218.13:7740',
    rid: '57862189D255A82ED1DCCD925BD9F02DE8CFD32CF94D43022D68ED839FB91E01',
    explorerBaseUrl: 'https://explorer-testnet.chromia.com/',
  },
  eth: {
    hgetContractAddress: '0x7968bc6a03017ea2de509aaa816f163db0f35148',
    stakerContractAddress: '0xac9f425b4255ac392987af4447478f06bed3b786',
  },
  authServer: {
    url: 'http://35.205.218.13:8080',
  },
  matomo: {
    enabled: false,
    url: 'https://matomo.chromia.dev/',
    siteId: 3,
    trackErrors: true,
    jsFileName: 'js/',
    phpFilename: 'js/',
  },
  features: {},
  test: true,
};
