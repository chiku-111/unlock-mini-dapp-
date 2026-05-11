import { expect } from "chai";

import { network } from "hardhat";


//测试网络里拿 ethers, 用来部署合约、拿测试账户、调用合约/ networkHelpers测试里“快进区块链时间”
const { ethers, networkHelpers } = await network.create();

describe("MembershipLock", function(){
    //check "deployer.address == membershipLock.owner()"
    it("deployer should be owner", async function () {
        const membershipLock = await ethers.deployContract("MembershipLock");
        const [deployer] = await ethers.getSigners();
        //sol对public 变量自动生成读取函数, 外部可以调用owner();
        expect(await membershipLock.owner()).to.equal(deployer.address);
    });

    it("should return false by default", async function () {
        const membershipLock = await ethers.deployContract("MembershipLock");        
        const [, user] = await ethers.getSigners();
        expect(await membershipLock.hasValidMembership(user.address)).to.equal(false);
    });

    //owner 可以给用户授予会员, membershipExpiresAt[user] = block.timestamp + duration;
    it("owner can grant membership", async function () {
        const membershipLock = await ethers.deployContract("MembershipLock");
        const [owner, user] = await ethers.getSigners();

        // 会员有效期:60 * 60s = 1h
        const duration = 60 *60;

        // owner 调用 grantMembership,给 user 授予 1 小时会员
        await membershipLock.connect(owner).grantMembership(user.address, duration);
        const expiresAt = await membershipLock.membershipExpiresAt(user.address);
        expect(expiresAt).to.be.greaterThan(0);
        
    });

    //owner 授予会员后, 用户应变成有效会员
    it("should return  true after owner grants membership", async function () {
        const membershipLock = await ethers.deployContract("MembershipLock");
        const [owner, user] = await ethers.getSigners();

        const duration = 60*60;
        await membershipLock.connect(owner).grantMembership(user.address, duration);
        expect(await membershipLock.hasValidMembership(user.address)).to.equal(true);

    });

    //grantMembership 授权出来的会员，过期后会失效
    it("should return false after granted membership expires", async function () {
        const membershipLock = await ethers.deployContract("MembershipLock");
        const [owner, user] = await ethers.getSigners();
        const duration = 60;

        //owner 给 user.address 开通 60 秒会员
        await membershipLock.connect(owner).grantMembership(user.address, duration);
        expect(await membershipLock.hasValidMembership(user.address)).to.equal(true);
        
        //把本地测试链的区块时间向前推进指定秒数, 并挖出一个新区块; 让测试链时间前进 61 秒
        await networkHelpers.time.increase(duration +1);
        expect(await membershipLock.hasValidMembership(user.address)).to.equal(false);
    });

    //non-owner 不能授予会员
    it("non-owner cannot grant membership", async function () {
        const membershipLock = await ethers.deployContract("MembershipLock");
        const [, user] = await ethers.getSigners();

        const duration = 60 *60;
        await expect(
            membershipLock.connect(user).grantMembership(user.address, duration)
        ).to.be.revertedWith("Only owner can grant");
        
    });

    //
    it("user cannot purchase membership without payment", async function () {
        const membershipLock = await ethers.deployContract("MembershipLock");
        const [, user] = await ethers.getSigners();
        
        //期待交易失败，并返回 Incorrect payment
        await expect(
            //用 user 身份调用 purchaseMembership, 但不发送任何 ETH
            membershipLock.connect(user).purchaseMembership()
        ).to.be.revertedWith("Incorrect payment"); 
    });

    //用户不能用错误金额购买会员
    it("user cannot purchase membership with underpayment", async function () {
        const membershipLock = await ethers.deployContract("MembershipLock");
        const [, user] = await ethers.getSigners();

        await expect(
            membershipLock.connect(user).purchaseMembership({
                value: ethers.parseEther("0.05"),
            })
        ).to.be.revertedWith("Incorrect payment");

    });

    // 用户多付 ETH 时不能购买会员
    it("user cannot purchase membership with overpayment", async function () { 
    const membershipLock = await ethers.deployContract("MembershipLock"); 
    const [, user] = await ethers.getSigners();

    await expect(
        membershipLock.connect(user).purchaseMembership({
            value: ethers.parseEther("0.05"), 
        })
    ).to.be.revertedWith("Incorrect payment"); // 期待交易失败，并且失败原因是 Incorrect payment
    }); 


    //用户调用 purchaseMembership 后，自己应变成有效会员
    it("should return true after user purchases membership", async function () {
        const membershipLock = await ethers.deployContract("MembershipLock");
        const [, user] = await ethers.getSigners();

        //sol: msg.sender = user.address
        await membershipLock.connect(user).purchaseMembership({
            value: ethers.parseEther("0.01"),
        });
        expect(await membershipLock.hasValidMembership(user.address)).to.equal(true);
    });

    //用户购买得到的 30 天会员, 购买的会员过期后，应该返回 false
    it("should return false after user purchases membership expires", async function () {
        const membershipLock = await ethers.deployContract("MembershipLock");

        const [, user] = await ethers.getSigners();

        await membershipLock.connect(user).purchaseMembership({
            //购买会员时随交易发送 0.01 ETH
            value: ethers.parseEther("0.01"),
        });
        expect(await membershipLock.hasValidMembership(user.address)).to.equal(true);

        //让测试链时间快进 30days + 1s
        await networkHelpers.time.increase(30 * 24 * 60 * 60 + 1);

        expect(await membershipLock.hasValidMembership(user.address)).to.equal(false);
    });
    
    //购买成功后, 合约应该收到钱, 并且用户应该成为有效会员
    it("contract should receive payment after purchase and user should become valid member", async function () {
        const membershipLock = await ethers.deployContract("MembershipLock");
        const [, user] = await ethers.getSigners();

        await membershipLock.connect(user).purchaseMembership({
            value: ethers.parseEther("0.01"),
        });

        //拿到合约地址
        const contractAddress = await membershipLock.getAddress();

        //查询合约地址的 ETH 余额
        const contractBalance = await ethers.provider.getBalance(contractAddress);

        expect(contractBalance).to.equal(ethers.parseEther("0.01"));
        expect(await membershipLock.hasValidMembership(user.address)).to.equal(true);
    });
  
})

// 成功交易 await transaction;

// 失败交易 await expect(transaction).to.be.revertedWith("reason");