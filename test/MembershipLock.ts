import { expect } from "chai";

import { network } from "hardhat";


//测试网络里拿 ethers, 用来部署合约、拿测试账户、调用合约
const { ethers } = await network.create();

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

    //non-owner 不能授予会员
    it("non-owner cannot grant membership", async function () {
        const membershipLock = await ethers.deployContract("MembershipLock");
        const [, user] = await ethers.getSigners();

        const duration = 60 *60;
        await expect(
            membershipLock.connect(user).grantMembership(user.address, duration)
        ).to.be.revertedWith("Only owner can grant");
        
    });

    //用户调用 purchaseMembership 后，自己应变成有效会员
    it("should return true after user purchases membership", async function () {
        const membershipLock = await ethers.deployContract("MembershipLock");
        const [, user] = await ethers.getSigners();

        //sol: msg.sender = user.address
        await membershipLock.connect(user).purchaseMembership();
        expect(await membershipLock.hasValidMembership(user.address)).to.equal(true);
    });

})