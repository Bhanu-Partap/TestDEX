const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Dex Test Cases", async () => {
  let ERC20token0, ERC20token1, Factory, pool, lpTokens;
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
    let pair = await ethers.getContractFactory("pool");
    pool=  pair.attach("0x94B9874aC5605713CcAc00ca8E832B37e15c1399")
    let Vault = await ethers.getContractFactory("Vault")
    lpTokens = Vault.attach("0x5A56bC31C437d62e7608EAc1e2368148dd0D2941")
    Factory.connect(owner.address )


  });

    //              Token 1 contract test cases 
    it("  Should the total supply of token0 is 0", async () => {
      const totalSupply = await ERC20token0.totalSupply()
      expect(totalSupply).to.equal(0);
    });

    it("  Should token0 have up to 4 decimal", async () => {
      const decimal = await ERC20token0.decimals()
      expect(decimal).to.equal(4);
    });

    it("  minting the token0 in user account", async () => {
      const mint = await ERC20token0.PublicMint(owner.address, 100)
      const balance = await ERC20token0.balanceOf(owner.address)
      expect(balance).to.equal(100);
    });

    //              Token 2 contract test cases 
    it("  Should the total supply of token1 is 0", async () => {
      const totalSupply = await ERC20token1.totalSupply()
      expect(totalSupply).to.equal(0);
    });

    it("  Should token1 have up to 4 decimal", async () => {
      const decimal = await ERC20token1.decimals()
      expect(decimal).to.equal(4);
    });

    it("  Checking the length of the pair before pair creation", async () => {
      const allPairsLength = await Factory.allPairsLength()
      expect(allPairsLength).to.equal(0);
    });

    //=================Factory Contract Test Cases=====================//

    it("CREATE PAIR : Creating a new Pair", async () => {
      const createPair = await Factory.createPair(ERC20token0.getAddress(),ERC20token1.getAddress())
      await createPair.wait();
      const allPairsLength = await Factory.allPairsLength()
      expect(allPairsLength).to.equal(1);
    });

    it("  After creating a new Pair the pair created event is initiated or not", async () => {
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

    it("  Token Address should not be Identical", async () => {
      await expect( Factory.createPair(ERC20token0.getAddress(),ERC20token0.getAddress())).to.be.revertedWith("UniswapV2: IDENTICAL_ADDRESSES")
    });

    it("  Token Address should not be zero or (0x000)", async () => {
      const erc20addr =await ERC20token0.attach("0x0000000000000000000000000000000000000000")
      await expect(Factory.createPair(erc20addr.target,ERC20token0.getAddress())).to.be.revertedWith("ZERO_ADDRESS")
    });

    it("  Pair exist already", async () => {
      const createPair =  Factory.createPair(ERC20token0.getAddress(), ERC20token1.getAddress())
      await expect(Factory.createPair(ERC20token0.getAddress(), ERC20token1.getAddress())).to.be.revertedWith("PAIR_EXISTS")
    });


    it("ADD LIQUIDITY : Token Address should not be Identical", async () => {
      await expect(Factory.addLiquidity(ERC20token0.getAddress(),ERC20token0.getAddress(),100,100)).to.be.revertedWith("IDENTICAL_ADDRESSES")
    });
    
      
    it("  Token Address should not be Identical", async () => {
      const erc20addr = ERC20token0.attach("0x0000000000000000000000000000000000000000")
      await expect(Factory.addLiquidity(erc20addr.target,ERC20token1.getAddress(),100,100)).to.be.revertedWith("ZERO_ADDRESS")
    });

    it("  Token Reserve Should be in Sync For adding Liquidity", async () => {
      const createPair =  Factory.createPair(ERC20token0.getAddress(), ERC20token1.getAddress())
      await ERC20token0.PublicMint(user1.address, 1000)
      await ERC20token1.PublicMint(user1.address, 1000)
      const addLiquidity1 = await Factory.connect(user1).addLiquidity(ERC20token0.getAddress(),ERC20token1.getAddress(),100,100)
      const getpair = await Factory.getPair(ERC20token0.getAddress(), ERC20token1.getAddress())
      const lpTokenBalance = await lpTokens.balanceOf(user1.address)
      console.log("Lp Tokens issued : ",lpTokenBalance);
      const RemoveLiquidity = await Factory.RemoveLiquidity(ERC20token0.getAddress(),ERC20token1.getAddress(),10)
      // console.log(RemoveLiquidity);
      const Token0reserve = await pool.reserveToken0()
      const Token1reserve = await pool.reserveToken1()
      console.log("Reserve Token 0 before swap:",Token0reserve);
      console.log("Reserve Token 1 before swap:",Token1reserve);
      const swap = await Factory.connect(user1).swap(ERC20token0.getAddress(), ERC20token1.getAddress(), 10)
      const Token0reserveafteradd = await pool.reserveToken0()
      const Token1reserveafteradd = await pool.reserveToken1()
      console.log("Reserve Token 0 after swap:",Token0reserveafteradd);
      console.log("Reserve Token 1 after swap:",Token1reserveafteradd);
      const addLiquidity2 =  Factory.connect(user1).addLiquidity(ERC20token0.getAddress(),ERC20token1.getAddress(),10,100)
      await expect(addLiquidity2).to.be.revertedWith("reserves are not in sync")
    });

    
    it("  liquidity needed to be in ratio according existing ones", async () => {
      const createPair =  Factory.createPair(ERC20token0.getAddress(), ERC20token1.getAddress())
      await ERC20token0.PublicMint(user1.address, 1000)
      await ERC20token1.PublicMint(user1.address, 1000)
      const addLiquidity1 = await Factory.connect(user1).addLiquidity(ERC20token0.getAddress(),ERC20token1.getAddress(),100,100)
      const getpair = await Factory.getPair(ERC20token0.getAddress(), ERC20token1.getAddress())
      const lpTokenBalance = await lpTokens.balanceOf(user1.address)
      // console.log(lpTokenBalance);
      const RemoveLiquidity = await Factory.RemoveLiquidity(ERC20token0.getAddress(),ERC20token1.getAddress(),10)
      // console.log(RemoveLiquidity);
      const addLiquidity2 =  Factory.connect(user1).addLiquidity(ERC20token0.getAddress(),ERC20token1.getAddress(),1000,100)
      await expect(addLiquidity2).to.be.revertedWith("liquidity needed to be in ratio according existing ones")
    });


    it(" Not enough balance while adding liquidity ", async () => {
      const createPair =  Factory.createPair(ERC20token0.getAddress(), ERC20token1.getAddress())
      // await ERC20token0.PublicMint(user1.address, 1000)
      // await ERC20token1.PublicMint(user1.address, 1000)
      const addLiquidity = Factory.connect(user1).addLiquidity(ERC20token0.getAddress(),ERC20token1.getAddress(),100,100)
      await expect(addLiquidity).to.be.revertedWith("not enough balance")
    });


    it(" Event emit : PairCreated ", async () => {
      await expect(Factory.createPair(ERC20token0.getAddress(), ERC20token1.getAddress())).to.emit(Factory,"PairCreated")
    });


    it(" Event emit : syncReserves ", async () => {
      await ERC20token0.PublicMint(user1.address, 200)
      await ERC20token1.PublicMint(user1.address, 200)
      await expect(Factory.connect(user1).addLiquidity(ERC20token0.getAddress(), ERC20token1.getAddress(),100,100)).to.emit(Factory,"syncReserves")
    });


    it(" Event emit : liquidityAdded ", async () => {
      await ERC20token0.PublicMint(user1.address, 200)
      await ERC20token1.PublicMint(user1.address, 200)
      await expect(Factory.connect(user1).addLiquidity(ERC20token0.getAddress(), ERC20token1.getAddress(),100,100)).to.emit(Factory,"liquidityAdded")
    });
    

    


});
