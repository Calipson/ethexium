"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getNetworkId(network) {
    switch (network) {
        case 'mainnet':
            return 1;
        case 'kovan':
            return 42;
        case 'ropsten':
            return 3;
        case 'rinkeby':
            return 4;
        case 'ganache':
        case 'custom':
            return 50;
    }
}
function getChainId(network) {
    switch (network) {
        case 'mainnet':
        case 'kovan':
        case 'rinkeby':
        case 'ropsten':
            return getNetworkId(network);
        case 'ganache':
        case 'custom':
            return 1337;
    }
}
exports.buildDockerComposeYml = function (options) {
    var basePath = options.tokenType === 'ERC20' ? '/trade' : '/gameexchange';
    var theme = options.theme === 'light' ? 'LIGHT_THEME' : 'DARK_THEME';
    var isGanache = options.network === 'ganache';
    var collectiblesSource = isGanache ? 'mocked' : 'opensea';
    var networkId = getNetworkId(options.network);
    var chainId = getChainId(options.network);
    var ganacheService = "\n  ganache:\n    image: 0xorg/ganache-cli\n    ports:\n      - \"8545:8545\"";
    var collectibleEnv = ("\n      REACT_APP_COLLECTIBLES_SOURCE: '" + collectiblesSource + "'\n      REACT_APP_COLLECTIBLE_ADDRESS: '" + options.collectibleAddress + "'\n      REACT_APP_COLLECTIBLE_NAME: '" + options.collectibleName + "'\n      REACT_APP_COLLECTIBLE_DESCRIPTION: '" + options.collectibleDescription + "'\n    ").trimLeft();
    return ("\nversion: \"3\"\nservices:" + (isGanache ? ganacheService : '') + "\n  frontend:\n    image: https://github.com/Calipson/0x-launch-kit-frontend\n    environment:\n      REACT_APP_RELAYER_URL: '" + options.relayerUrl + "'\n      REACT_APP_RELAYER_WS_URL: '" + options.relayerWebsocketUrl + "'\n      REACT_APP_DEFAULT_BASE_PATH: '" + basePath + "'\n      REACT_APP_THEME_NAME: '" + theme + "'\n      REACT_APP_NETWORK_ID: " + networkId + "\n      REACT_APP_CHAIN_ID: " + chainId + "\n      " + (options.tokenType === 'ERC20' ? '' : collectibleEnv) + "\n    command: yarn build\n    volumes:\n        - frontend-assets:/app/build\n  backend:\n    image: 0xorg/launch-kit-backend:latest\n    environment:\n        HTTP_PORT: '3000'\n        RPC_URL: '" + options.rpcUrl + "'\n        NETWORK_ID: '" + networkId + "'\n        CHAIN_ID: '" + chainId + "'\n        WHITELIST_ALL_TOKENS: 'true'\n        FEE_RECIPIENT: '" + options.feeRecipient + "'\n        MAKER_FEE_UNIT_AMOUNT: '" + options.makerFee + "'\n        TAKER_FEE_UNIT_AMOUNT: '" + options.takerFee + "'\n        MESH_ENDPOINT: 'ws://mesh:60557'\n    ports:\n      - '3000:3000'\n  mesh:\n    image: 0xorg/mesh:7-0xv3\n    restart: always\n    environment:\n        ETHEREUM_RPC_URL: '" + options.rpcUrl + "'\n        ETHEREUM_CHAIN_ID: '" + chainId + "'\n        VERBOSITY: 3\n        RPC_ADDR: 'mesh:60557'\n        # You can decrease the BLOCK_POLLING_INTERVAL for test networks to\n        # improve performance. See https://0x-org.gitbook.io/mesh/ for more\n        # Documentation about Mesh and its environment variables.\n        BLOCK_POLLING_INTERVAL: '5s'\n    ports:\n        - '60557:60557'\n        - '60558:60558'\n        - '60559:60559'\n  nginx:\n    image: nginx\n    ports:\n        - '" + options.port + ":80'\n    volumes:\n        - frontend-assets:/usr/share/nginx/html\nvolumes:\n    frontend-assets:\n").trimLeft();
};
