# Unlock Mini DApp 中文说明

## 项目一句话总结

这是一个最小版的 Unlock-style membership gating DApp。

它不是完整复刻 Unlock Protocol，而是用一个小型学习项目演示会员访问控制的核心逻辑：

```txt
钱包地址 -> 查询链上会员状态 -> 页面显示 locked 或 unlocked
```

当前项目已经从早期的“纯前端模拟状态”推进到了“真实 MetaMask 钱包连接 + 本地 Hardhat 链 + 前端读取智能合约”的阶段。

## 当前完成状态

已经完成：

1. 初始化 Hardhat 3 项目
2. 初始化 React / Vite / TypeScript 前端
3. 编写学习版合约 `MiniMembership.sol`
4. 编写核心会员合约 `MembershipLock.sol`
5. 为 `MiniMembership` 编写 3 个基础测试
6. 为 `MembershipLock` 编写 6 个基础测试
7. 保留 Hardhat 模板自带的 `Counter` 示例和测试
8. 编写 `MembershipLock` 本地部署脚本
9. 前端接入 MetaMask，能获取真实钱包地址
10. 前端使用 viem 读取本地 Hardhat 链上的 `MembershipLock`
11. 前端根据 `hasValidMembership(address)` 返回结果显示 `locked` 或 `unlocked`

当前还没有完成：

1. 前端发起 `purchaseMembership()` 交易
2. 前端发起 `grantMembership()` 管理员授权交易
3. 真实 ETH 支付逻辑
4. 会员价格 `price`
5. `payable` 购买函数
6. `msg.value` 支付校验
7. 交易成功后自动刷新会员状态
8. Sepolia 测试网部署完整流程
9. 生产环境部署
10. 完整 Unlock Protocol 的 NFT key、checkout、paywall、续费、转让等功能

## 技术栈

合约与测试：

- Solidity `0.8.28`
- Hardhat `3`
- TypeScript
- Mocha
- Chai
- ethers

前端：

- React
- Vite
- TypeScript
- viem
- MetaMask

本地链：

- Hardhat local node
- RPC: `http://127.0.0.1:8545`
- Chain ID: `31337`

## 项目目录说明

```txt
contracts/
  MiniMembership.sol       学习版会员合约
  MembershipLock.sol       当前核心会员合约
  Counter.sol              Hardhat 模板示例合约，非核心功能

test/
  MiniMembership.ts        MiniMembership 测试
  MembershipLock.ts        MembershipLock 测试
  Counter.ts               Hardhat 模板示例测试

scripts/
  deploy-membership-lock.ts  部署 MembershipLock 到 localhost
  membership-check.ts        早期 TypeScript 会员判断练习脚本
  membership-demo.js         早期 JavaScript 会员判断练习脚本
  access-flow.js             早期访问控制流程练习脚本
  access-state.js            早期 locked / unlocked 状态练习脚本
  check-key.js               早期 key owner / valid 判断练习脚本
  unlock-data.js             早期 Unlock-style 数据结构练习脚本

frontend/
  src/App.tsx                前端主页面逻辑
  src/config.ts              MembershipLock 合约地址配置
  src/abi/MembershipLockAbi.ts  前端读取合约用的 ABI
```

## 核心概念

这个项目主要学习一件事：

```txt
如何判断一个钱包地址是否有访问权限
```

在完整 Unlock Protocol 中，会员通常和 NFT key、lock、checkout、paywall 等功能有关。

本项目先只保留最核心的一步：

```solidity
membershipExpiresAt[user] > block.timestamp
```

也就是：

```txt
这个地址的会员到期时间是否还在未来
```

如果结果是 `true`，页面显示：

```txt
unlocked
```

如果结果是 `false`，页面显示：

```txt
locked
```

## 合约说明

### MiniMembership.sol

文件：

```txt
contracts/MiniMembership.sol
```

这是学习版合约，用最简单的布尔值保存会员状态：

```solidity
mapping(address => bool) public members;
```

含义：

```txt
members[user] = true   表示 user 是会员
members[user] = false  表示 user 不是会员
```

