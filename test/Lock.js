const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Dex Test Cases", async () => {
  let ERC20token0, ERC20token1, Factory;
  let owner, user1 , user2;
  
  beforeEach(async () => {
    [user1, user2, owner] = await ethers.getSigners();

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

    it("Should token0 have up to 4 decimal", async () => {
      const decimal = await ERC20token0.decimals()
      expect(decimal).to.equal(4);
    });

    it("minting the token0 in user account", async () => {
      const mint = await ERC20token0.PublicMint(owner.address, 100)
      const balance = await ERC20token0.balanceOf(owner.address)
      expect(balance).to.equal(100);
    });

    //              Token 2 contract test cases 
    it("Should the total supply of token1 is 0", async () => {
      const totalSupply = await ERC20token1.totalSupply()
      expect(totalSupply).to.equal(0);
    });

    it("Should token1 have up to 4 decimal", async () => {
      const decimal = await ERC20token1.decimals()
      expect(decimal).to.equal(4);
    });

    it("Checking the length of the pair before pair creation", async () => {
      const allPairsLength = await Factory.allPairsLength()
      expect(allPairsLength).to.equal(0);
    });

    //=================Factory Contract Test Cases=====================//

    it("Creating a new Pair", async () => {
      const createPair = await Factory.createPair(ERC20token0.getAddress(),ERC20token1.getAddress())
      await createPair.wait();
      const allPairsLength = await Factory.allPairsLength()
      expect(allPairsLength).to.equal(1);
    });

    it("After creating a new Pair the pair created event is initiated or not", async () => {
      const createPair = await Factory.createPair(ERC20token0.getAddress(),ERC20token1.getAddress())
      await createPair.wait();
      const GetPair = await Factory.getPair(ERC20token0.getAddress(), ERC20token1.getAddress())
      const allPairsLength = await Factory.allPairsLength()

      // console.log(allPairsLength.toString());
      
      //==== Getting the pool contract address=====//
      // console.log(GetPair.toString());

      // console.log(await ERC20token1.getAddress());
      // console.log(await ERC20token0.getAddress());

      expect(GetPair.toString()).to.equal("0xf3eE3C4Ec25e8414838567818A30C90c7d62f834")
      expect(allPairsLength).to.equal(1)

      ///=========== Event emit in solidity function===========///
      // const PairCreated = await Factory.queryFilter(Factory.filters.PairCreated(ERC20token0.getAddress(), ERC20token1.getAddress(),GetPair.address,allPairsLength.length ))
      const pairCreated = await Factory.queryFilter(Factory.filters.PairCreated(null, null,null,null))
      const pairt =  await pairCreated[0].args[1] ;
      // console.log(pairt);
      expect(pairCreated.length).to.equal(1);
      expect(pairt).to.emit(ERC20token0.getAddress());
    });

    it("Token Address should not be Identical", async () => {
      expect( Factory.createPair(ERC20token0.getAddress(),ERC20token0.getAddress())).to.be.revertedWith("Identical Address")
    });

    it("Token Address should not be zero or (0x000)", async () => {
      const erc20addr =await ERC20token0.attach("0x0000000000000000000000000000000000000000")
      expect(Factory.createPair(erc20addr.target,ERC20token0.getAddress())).to.be.revertedWith("ZERO_ADDRESS")
    });

    it("Pair exist already", async () => {
      // const erc20addr =await ERC20token0.attach("0x0000000000000000000000000000000000000000")
      const createPair= await Factory.createPair(ERC20token0.getAddress(), ERC20token1.getAddress())
      const againCreatePair =  Factory.createPair(ERC20token0.getAddress(), ERC20token1.getAddress())
      expect(againCreatePair).to.be.revertedWith("PAIR_EXISTS")
    });
    

});
