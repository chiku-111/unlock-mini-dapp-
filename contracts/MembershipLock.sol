//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract MembershipLock{
    //管理员地址保存
    address public owner;

    //address 对应会员到期时间戳
    mapping(address => uint256) public membershipExpiresAt;

    constructor(){
        owner = msg.sender;
    }

    //给某个用户授予会员资格
    function grantMembership(address user, uint256 duration) public{
        //权限检查:只有 owner 可以授予会员
        require(msg.sender == owner, "Only owner can grant");
        // user会员到期时间设置为: 当前区块时间 + 会员有效时长（秒）
        membershipExpiresAt[user] = block.timestamp + duration;
    }
    // 用户自己调用这个函数，为自己开通会员
    function purchaseMembership() public{
        membershipExpiresAt[msg.sender] = block.timestamp + 30 days;
    }

    // 查询 user 当前是否拥有有效会员
    function hasValidMembership(address user) public view returns (bool) {
        return membershipExpiresAt[user] > block.timestamp;

    }
}