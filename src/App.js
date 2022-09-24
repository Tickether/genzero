import { useState } from 'react';
import './App.css';
import { ethers } from "ethers";
import arc from './Arc.json'
import gen from './Gen.json'


const arcAddress = '0xf710F3e8bE1180a3a4863330D5009278e799d4A8';
const genAddress = '0xBcBA7755Ec71837E7871b324faDEb0AACdb07444';

function App() {
  const [accounts, setAccounts] = useState ([]);
  const isConnected = Boolean(accounts[0]);
  const [isMinting,setMinting] = useState(Boolean(0));
  const [isMinted,setMinted] = useState(Boolean(0));
  const [isArcHolder,setArcHolder] = useState(Boolean(0));
  const [mintAmount, setMintAmount] = useState(1);
  const [totalSupply,updateTotalSupply] = useState([]);
  const [isTotalSupply,setTotalSupply] = useState(Boolean(totalSupply[0]));
  const [gtokensOwned,setTokensOwned] = useState([]);
  const [gtokensNotMinted,setNotMinted] = useState([]);

  async function connectAccount() {
    if (window.ethereum) {
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts',
        });
        setAccounts(accounts);
        
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = (await signer.getAddress()).toString();
        const genContract = new ethers.Contract(
          genAddress,
          gen.abi,
          signer
        );
        const arcContract = new ethers.Contract(
          arcAddress,
          arc.abi,
          signer
        );
        setArcHolder(Boolean(gtokensOwned[0]));
        try {
          for(let i = 0; i < 6; i++) {
            const owner = await arcContract.ownerOf(i);
            if (owner === address) {
              setTokensOwned(i);
              setArcHolder(Boolean(gtokensOwned[0]))
            } else {
              return;
            }
          }
          console.log(gtokensOwned.length)
          for(let i = 0; i < gtokensOwned.length; i++){
            const isMinted = await genContract.isMinted(i);
            if (isMinted === false) {
              let x = gtokensNotMinted;
              x.push(gtokensOwned[i]);
              setNotMinted(x);
            }
          }
        } 
        catch (err) {
            console.log('error', err )
        }
    }
  }

  const handleDecrement = () => {
    if (mintAmount <= 1 ) return;
    setMintAmount(mintAmount - 1);
  };

  const handleIncrement = () => {
    if (mintAmount >= gtokensNotMinted.length ) return;
    setMintAmount(mintAmount + 1);
  };
  
  async function getTotalSupply() {
        
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const genContract = new ethers.Contract(
        genAddress,
        gen.abi,
        signer
    );
    try {
        const response = await genContract.totalSupply();
        updateTotalSupply(ethers.utils.formatUnits(response,0));
        setTotalSupply(Boolean(totalSupply));
    } 
    catch (err) {
        console.log('error', err )
    }

  }
  async function handleGenMint() {
    setMinting(Boolean(1));
    setMinted(Boolean(0));
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const genContract = new ethers.Contract(
        genAddress,
        gen.abi,
        signer
      );
      setArcHolder(Boolean(gtokensOwned[0]));
      try {
        if (gtokensNotMinted.length === 0) {
          return;
        } else {
          // shuffle tokenNull array 
          let tokenRandom = gtokensNotMinted.sort(function () {
            return Math.random() - 0.5;
          });
          console.log(tokenRandom)
          if (mintAmount > tokenRandom.length) {
            return;
          } else {
            const split = tokenRandom.splice(mintAmount); 
            console.log(split)
            console.log(tokenRandom)
        
            const response = await genContract.mintGen(tokenRandom);
            console.log('response: ', response) 
            setMinting(Boolean(0));
            setMinted(Boolean(1))
          }
        }
        connectAccount();
      } 
      catch (err) {
          console.log('error', err )
      }
    }
  }

  return (
    
    <div className="App">
      <div className="container">
        <div className="heightBox">
        <div className='feed'>
        <div>
          {!isConnected ? (
            <p className='paragraphs'>Please connect your wallet to mint</p>
          ) : (
            <p className='inactive'>Please connect your wallet to mint</p>
          )
          }
        </div>

        <p className="inactive">
          {(isConnected) && (<span>Connected.</span>) }
          {(isConnected && gtokensNotMinted.length===0) && (<span> You must hold Arcturium to mint. Public mint opens 2:00 pm EST 24/09/2022</span>)}
          { (isConnected && gtokensNotMinted.length>0) && (<span>You have {gtokensNotMinted.length} Gen-0 available to mint.</span>)}
          
          </p>
        
        {isTotalSupply && <div> <p className='inactive'> {totalSupply} of 6000 Gen-0 Characters have been minted.</p></div>}
        <p className='inactive'>{(isMinting && isArcHolder ) && <span>Minting...</span>} {isMinted && <span>Minted.</span>}</p>
        {(isMinting && !isArcHolder) && <p className='inactive'>Minting cancelled. You must hold Arcturium to mint. Public mint opens 2:00 pm EST 24/09/2022</p>}
        



        <span className="rectangleblink">&#9646;</span>
        { !isConnected && (
              <p className="button" onClick={connectAccount}><span className="check">>></span>| Connect</p>
          )}
        </div>
        <div>
          {(isConnected && isArcHolder) &&  ( 
            <div className="mintControls">
              <div>
                <p><span className='button'
                    onClick={handleDecrement}><i className="downArrow"></i>
                    </span>
                <input 
                  readOnly
                  type='number' 
                  value={mintAmount}/>
                <span className='button'
                  onClick={handleIncrement}><i className="upArrow"></i>
                  </span>
                </p>
              </div>
              <p className='mintButtons'>
                <span className='button' 
                onClick={handleGenMint}><span className="check">>></span>| Mint Now
              </span> <br></br>
              <span className='button' 
                onClick={getTotalSupply}><span className="check">>></span>| #Minted?
                </span>
              </p>
            </div>
          ) }
          {(isConnected && gtokensNotMinted===0) && <p>All of your Arcturium has been redeemed already. Public mint opens 2:00 pm EST 24/09/2022</p>}
        </div>
      </div>
      </div>
    </div>
  );
}

export default App;
