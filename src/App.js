import { useState } from 'react';
import './App.css';
import { ethers, BigNumber } from "ethers";
import Web3Modal from "web3modal";
import gen from './Gen.json';
import { Buffer } from "buffer/";
import WalletConnectProvider from "@walletconnect/web3-provider";
//import {CoinbaseWalletSDK} from "@coinbase/wallet-sdk";

window.Buffer = window.Buffer || Buffer;

const providerOptions = {

  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: "8231230ce0b44ec29c8682c1e47319f9" // required
    }
  }
  /*
  walletconnect: {
    package: CoinbaseWalletSDK, // required
    options: {
      infuraId: "8231230ce0b44ec29c8682c1e47319f9" // required
    }
  }
  */
};


const {MerkleTree} =  require('merkletreejs');
const keccak256 = require('keccak256');

const allowlist = require ('./allowlist');


const arcAddress = '0x4B396F08cDa12A9F6C0cD9cBab6bDfa06585077B';
const genAddress = '0x5f095d8F0Bb3BFC75355Be996E8aAFD5ad95B3a8';


const allowList = allowlist.allowListAddresses();

let leafNodes = allowList.map(addr => keccak256(addr));

let merkleTree = new MerkleTree(leafNodes, keccak256, {sortPairs: true});

function App() {
  const [web3Provider, setWeb3Provider] = useState(null)

  const [accounts, setAccounts] = useState ([]);
  const [isMinting, setMinting] = useState (Boolean(0));
  const [isMinted, setMinted] = useState (Boolean(0));
  const [mintAmount, setMintAmount] = useState (1);
  const [totalSupply, updateTotalSupply] = useState ([]);
  const [isTotalSupply, setTotalSupply] = useState (Boolean(totalSupply[0]));
  const [globalArcTokens,setArcTokens] = useState([]);
  const [globalGenTokens,setGenTokens] = useState([]);
  const [globalNotMinted,setNotMinted] = useState([]);

  const connectAccount = async () => { 
    try {
      const web3Modal = new Web3Modal({
        cacheProvider: false, // optional
        providerOptions // required
      });
      const instance = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(instance);
      console.log(provider)
      const signer = provider.getSigner();
      const address = (await signer.getAddress()).toLowerCase();
      setAccounts(address)
      if(provider) {
        setWeb3Provider(provider)
      }

      let arcTokensOwned = []
      let genTokensOwned = []
      let genTokensNotMinted = []

      const arcURL = 'https://api.etherscan.io/api?module=account&action=tokennfttx&contractaddress='+arcAddress+'&address='+address+'&page=1&offset=100&startblock=0&endblock=27025780&sort=asc&apikey=S3KASSMNT3ARZHEUU2NM9G3IMXH98BB8W7'
        await fetch(arcURL)
          .then((response) => { return response.json();})
          .then((data) => {
            for(let i = 0; i < data.result.length; i++) {
              const owner = data.result[i]['to'];
              if (owner === address) {
                arcTokensOwned.push(data.result[i]['tokenID']);
              } else {
                console.log("err");
              };
              
            }
          });
          console.log(arcTokensOwned)

          const genURL = 'https://api-goerli.etherscan.io/api?module=account&action=tokennfttx&contractaddress='+genAddress+'&address='+address+'&page=1&offset=100&startblock=0&endblock=27025780&sort=asc&apikey=S3KASSMNT3ARZHEUU2NM9G3IMXH98BB8W7'
        await fetch(genURL)
          .then((response) => { return response.json();})
          .then((data) => {
            for(let i = 0; i < data.result.length; i++) {
              const owner = data.result[i]['to'];
              if (owner === address) {
                genTokensOwned.push(data.result[i]['tokenID']);
              } else {
                console.log("err");
              };
              
            }
          });
          console.log(genTokensOwned)
        genTokensNotMinted.push.apply(genTokensNotMinted,arcTokensOwned);
        
        for(let i = 0; i < genTokensOwned.length; i++) {
          let tokenID = genTokensOwned[i];
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

    } catch (error) {
      console.error(error)
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

    const provider = web3Provider;
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
        genAddress,
        gen.abi,
        signer
    );
    console.log(contract)
    try {
        const response = await contract.totalSupply();
        const hex = response['_hex']
        const maxSupply =  parseInt(hex,16)
        updateTotalSupply(maxSupply)
        setTotalSupply(Boolean(maxSupply))
        //alert(`${response}/6000 Gen-0 characters have been Minted!`);
        
    } 
    catch (err) {
        console.log('error', err )
    }

}

  async function handleGenMint() {
    setMinting(Boolean(1));
    setMinted(Boolean(0));
    if (web3Provider) {
      const provider = web3Provider;
      const signer = provider.getSigner();
      const address = (await signer.getAddress()).toLowerCase();
            console.log(address)
      let index = null
      if (allowList.includes(address)) {
        index = allowList.indexOf(address)
      }
      //for(let i =0; i < allowList.length; i++) {
      //  if ( address.toLowerCase() === allowList[i] ) {
      //    index = i
      //    return
      //  } 
      //}
      console.log(index)
      
      const genContract = new ethers.Contract(
        genAddress,
        gen.abi,
        signer
      );
      if (index === -1) {
        alert('You must be allowlisted to mint these Gen-0 Characters');
        return;
    } else {
      try {
        if (globalNotMinted.length === 0) {
          setMinting(Boolean(0));
          return;
        } else {
          // shuffle tokenNull array 
          //let tokenRandom = globalNotMinted.sort(function () {
          //  return Math.random() - 0.5;
          //});
          //console.log(tokenRandom)
          if (mintAmount > globalNotMinted.length) {
            return;
          } else {
            //const split = tokenRandom.splice(mintAmount); 
            //console.log(split)
            //console.log(tokenRandom)
            
            let clamingAddress = leafNodes[index];
            let hexProof = merkleTree.getHexProof(clamingAddress);

            const response = await genContract.arcListMint(ethers.BigNumber.from(mintAmount), hexProof)
            //const confirm = await response.wait(confirmations)

            
            
            setNotMinted('tokenMinted')
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
  }

  return (
    
    <div className="App">
      <div className="container">
        <div className="heightBox">
        <div className='feed'>
        <div>
          {web3Provider == null ? (
            <p className='paragraphs'>Please connect your wallet to mint</p>
          ) : (
            <p className='inactive'>Please connect your wallet to mint</p>
          )
          }
        </div>

        <p className="inactive">
          {(web3Provider != null) && (<span>Connected.</span>) }
          {(web3Provider != null && globalArcTokens.length===0) && (<span> You must hold Arcturium to mint. Public mint opens 2:00 pm EST 24/09/2022</span>)}
          { (web3Provider != null && globalNotMinted.length>0) && (<span>You have {globalNotMinted.length} Gen-0 available to mint.</span>)}
          
          </p>
        
        {totalSupply > 0 && <div> <p className='inactive'> {totalSupply} of 6000 Gen-0 Characters have been minted.</p></div>}
        <p className='inactive'>{(isMinting && Boolean(globalArcTokens) ) && <span>Waiting on confirmation...</span>} {isMinted && <span>Minting...</span>}</p>
        {(isMinting && !Boolean(globalArcTokens)) && <p className='inactive'>Mint cancelled. You must hold Arcturium to mint. Public mint opens 2:00 pm EST 24/09/2022</p>}
        {(web3Provider != null && globalNotMinted.length === 0) && <p className='inactive'>You have minted all available Gen-0. Public mint opens 2:00 pm EST 24/09/2022 </p>}
        



        <span className="rectangleblink">&#9646;</span>
        { web3Provider == null && (
              <p className="button" onClick={connectAccount}><span className="check">>></span>| Connect</p>
          )}
        </div>
        <div>
          {(web3Provider != null && globalNotMinted.length > 0) &&  ( 
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
          {(web3Provider != null && globalNotMinted===0) && <p>All of your Arcturium has been redeemed already. Public mint opens 2:00 pm EST 24/09/2022</p>}
        </div>
      </div>
      </div>
    </div>
  );
}

export default App;
