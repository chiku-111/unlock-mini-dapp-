//useState状态变化 locked/unlocked
import { useState } from 'react'
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

// 创建一个页面状态 accessState: 初始值是 "locked"
// setAccessState 用来修改这个状态，修改后 React 会自动刷新页面

function App() {
const [accessState, setAccessState] = useState<AccessState>("locked");
const [walletAddress, setWalletAddress]= useState<string | null>(null);
//保存连接钱包时的错误信息。初始为null
const [walletError, setWalletError]= useState<string | null>(null);

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
  setWalletAddress(accounts[0]);} catch {
    setWalletError("Failed to connect wallet");
  }
}

function handleCheckMembership() {
  if(walletAddress === null){
    setAccessState("locked");
  //立刻结束handleCheckMembership 函数
    return;
  }else{
      setAccessState("unlocked");
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

      <p>Current status: {accessState}</p>

      <button type="button" onClick={handleCheckMembership}>
        Check Membership
      </button>

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
  