require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan")
const dotenv = require("dotenv")

dotenv.config();

module.exports = {
  solidity: "0.8.4",
  networks: {
    mainnet: {
      url: process.env.REACT_APP_MAINNET_RPC_URL,
      accounts: [process.env.REACT_APP_PROD_PRIVATE_KEY]
    },
    rinkeby: {
      url: process.env.REACT_APP_RINKBEY_RPC_URL,
      accounts: [process.env.REACT_APP_PRIVATE_KEY]
    },
    goerli: {
      url: process.env.REACT_APP_GOERLI_RPC_URL,
      accounts: [process.env.REACT_APP_PRIVATE_KEY]
    },
  },
  etherscan: {
    apiKey: process.env.REACT_APP_ETHERSCAN_KEY
  }
};