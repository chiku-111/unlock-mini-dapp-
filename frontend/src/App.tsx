//useState状态变化 locked/unlocked
import { useState } from 'react'
import './App.css'

type AccessState = "locked" | "unlocked";


// 创建一个页面状态 accessState: 初始值是 "locked"
// setAccessState 用来修改这个状态，修改后 React 会自动刷新页面。
function App() {
const [accessState, setAccessState] = useState<AccessState>("locked");
const [walletAddress, setWalletAddress]=useState<string | null>(null);

function handleConnectWallet(){
  setWalletAddress("0x1234...abcd");
}

function handleCheckMembership() {
  if(walletAddress === null){
    setAccessState("locked");
  //立刻结束handleCheckMembership 函数
    return
  }else{
      setAccessState("unlocked");
  }
}

  return (
    <main>
      <h1>Unlock Mini DApp</h1>

      {/*If left is null - not connected, else left*/}
      <p>Wallet: {walletAddress ?? "not connected"}</p> 

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
  