核心函数：

```solidity
function setMember(address user, bool isMember) public
```

作用：

```txt
设置某个地址是否是会员。
```

当前学习版没有 owner 权限控制，所以任何人都可以调用 `setMember`。这适合学习 mapping 和状态读取，但不是正式业务写法。

```solidity
function hasValidMembership(address user) public view returns (bool)
```

作用：

```txt
查询某个地址是不是会员。
```

### MembershipLock.sol

文件：

```txt
contracts/MembershipLock.sol
```

这是当前项目的核心合约。

它不再用简单的 `bool` 判断会员，而是记录会员到期时间：

```solidity
mapping(address => uint256) public membershipExpiresAt;
```

含义：

```txt
membershipExpiresAt[user] 是 user 的会员到期时间戳。
```

判断会员是否有效：

```solidity
membershipExpiresAt[user] > block.timestamp
```

核心状态变量：

```solidity
address public owner;
```

含义：

```txt
owner 是合约管理员。
部署合约的人会在 constructor 中被设置为 owner。
```

核心函数：

```solidity
constructor()
```

作用：

```txt
部署时执行一次，把 msg.sender 保存为 owner。
```

```solidity
function grantMembership(address user, uint256 duration) public
```

作用：

```txt
owner 给指定 user 授予指定时长的会员。
duration 单位是秒。
```

权限限制：

```solidity
require(msg.sender == owner, "Only owner can grant");
```

也就是说：

```txt
只有 owner 可以调用 grantMembership。
非 owner 调用会 revert。
```

当前实现会直接覆盖旧的到期时间：

```solidity
membershipExpiresAt[user] = block.timestamp + duration;
```

它不是“在原有会员时长上续费”，而是“从当前时间重新设置一个到期时间”。

```solidity
function purchaseMembership() public
```

作用：

```txt
用户自己调用，为自己开通 30 天会员。
```

当前实现：

```solidity
membershipExpiresAt[msg.sender] = block.timestamp + 30 days;
```

注意：当前版本是学习版购买函数，不收 ETH。

它目前没有：

```txt
payable
price
msg.value 检查
withdraw
事件 event
```

```solidity
function hasValidMembership(address user) public view returns (bool)
```

作用：

```txt
查询 user 当前是否拥有有效会员。
```

这是前端当前已经调用的核心读取函数。

## 前端说明

前端主文件：

```txt
frontend/src/App.tsx
```

当前前端已经实现：

1. `Connect Wallet` 按钮
2. 通过 MetaMask 请求钱包授权
3. 保存当前钱包地址 `walletAddress`
4. `Check Membership` 按钮
5. 使用 viem 创建 `publicClient`
6. 通过 `readContract` 调用 `hasValidMembership(address)`
7. 根据链上返回结果显示 `locked` 或 `unlocked`
8. 钱包未连接时提示 `Please connect wallet first`
9. MetaMask 未安装时提示 `MetaMask is not installed`
10. 合约读取失败时提示 `Fail to read Membership from contract`

当前前端读取的 RPC：

```txt
http://127.0.0.1:8545
```

当前前端读取的合约地址来自：

```txt
frontend/src/config.ts
```

示例：

```ts
export const MEMBERSHIP_LOCK_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
```

注意：这个地址是本地部署地址。每次重启 `hardhat node` 后，本地链会重置，需要重新部署合约，并确认这里的地址和部署输出一致。

当前前端 ABI 文件：

```txt
frontend/src/abi/MembershipLockAbi.ts
```

目前 ABI 只包含：

```txt
hasValidMembership(address)
```

因此当前前端只能读取会员状态，还不能发起购买会员交易。

### 关于 `@ts-ignore`

`frontend/src/App.tsx` 中 `readContract` 调用前有一行：

```ts
// @ts-ignore viem type inference is stricter than this local demo needs.
```

原因是 viem 的 TypeScript 类型推断在当前简化 ABI 写法下比较严格，VS Code 会在 `readContract` 参数处显示类型红线。

