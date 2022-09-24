import { useState } from 'react';
import './App.css';
import { ethers } from "ethers";
import arc from './Arc.json';
import gen from './Gen.json';

const arcAddress = '0xf710F3e8bE1180a3a4863330D5009278e799d4A8';
const genAddress = '0xBcBA7755Ec71837E7871b324faDEb0AACdb07444';

function App() {
  const [accounts, setAccounts] = useState ([]);
  const [scanData, setData] = useState ([]);
  const isConnected = Boolean(accounts[0]);
  const [isMinting, setMinting] = useState (Boolean(0));
  const [isMinted, setMinted] = useState (Boolean(0));
  const [mintAmount, setMintAmount] = useState (1);
  const [totalSupply, updateTotalSupply] = useState ([]);
  const [isTotalSupply, setTotalSupply] = useState (Boolean(totalSupply[0]));
  const [globalArcTokens,setArcTokens] = useState([]);
  const [globalGenTokens,setGenTokens] = useState([]);
  const [globalNotMinted,setNotMinted] = useState([]);

 

  async function connectAccount() {
    const  arcTokensOwned = [];
    const  genTokensOwned = [];
    const genTokensNotOwned =  [];
    if (window.ethereum) {
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts',
        });
        setAccounts(accounts);

        const arcURL = 'https://api-goerli.etherscan.io/api?module=account&action=tokennfttx&contractaddress='+arcAddress+'&address='+accounts[0]+'&page=1&offset=100&startblock=0&endblock=27025780&sort=asc&apikey=S3KASSMNT3ARZHEUU2NM9G3IMXH98BB8W7'
        await fetch(arcURL)
          .then((response) => { return response.json();})
          .then((data) => {
            for(let i = 0; i < data.result.length; i++) {
              const owner = data.result[i]['to'];
              if (owner === accounts[0]) {
                arcTokensOwned.push(i);
              } else {
                console.log("err");
              };
              
            }
          });

          const genURL = 'https://api-goerli.etherscan.io/api?module=account&action=tokennfttx&contractaddress='+genAddress+'&address='+accounts[0]+'&page=1&offset=100&startblock=0&endblock=27025780&sort=asc&apikey=S3KASSMNT3ARZHEUU2NM9G3IMXH98BB8W7'
        await fetch(genURL)
          .then((response) => { return response.json();})
          .then((data) => {
            for(let i = 0; i < data.result.length; i++) {
              const owner = data.result[i]['to'];
              if (owner === accounts[0]) {
                genTokensOwned.push(i);
              } else {
                console.log("err");
              };
              
            }
            
          });
        genTokensNotOwned.push.apply(genTokensNotOwned,arcTokensOwned);
        
        for(let i = 0; i < genTokensOwned.length; i++) {
          const tokenID = genTokensOwned[i];
          if (arcTokensOwned.includes(tokenID)) {
            let index = genTokensNotOwned.indexOf(tokenID)
            genTokensNotOwned.splice(index,1)
          } else {
            console.log('err');
          }
        };
        setArcTokens(arcTokensOwned)
        setGenTokens(genTokensOwned)
        setNotMinted(genTokensNotOwned)

    }
  }

  const handleDecrement = () => {
    if (mintAmount <= 1 ) return;
    setMintAmount(mintAmount - 1);
  };

  const handleIncrement = () => {
    if (mintAmount >= globalNotMinted.length ) return;
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
      try {
        if (globalNotMinted.length === 0) {
          setMinting(Boolean(0));
          return;
        } else {
          // shuffle tokenNull array 
          let tokenRandom = globalNotMinted.sort(function () {
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
            connectAccount();
          }
        }
        
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
          {(isConnected && globalArcTokens.length===0) && (<span> You must hold Arcturium to mint. Public mint opens 2:00 pm EST 24/09/2022</span>)}
          { (isConnected && globalNotMinted.length>0) && (<span>You have {globalNotMinted.length} Gen-0 available to mint.</span>)}
          
          </p>
        
        {isTotalSupply && <div> <p className='inactive'> {totalSupply} of 6000 Gen-0 Characters have been minted.</p></div>}
        <p className='inactive'>{(isMinting && Boolean(globalArcTokens) ) && <span>Minting...</span>} {isMinted && <span>Minted.</span>}</p>
        {(isMinting && !Boolean(globalArcTokens)) && <p className='inactive'>Minting cancelled. You must hold Arcturium to mint. Public mint opens 2:00 pm EST 24/09/2022</p>}
        



        <span className="rectangleblink">&#9646;</span>
        { !isConnected && (
              <p className="button" onClick={connectAccount}><span className="check">>></span>| Connect</p>
          )}
        </div>
        <div>
          {(isConnected && Boolean(globalArcTokens)) &&  ( 
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
          {(isConnected && globalNotMinted===0) && <p>All of your Arcturium has been redeemed already. Public mint opens 2:00 pm EST 24/09/2022</p>}
        </div>
      </div>
      </div>
    </div>
  );
}

export default App;
