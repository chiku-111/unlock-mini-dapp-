# Unlock Mini DApp

## 项目目标

这是一个Mini Unlock membership gating DApp。

它不是完整复现 Unlock Protocol，而是用最简单的方式演示会员访问控制逻辑：

- 合约保存每个地址的会员到期时间
- 前端根据会员状态显示 locked / unlocked
- 测试验证 owner 授权、用户购买、会员有效性判断

## 已完成内容

- 初始化 Hardhat 项目
- 创建 MiniMembership 学习版合约
- 为 MiniMembership 编写 3 个基础测试
- 创建 MembershipLock 核心合约
- 为 MembershipLock 编写 6 个测试
- 创建 React/Vite 前端基础页面
- 前端目前可以模拟钱包连接和 locked / unlocked 状态

## 合约说明

### MiniMembership

MiniMembership 是学习版合约，用来理解最简单的会员开关逻辑。

它使用：

```solidity
mapping(address => bool) public members;
# Unlock Mini DApp 中文说明

## 项目目标

本项目是一个最小版 Unlock-style membership gating DApp。

它不是完整复现 Unlock Protocol，而是用最小功能演示“会员访问控制”的核心思路：

- 智能合约记录每个地址的会员状态或会员到期时间
- 测试验证会员授权、会员购买和访问判断逻辑
- 前端根据钱包和会员状态显示 `locked` / `unlocked`

当前项目重点是学习和演示：

```txt
地址是否拥有有效会员
有效会员如何被授予
用户如何自己开通会员
前端如何根据会员状态决定是否解锁内容
```

## 当前完成状态

已完成：

1. Hardhat 项目初始化
2. React / Vite 前端基础页面
3. `MiniMembership.sol` 学习版合约
4. `MiniMembership` 的 3 个基础测试
5. `MembershipLock.sol` 核心合约
6. `MembershipLock` 的 6 个测试
7. 前端模拟钱包连接和模拟 locked / unlocked 状态
8. 若干早期学习脚本和访问控制演示脚本

还未完成：

1. `MembershipLock` 的正式部署脚本
2. 真实 MetaMask 钱包连接
3. 前端真实读取链上合约
4. ABI 和合约地址配置
5. 真实 `hasValidMembership(address)` 前端调用
6. 真实购买交易流程
7. 完整 Unlock Protocol 功能

## 技术栈

- Solidity `0.8.28`
- Hardhat `3`
- TypeScript
- Mocha
- Chai
- ethers
- React
- Vite

## 合约说明

### MiniMembership.sol

文件位置：

```txt
contracts/MiniMembership.sol
```

`MiniMembership` 是学习版合约，用来理解最简单的会员开关逻辑。

核心数据结构：

```solidity
mapping(address => bool) public members;
```

含义：

```txt
每个地址对应一个 true / false
true  = 是会员
false = 不是会员
```

核心函数：

```solidity
function setMember(address user, bool isMember) public
```

作用：

```txt
设置某个地址是否是会员。
```

```solidity
function hasValidMembership(address user) public view returns (bool)
```

作用：

```txt
查询某个地址当前是否是会员。
```

这个合约的学习意义是：

```txt
先理解最简单的 address => bool 会员判断。
```

### MembershipLock.sol

文件位置：

```txt
contracts/MembershipLock.sol
```

`MembershipLock` 是当前项目的核心合约。

它从 `bool` 会员状态升级为“会员到期时间”：

```solidity
mapping(address => uint256) public membershipExpiresAt;
```

含义：

```txt
每个地址对应一个会员到期时间戳。
```

判断逻辑：

```solidity
membershipExpiresAt[user] > block.timestamp
```

如果结果为 `true`：

```txt
用户会员仍然有效。
```

如果结果为 `false`：

```txt
用户没有会员，或会员已经过期。
```

核心变量：

```solidity
address public owner;
```

含义：

```txt
合约管理员地址。
部署合约的人会在 constructor 中被设置为 owner。
```

核心函数：

```solidity
constructor()
```

作用：

```txt
部署合约时自动执行一次。
把部署者 msg.sender 保存为 owner。
```

```solidity
function grantMembership(address user, uint256 duration) public
```

作用：

```txt
owner 给指定 user 授予指定时长的会员。
```

权限限制：

```solidity
require(msg.sender == owner, "Only owner can grant");
```

含义：

```txt
只有 owner 可以调用 grantMembership。
非 owner 调用会失败。
```

```solidity
function purchaseMembership() public
```

作用：

```txt
用户自己调用，为自己开通 30 天会员。
```

当前版本说明：

```txt
这是学习版 purchaseMembership，目前不收 ETH。
还没有 payable、price、msg.value 检查。
```

```solidity
function hasValidMembership(address user) public view returns (bool)
```

作用：

```txt
查询 user 当前是否拥有有效会员。
```

## 测试说明

### MiniMembership 测试

文件位置：

```txt
test/MiniMembership.ts
```

当前包含 3 个测试：

1. 默认情况下不是会员，返回 `false`
2. `setMember(user, true)` 后返回 `true`
3. `setMember(user, false)` 后返回 `false`

这些测试验证了学习版合约的基础会员开关逻辑。

### MembershipLock 测试

文件位置：

```txt
test/MembershipLock.ts
```

当前包含 6 个测试：

1. `deployer should be owner`

   验证部署合约的人会被记录为 `owner`。

2. `should return false by default`

   验证默认情况下普通用户没有有效会员。

3. `owner can grant membership`

   验证 owner 可以调用 `grantMembership` 给用户设置会员到期时间。

4. `should return true after owner grants membership`

   验证 owner 授予会员后，`hasValidMembership(user)` 返回 `true`。

5. `non-owner cannot grant membership`

   验证非 owner 不能调用 `grantMembership`，并且会返回错误：

   ```txt
   Only owner can grant
   ```

6. `should return true after user purchases membership`

   验证用户调用 `purchaseMembership` 后，自己会拥有有效会员。

测试运行结果：

```txt
6 passing
```

## 运行合约测试

运行 `MembershipLock` 测试：

```bash
npx.cmd hardhat test test/MembershipLock.ts
```

运行 `MiniMembership` 测试：

```bash
npx.cmd hardhat test test/MiniMembership.ts
```

如果在受限环境中运行 Hardhat 时遇到 `spawn EPERM` 或 `HHE21`，可能是本地执行环境限制导致的。提升运行权限后，当前 `MembershipLock` 编译和测试可以通过。

## 前端当前状态

前端文件位置：

```txt
frontend/src/App.tsx
```

当前前端已经实现：

- `locked` / `unlocked` 页面状态
- `walletAddress` 状态
- `Connect Wallet` 按钮
- `Check Membership` 按钮
- 页面显示当前钱包地址
- 页面显示当前访问状态

当前前端逻辑仍然是模拟版：

```txt
Connect Wallet 按钮设置假地址：0x1234...abcd
Check Membership 按钮根据是否存在 walletAddress 来切换 locked / unlocked
```

也就是说，目前前端还没有真实连接 MetaMask，也没有真实读取 `MembershipLock` 合约。

## 运行前端

进入前端目录：

```bash
cd frontend
```

安装依赖：

```bash
npm.cmd install
```

启动开发服务器：

```bash
npm.cmd run dev
```

## 当前 Demo Flow

当前可演示流程：

1. 打开前端页面
2. 初始状态显示 `locked`
3. 点击 `Connect Wallet`
4. 页面显示模拟钱包地址
5. 点击 `Check Membership`
6. 页面切换为 `unlocked`

当前合约测试可演示流程：

1. 部署 `MembershipLock`
2. 检查部署者是否是 owner
3. 检查普通用户默认不是会员
4. owner 给用户授予会员
5. 检查用户变成有效会员
6. 非 owner 授权失败
7. 用户自己调用 `purchaseMembership`
8. 检查用户变成有效会员

## 已有脚本

`scripts` 目录下目前包含一些早期学习和演示脚本：

```txt
scripts/access-flow.js
scripts/access-state.js
scripts/check-key.js
scripts/membership-check.ts
scripts/membership-demo.js
scripts/unlock-data.js
```

这些脚本用于早期理解访问状态、会员检查和 Unlock-style 数据结构。

目前还没有正式的 `MembershipLock` 部署脚本。

计划后续新增：

```txt
scripts/deploy-membership-lock.ts
```

## 当前限制

当前项目仍是学习版和最小演示版。

未实现内容包括：

- 完整 Unlock Protocol
- NFT key mint / transfer
- 完整 Paywall
- 完整 Checkout
- 多链支持
- 真实 ETH 支付
- `payable` 购买逻辑
- `price` 价格检查
- `msg.value` 支付校验
- 生产环境部署
- 前端真实读取链上会员状态

当前的 `purchaseMembership` 是学习版函数：

```txt
用户调用后直接获得 30 天会员，不需要支付 ETH。
```

## 和 Unlock Protocol 的关系

本项目只实现 Unlock-style membership gating 的最小核心思想：

```txt
判断一个地址是否拥有有效会员。
```

Unlock Protocol 是完整协议，通常涉及：

- NFT membership key
- 会员购买
- key 转让
- lock 管理
- 多链部署
- Paywall UI
- Checkout
- 价格、续费和过期管理

本项目暂时只聚焦在：

```txt
membershipExpiresAt[address] > block.timestamp
```

也就是：

```txt
会员到期时间是否仍在未来。
```

## 下一步计划

优先级 1：部署脚本

```txt
创建 scripts/deploy-membership-lock.ts
部署 MembershipLock
打印合约地址
```

优先级 2：前端连接真实钱包

```txt
点击 Connect Wallet
调用 window.ethereum.request({ method: "eth_requestAccounts" })
保存真实钱包地址
没有 MetaMask 时显示错误信息
```

优先级 3：前端读取合约

```txt
添加 MembershipLock ABI
添加合约地址配置
调用 hasValidMembership(account)
true 显示 unlocked
false 显示 locked
```

优先级 4：补充文档

```txt
docs/compare-with-unlock.md
docs/meeting-summary-zh.md
docs/progress-en.md
```

## 当前总结

目前项目已经完成了最小 Unlock-style membership gating DApp 的合约核心和测试验证。

已经可以证明：

```txt
1. 部署者是 owner
2. 默认用户不是会员
3. owner 可以授予会员
4. 非 owner 不能授予会员
5. 用户可以调用 purchaseMembership 获得会员
6. hasValidMembership 可以返回正确的会员状态
```

下一步重点是把前端从模拟逻辑升级为真实链上读取：

```txt
Connect Wallet -> Check Membership -> locked / unlocked
```
