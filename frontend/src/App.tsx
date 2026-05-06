//useState状态变化 locked/unlocked
import { useState } from 'react'

import { createPublicClient, http, type Address } from 'viem';
import { hardhat } from "viem/chains";

// 引入 MembershipLock 合约的 ABI
import { MEMBERSHIP_LOCK_ABI } from "./abi/MembershipLockAbi";

// 这个地址告诉前端：合约部署在哪里
import { MEMBERSHIP_LOCK_ADDRESS } from "./config";

import './App.css'


type AccessState = "locked" | "unlocked";

// EthereumProvider = MetaMask 注入的 ethereum 对象起的类型名字
type EthereumProvider = {
  //eth_requestAccounts : 请求用户授权当前网站访问钱包账户
  request: (args: { method: "eth_requestAccounts"}) => Promise<string[]>;
};

//扩展全局 Window 类型。告诉ts : window 上可能存在 ethereum
declare global {
    interface Window {

      //? 可能存在 可能不存在
    ethereum?: EthereumProvider;
    }
  }

  // publicClient 用来读取链上公开数据，不需要钱包签名

  const publicClient = createPublicClient({
    chain: hardhat,

      // 指定 RPC 地址。
    transport: http("http://127.0.0.1:8545"),
  });
  

// 创建一个页面状态 accessState: 初始值是 "locked"
// setAccessState 用来修改这个状态，修改后 React 会自动刷新页面

function App() {
const [accessState, setAccessState] = useState<AccessState>("locked");
const [walletAddress, setWalletAddress]= useState<Address | null>(null);
//保存连接钱包时的错误信息。初始为null
const [walletError, setWalletError]= useState<string | null>(null);
const [membershipError, setMembershipError] = useState<string | null>(null);
//当前是否正在检查会员状态:isCheckMembership
const [isCheckMembership, setIsCheckingMembership] = useState(false);


async function handleConnectWallet(){
  //每次重新连接钱包前，先清空旧错误
  setWalletError(null);
  if (window.ethereum === undefined){
    setWalletError("MetaMask is not installed");
    return;
  }

  //请求用户授权当前网站访问钱包账户

  try {
    const accounts = await window.ethereum.request({
    method: "eth_requestAccounts"
  });

  setWalletAddress(accounts[0]  as Address);} catch {
    setWalletError("Failed to connect wallet");
  }
}

async function handleCheckMembership() {
  setMembershipError(null);
  if(walletAddress === null){
    setAccessState("locked");

    //用户点击 Check Membership 的流程里
    setMembershipError("Please connect wallet first");

  //立刻结束handleCheckMembership 函数
    return;
  }
    setIsCheckingMembership(true);

    try{
      const membershipReadRequest = {
        //not walletAddress, is contract address: 去哪里查
        address: MEMBERSHIP_LOCK_ADDRESS as Address,
        abi: MEMBERSHIP_LOCK_ABI,
        functionName: "hasValidMembership",
        //walletAddress: 查谁
        args: [walletAddress as Address],
        //本项目非必须, 当前 membership readContract 逻辑本身不依赖它
        authorizationList: [], 
      } as const;

      const isMember = await publicClient.readContract(membershipReadRequest);

      setAccessState(isMember ? "unlocked" : "locked");
    }catch {
      setMembershipError("Fail to read Membership from contract");

      setAccessState("locked");
    }finally {
      //查询结束
      setIsCheckingMembership(false);
    }
  
}

//JSX
  return (
    <main>
      <h1>Unlock Mini DApp</h1>

      {/*If left is null - not connected, else left*/}
      <p>Wallet: {walletAddress ?? "not connected"}</p> 

    {/*react 中 && 可以条件显示 true就显示右边, false不显示*/}
    {/* 如果 walletError 不是 null, 就显示错误信息 */}
      
      {walletError !== null && <p>{walletError}</p>}
      {membershipError !== null && <p>{membershipError}</p>}

      <p>Current status: {accessState}</p>

      <button type="button" 
      onClick={handleCheckMembership}

      //if isCheckMembership is true, 按钮禁用
      disabled={isCheckMembership}
      >
        {isCheckMembership ? "Check..." : "Check Membership"}
      </button>
      {/*if (isCheckMembership) {
           按钮文字 = "Checking..."
      } else {
           按钮文字 = "Check Membership"}*/}

        <button type="button" onClick={handleConnectWallet}>
        Connect Wallet
      </button>
    </main>
  )
}

export default App

/*<button type="button" onClick = {() => setAccessState("unlocked")}>
        Check Membership
      </button> */
  