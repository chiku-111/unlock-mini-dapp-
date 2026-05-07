//MembershipLock 部署到一个区块链网络上, 打印出合约地址
//前端会用这个地址调用, hasValidMembership(account)
import { network } from "hardhat";

const { ethers } = await network.create("localhost");

const membershipLock = await ethers.deployContract("MembershipLock");

//等待合约部署完成
await membershipLock.waitForDeployment();

//getAddress() 返回部署后的合约地址
const membershipLockAddress = await membershipLock.getAddress();

console.log("MembershipLock deployed to:", membershipLockAddress);
