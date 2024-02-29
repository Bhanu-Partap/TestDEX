const { except } = require("chai");
const { ethers } = require("hardhat");

describe("Dex Test Cases", async () => {
  let erc20token0, ERC20token0, erc20token1, ERC20token1, factory, Factory;
  const [user1, user2] = await ethers.getSigners();


  beforeEach(async () => {
    //              Token 1 deploynment
    erc20token0 = await ethers.getContractFactory("erc20token");
    ERC20token0 = await erc20token0.deploy("Ethereum", "ETH");

    //              Token 2 deploynment
    erc20token1 = await ethers.getContractFactory("erc20token");
    ERC20token1 = await erc20token0.deploy("Bitcoin", "BTC");

    //              Factory Contract deploynment
    factory = await ethers.getContractFactory("factory");
    Factory = await factory.deploy();

  });

    //              Token 1 contract test cases 
    describe("Token 1 Contract test ",async()=>{
      const totalSupply = ERC20token0.totalSupply(ERC20token0.signer);
      except(totalSupply).to.equal(0)
    })
});
