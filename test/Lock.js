const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Dex Test Cases", async () => {
  let ERC20token0, ERC20token1, Factory;

  beforeEach(async () => {
  const [user1, user2, owner] = await ethers.getSigners();

    //              Token 1 deploynment
    let erc20token0 = await ethers.getContractFactory("erc20token");
     ERC20token0 = await erc20token0.deploy("Ethereum", "ETH");

    //              Token 2 deploynment
    let erc20token1 = await ethers.getContractFactory("erc20token");
     ERC20token1 = await erc20token1.deploy("Bitcoin", "BTC");

    //              Factory Contract deploynment
    let factory = await ethers.getContractFactory("factory");
    Factory = await factory.deploy();
    Factory.connect(owner.address )

  });

    //              Token 1 contract test cases 
    it("Should the total supply of token0 is 0", async () => {
      const totalSupply = await ERC20token0.totalSupply()
      expect(totalSupply).to.equal(0);
    });

    it("Should have to 4 decimal", async () => {
      const decimal = await ERC20token0.decimals()
      expect(decimal).to.equal(4);
    });

    //              Token 2 contract test cases 
    it("Should the total supply of token0 is 0", async () => {
      const totalSupply = await ERC20token0.totalSupply()
      expect(totalSupply).to.equal(0);
    });

    it("Should have to 4 decimal", async () => {
      const decimal = await ERC20token0.decimals()
      expect(decimal).to.equal(4);
    });

});