实际运行和构建已经可以通过。这里先用 `@ts-ignore` 压掉编辑器红线，保持当前学习流程继续推进。

后续更规范的做法是：

1. 使用完整类型化 ABI
2. 或使用 viem/codegen 生成类型
3. 或把合约 ABI 从 artifacts 中统一导出

## 本地完整运行流程

建议打开 3 个 PowerShell 窗口。

### 1. 启动 Hardhat 本地链

第一个窗口：

```powershell
cd D:\unlock-mini-dapp
npx.cmd hardhat node
```

保持这个窗口不要关闭。

它会启动本地区块链：

```txt
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
```

它也会打印一批本地测试账号和 private key。这些账号只用于本地开发，不要放真实资产。

### 2. 部署 MembershipLock 合约

第二个窗口：

```powershell
cd D:\unlock-mini-dapp
npx.cmd hardhat run scripts/deploy-membership-lock.ts
```

成功后会打印：

```txt
MembershipLock deployed to: 0x...
```

把打印出来的地址复制到：

```txt
frontend/src/config.ts
```

确保：

```ts
export const MEMBERSHIP_LOCK_ADDRESS = "刚刚部署出来的地址";
```

和部署输出完全一致。

### 3. 启动前端

第三个窗口：

```powershell
cd D:\unlock-mini-dapp\frontend
npm.cmd run dev
```

打开浏览器：

```txt
http://localhost:5173
```

### 4. 配置 MetaMask

在 MetaMask 添加或切换到本地网络：

```txt
Network name: Hardhat Localhost
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency symbol: ETH
```

然后从 `npx hardhat node` 输出中复制一个测试账号 private key，导入 MetaMask。

导入后的账号通常显示为：

```txt
Imported Account 1
```

这个账号会有很多本地测试 ETH。

### 5. 前端检查会员状态

在网页中：

1. 点击 `Connect Wallet`
2. MetaMask 弹窗确认连接
3. 页面显示钱包地址
4. 点击 `Check Membership`

如果当前地址还不是会员，页面会显示：

```txt
Current status: locked
```

这不是错误。它说明：

```txt
前端已经成功读取合约，但合约返回 false。
```

如果出现：

```txt
Fail to read Membership from contract
```

优先检查：

1. `hardhat node` 是否还在运行
2. MetaMask 是否切到 `Hardhat Localhost`
3. `frontend/src/config.ts` 中的合约地址是否和部署输出一致
4. `App.tsx` 中是否没有重新加回 `authorizationList: []`

## 如何让页面从 locked 变 unlocked

当前前端还没有购买会员按钮，所以需要先用控制台或脚本给当前钱包开会员。

一种方式是使用 Hardhat console：

```powershell
cd D:\unlock-mini-dapp
npx.cmd hardhat console --network localhost
```

进入控制台后：

```js
const lock = await ethers.getContractAt("MembershipLock", "你的合约地址")
```

给当前钱包地址开会员：

```js
await lock.grantMembership("你的钱包地址", 60 * 60)
```

这里的 `60 * 60` 表示 1 小时。

然后检查：

```js
await lock.hasValidMembership("你的钱包地址")
```

如果返回：

```txt
true
```

回到前端，点击 `Check Membership`，页面应该显示：

```txt
Current status: unlocked
```

## 测试说明

### MembershipLock 测试

文件：

```txt
test/MembershipLock.ts
```

当前包含 6 个测试：

1. 部署者应该是 owner
2. 默认情况下用户不是会员
3. owner 可以授予会员
4. owner 授权后用户变成有效会员
5. 非 owner 不能授予会员
6. 用户调用 `purchaseMembership()` 后变成有效会员

### MiniMembership 测试

文件：

```txt
test/MiniMembership.ts
```

当前包含 3 个测试：

1. 默认情况下不是会员
2. `setMember(user, true)` 后是会员
3. `setMember(user, false)` 后不是会员

### Counter 测试

文件：

```txt
test/Counter.ts
contracts/Counter.t.sol
```

这是 Hardhat 模板自带的示例测试，不属于会员 DApp 主线，但当前仍保留在项目里。

