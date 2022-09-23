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
  const [mintAmount, setMintAmount] = useState(1);

  async function connectAccount() {
    if (window.ethereum) {
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts',
        });
        setAccounts(accounts);
    }
  }

  const handleDecrement = () => {
    if (mintAmount <= 1 ) return;
    setMintAmount(mintAmount - 1);
  };

  const handleIncrement = () => {
    if (mintAmount >= 6 ) return;
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
        alert(`${response}/3333 Crazy Tigers have been MInted!`);
        console.log('response: ', response)
    } 
    catch (err) {
        console.log('error', err )
    }

  }
  async function handleGenMint() {
    if (window.ethereum) {
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
      let tokensOwned = []
      let tokensNotMinted = []
      try {
        for(let i = 0; i < 6; i++) {
          const owner = await arcContract.ownerOf(i);
          if (owner === address) {
            tokensOwned.push(i);
          } else {
            alert('You must be owner to mint these Gen-0!!!')
            return;
          }
        }
        console.log(tokensOwned)
        for(let i = 0; i < tokensOwned.length; i++){
          const isMinted = await genContract.isMinted(i);
          if (isMinted === false) {
            tokensNotMinted.push(tokensOwned[i]);
          }
        }
        console.log(tokensNotMinted)
        if (tokensNotMinted.length === 0) {
          alert('All your owned Arc has been minted!!!')
          return;
        } else {
          // shuffle tokenNull array 
          let tokenRandom = tokensNotMinted.sort(function () {
            return Math.random() - 0.5;
          });
          console.log(tokenRandom)
          if (mintAmount > tokenRandom.length) {
            alert('You cannot mint more than your remaining Arc!!!')
            return;
          } else {
            const split = tokenRandom.splice(mintAmount); 
            console.log(split)
            console.log(tokenRandom)
        
            const response = await genContract.mintGen(tokenRandom);
            console.log('response: ', response) 
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
        <div className='connect'>
          {isConnected ? (
            <button> 
              Connected
            </button>
          ) : (
            <button onClick={connectAccount}>
              Connect
            </button>
          )}
        </div>
        <div>
          {isConnected ? (
            <div>
              <div>
                <button
                    onClick={handleDecrement}>-
                </button>
                <input 
                  readOnly
                  type='number' 
                  value={mintAmount}/>
                <button
                  onClick={handleIncrement}>+
                </button>
              </div>
              <button 
                onClick={handleGenMint}>Mint Now
              </button>
              <button 
                onClick={getTotalSupply}>#Minted?
              </button>
            </div>
          ) : (
            <p className='paragraphs'>You must be connected to mint !!! </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
