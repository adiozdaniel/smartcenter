// https://eth-sepolia.g.alchemy.com/v2/mpLzbn1jt9trlCQjPBxMvjfNrKh7u7sM

require ('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  defaultNetwork: "sepolia",
  networks: {
    hardhat: {},
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/mpLzbn1jt9trlCQjPBxMvjfNrKh7u7sM`,
      accounts: ['926305044383dceb6c7edaefc99da5c1a59d3a6db49ae309d52dd3f705eec1a8'] // supposed to use metamask private key
    }
  }
}