### 运行测试

运行全部测试：

```powershell
cd D:\unlock-mini-dapp
npx.cmd hardhat test
```

运行单个测试文件：

```powershell
npx.cmd hardhat test test/MembershipLock.ts
npx.cmd hardhat test test/MiniMembership.ts
```

注意：根目录 `package.json` 里的 `npm test` 目前仍是占位脚本：

```json
"test": "echo \"Error: no test specified\" && exit 1"
```

所以当前应该使用：

```powershell
npx.cmd hardhat test
```

而不是：

```powershell
npm.cmd test
```

## 前端构建

进入前端目录：

```powershell
cd D:\unlock-mini-dapp\frontend
```

开发模式：

```powershell
npm.cmd run dev
```

生产构建：

```powershell
npm.cmd run build
```

## 当前 Demo 流程

当前已经跑通的流程：

```txt
启动 hardhat node
部署 MembershipLock
更新 frontend/src/config.ts 合约地址
启动 Vite 前端
MetaMask 切换 Hardhat Localhost
导入 Hardhat 测试账号
点击 Connect Wallet
点击 Check Membership
页面显示 locked 或 unlocked
```

当前已验证的含义：

```txt
locked   = 合约读取成功，但当前地址没有有效会员
unlocked = 合约读取成功，当前地址拥有有效会员
```

## 和 Unlock Protocol 的关系

Unlock Protocol 是完整的会员协议，通常包含：

1. NFT membership key
2. Lock 管理
3. key 购买
4. key 转让
5. 续费与过期
6. Paywall UI
7. Checkout
8. 多链部署
9. 价格、收益提取和权限管理

本项目只实现最小核心思想：

```txt
判断一个地址是否有有效会员
```

当前合约用到的核心判断是：

```solidity
membershipExpiresAt[user] > block.timestamp
```

## 当前限制

当前项目仍是学习版，主要限制包括：

1. `purchaseMembership()` 不收费
2. 没有 `payable`
3. 没有 `price`
4. 没有 `msg.value` 校验
5. 没有提现函数
6. 没有事件日志，例如 `MembershipGranted`、`MembershipPurchased`
7. 没有前端购买会员按钮
8. 没有前端写合约交易流程
9. 没有监听 MetaMask 账户切换
10. 没有监听 MetaMask 网络切换
11. 合约地址需要手动复制到 `frontend/src/config.ts`
12. 当前只适配本地 Hardhat 链
13. 中文注释在部分终端中可能显示乱码，但不影响代码运行
14. `Counter` 相关文件仍是模板残留，不属于主线功能

## 下一步建议

最应该做的下一步是：

```txt
让前端支持购买会员交易
```

推荐顺序：

1. 在 ABI 中加入 `purchaseMembership()`
2. 在前端创建 wallet client
3. 添加 `Purchase Membership` 按钮
4. 点击按钮时调用 `purchaseMembership()`
5. MetaMask 弹出交易确认
6. 等待交易上链
7. 自动重新调用 `hasValidMembership(address)`
8. 页面从 `locked` 变成 `unlocked`

完成这一步后，项目就从“只读会员状态”升级成：

```txt
用户连接钱包 -> 用户购买会员 -> 合约写入会员时间 -> 前端读取并解锁
```

再往后可以继续做：

1. 给 `purchaseMembership()` 增加 ETH 支付
2. 增加会员价格 `price`
3. 增加 owner 提现
4. 增加事件
5. 增加测试覆盖支付逻辑
6. 增加 Sepolia 部署
7. 优化前端 UI
8. 清理模板残留文件

## 当前总结

当前项目已经完成了一个 mini membership gating DApp 的核心读取闭环：

```txt
真实钱包地址
  -> 本地链合约
  -> hasValidMembership(address)
  -> locked / unlocked 页面状态
```

下一阶段的核心目标是补上写入闭环：

```txt
Purchase Membership
  -> MetaMask 交易
  -> purchaseMembership()
  -> membershipExpiresAt[msg.sender] 更新
  -> 页面显示 unlocked
```
