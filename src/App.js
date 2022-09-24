import { useState } from 'react';
import './App.css';
import { ethers } from "ethers";
import arc from './Arc.json';
import gen from './Gen.json';

const arcAddress = '0x4B396F08cDa12A9F6C0cD9cBab6bDfa06585077B';
const genAddress = '0x7a6B8E86677A226deAcCF971FbA0F0dD78FfEE8A';

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
    let  arcTokensOwned = [];
    let  genTokensOwned = [];
    let genTokensNotMinted =  [];
    if (window.ethereum) {
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts',
        });
        setAccounts(accounts);

        const arcURL = 'https://api.etherscan.io/api?module=account&action=tokennfttx&contractaddress='+arcAddress+'&address='+accounts[0]+'&page=1&offset=100&startblock=0&endblock=27025780&sort=asc&apikey=S3KASSMNT3ARZHEUU2NM9G3IMXH98BB8W7'
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
          console.log(arcTokensOwned)

          const genURL = 'https://api-goerli.etherscan.io/api?module=account&action=tokennfttx&contractaddress='+genAddress+'&address='+accounts[0]+'&page=1&offset=100&startblock=0&endblock=27025780&sort=asc&apikey=S3KASSMNT3ARZHEUU2NM9G3IMXH98BB8W7'
        await fetch(genURL)
          .then((response) => { return response.json();})
          .then((data) => {
            console.log(data)
            for(let i = 0; i < data.result.length; i++) {
              const owner = data.result[i]['to'];
              if (owner === accounts[0]) {
                genTokensOwned.push(data.result[i]['tokenID']);
              } else {
                console.log("err");
              };
              
            }
          });
        genTokensNotMinted.push.apply(genTokensNotMinted,arcTokensOwned);
        
        for(let i = 0; i < genTokensOwned.length; i++) {
          let tokenID = genTokensOwned.map(Number)[i];
          if (arcTokensOwned.includes(tokenID)) {
            let index = genTokensNotMinted.indexOf(tokenID)
            genTokensNotMinted.splice(index,1)
          } else {
            console.log('err');
          }
        };
        console.log(genTokensNotMinted)
        setArcTokens(arcTokensOwned)
        setGenTokens(genTokensOwned)
        setNotMinted(genTokensNotMinted)

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
          
            const response = await genContract.mintPublicGen((tokenRandom), {value: ethers.utils.parseEther((0.000 * mintAmount).toString())})
            
            console.log('response: ', response) 
            setNotMinted(split)
            setMinting(Boolean(0));
            setMinted(Boolean(1))

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
        <p className='inactive'>{(isMinting && Boolean(globalArcTokens) ) && <span>Waiting on confirmation...</span>} {isMinted && <span>Minting...</span>}</p>
        {(isMinting && !Boolean(globalArcTokens)) && <p className='inactive'>Mint cancelled. You must hold Arcturium to mint. Public mint opens 2:00 pm EST 24/09/2022</p>}
        



        <span className="rectangleblink">&#9646;</span>
        { !isConnected && (
              <p className="button" onClick={connectAccount}><span className="check">>></span>| Connect</p>
          )}
        </div>
        <div>
          {(isConnected && globalArcTokens.length > 0) &&  ( 
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
