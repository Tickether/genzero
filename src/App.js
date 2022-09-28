import { useState } from 'react';
import './App.css';
import { ethers } from "ethers";
import Onboard from '@web3-onboard/core'
import injectedModule from '@web3-onboard/injected-wallets'
import ledgerModule from '@web3-onboard/ledger'
import coinbaseWalletModule from '@web3-onboard/coinbase'
//import mewModule from '@web3-onboard/mew'
import arc from './Arc.json';
import gen from './Gen.json';
import { Buffer } from "buffer/";
import Notify from "bnc-notify"

import walletConnectModule from '@web3-onboard/walletconnect'
window.Buffer = window.Buffer || Buffer;

const Web3 = require("web3");



//const mew = mewModule()

const appLogosvg = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="1362.000000pt" height="766.000000pt" viewBox="0 0 1362.000000 766.000000" preserveAspectRatio="xMidYMid meet"> <g transform="translate(0.000000,766.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none"> </g></svg>'

const appIconsvg = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="32.000000pt" height="32.000000pt" viewBox="0 0 32.000000 32.000000" preserveAspectRatio="xMidYMid meet"><g transform="translate(0.000000,32.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none"> <path d="M0 160 l0 -160 160 0 160 0 0 160 0 160 -160 0 -160 0 0 -160z m118 43 c-10 -2 -28 -2 -40 0 -13 2 -5 4 17 4 22 1 32 -1 23 -4z m120 0 c-10 -2 -28 -2 -40 0 -13 2 -5 4 17 4 22 1 32 -1 23 -4z m13 -53 c17 0 28 -3 26 -7 -3 -5 -31 -6 -64 -4 -42 2 -52 6 -38 12 11 4 26 6 33 3 8 -2 27 -4 43 -4z m-164 -6 c-3 -3 -12 -4 -19 -1 -8 3 -5 6 6 6 11 1 17 -2 13 -5z"/></g> </svg>'



const blkNtvAPIkey = '3cb54d4f-8827-424b-9360-2993dd31a6e1'

var notify = Notify({
  dappId: blkNtvAPIkey,       // [String] The API key created by step one above
  networkId: 5  // [Integer] The Ethereum network ID your Dapp uses.
});

const {MerkleTree} =  require('merkletreejs');
const keccak256 = require('keccak256');


const allowlist = require ('./allowlist');


const arcAddress = '0x4B396F08cDa12A9F6C0cD9cBab6bDfa06585077B';
const genAddress = '0x5f095d8F0Bb3BFC75355Be996E8aAFD5ad95B3a8';


const allowList = allowlist.allowListAddresses();

let leafNodes = allowList.map(addr => keccak256(addr));

let merkleTree = new MerkleTree(leafNodes, keccak256, {sortPairs: true});

function App() {
  const [accounts, setAccounts] = useState('');
  //const accounts = []
  const [isConnected, setConnected] = useState(Boolean(0));
  const [isMinting, setMinting] = useState (Boolean(0));
  const [isMinted, setMinted] = useState (Boolean(0));
  const [mintAmount, setMintAmount] = useState (1);
  const [totalSupply, updateTotalSupply] = useState ('');
  const [isTotalSupply, setTotalSupply] = useState (Boolean(totalSupply));
  const [globalArcTokens,setArcTokens] = useState([]);
  const [globalGenTokens,setGenTokens] = useState([]);
  const [globalNotMinted,setNotMinted] = useState([]);

 

  async function connectAccount() {
    let  arcTokensOwned = [];
    let  genTokensOwned = [];
    let genTokensNotMinted =  [];
    const MAINNET_RPC_URL = 'https://mainnet.infura.io/v3/a38f564330de45c8b14056143c2fcd32'
        const injected = injectedModule()
        const walletConnect = walletConnectModule()
        const ledger = ledgerModule();
        const coinbaseWalletSdk = coinbaseWalletModule({ darkMode: true })
        const onboard = Onboard({
          wallets: [
            injected,
            walletConnect,
            ledger,
            coinbaseWalletSdk,
            //mew
          ],
          chains: [
            {
              id: '0x1',
              token: 'ETH',
              label: 'Ethereum Mainnet',
              rpcUrl: MAINNET_RPC_URL
            },
            {
              id: '0x5',
              token: 'ETH',
              label: 'Ethereum Goerli Testnet',
              rpcUrl: 'https://rpc.goerli.mudit.blog/'
            },
          ],
          appMetadata: {
            name: 'Eternity Complex',
            icon: appIconsvg, // svg string icon
            logo: appLogosvg  , // svg string logo
            description: 'Mint your Eternity Complex NFTs',
            recommendedInjectedWallets: [
              { name: 'MetaMask', url: 'https://metamask.io' },
              { name: 'Coinbase', url: 'https://wallet.coinbase.com/' }
            ]
          },
        })

        const accountData = await onboard.connectWallet()
        const account = accountData[0]['accounts'][0]['address']
        setConnected(Boolean(1));
        await setAccounts(account)

        

    if (Boolean(account)) {
        //const accounts = await window.ethereum.request({
           // method: 'eth_requestAccounts',
         // });
        //-------- For wider compatibility in wallet connection -----------
        

//----------------- End wallet connection additions


        const arcURL = 'https://api.etherscan.io/api?module=account&action=tokennfttx&contractaddress='+arcAddress+'&address='+account+'&page=1&offset=100&startblock=0&endblock=27025780&sort=asc&apikey=S3KASSMNT3ARZHEUU2NM9G3IMXH98BB8W7'
        await fetch(arcURL)
          .then((response) => { return response.json();})
          .then((data) => {
            for(let i = 0; i < data.result.length; i++) {
              const owner = data.result[i]['to'];
              if (owner === account) {
                arcTokensOwned.push(data.result[i]['tokenID']);
              } else {
                console.log("err");
              };
              
            }
          });
          console.log(arcTokensOwned)

          const genURL = 'https://api-goerli.etherscan.io/api?module=account&action=tokennfttx&contractaddress='+genAddress+'&address='+account+'&page=1&offset=100&startblock=0&endblock=27025780&sort=asc&apikey=S3KASSMNT3ARZHEUU2NM9G3IMXH98BB8W7'
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
    const totalSupplyURL = 'https://api-goerli.etherscan.io/api?module=stats&action=tokensupply&contractaddress='+genAddress+'&apikey=S3KASSMNT3ARZHEUU2NM9G3IMXH98BB8W7'
    let supply = await fetch(totalSupplyURL)
          .then((response) => { return response.json();})
          .then((data) => {
           let supply = data.result
           return supply
            //setTotalSupply(Boolean(totalSupply))
            //console.log(totalSupply)
          });
          await updateTotalSupply(supply);
}

  async function handleGenMint() {
    setMinting(Boolean(1));
    setMinted(Boolean(0));
    
      let index = null
      console.log(typeof(allowList))
      if (allowList.includes(accounts.toLowerCase())) {
        index = allowList.indexOf(accounts.toLowerCase())
      } else {
        index = -1
      }
      if (Boolean(accounts)) {
      if (index === -1) {
        setMinting(0)
        alert('You must be allowlisted to mint these Gen-0 Characters');
        return;
    } else { 
      try {
      var web3 = new Web3(new Web3.providers.HttpProvider('https://rpc.goerli.mudit.blog/'));
      const provider = new ethers.providers.Web3Provider(web3.currentProvider)
      const signer = provider.getSigner(accounts);
      console.log(signer)
      //const address = (await signer.getAddress());
      //      console.log(address)
      
      
      const genContract = new ethers.Contract(
        genAddress,
        gen.abi,
        signer
      );
      console.log(genContract)
        if (globalNotMinted.length === 0) {
          setMinting(Boolean(0));
          return;
        } else {
          // shuffle tokenNull array 
          //let tokenRandom = globalNotMinted.sort(function () {
          //  return Math.random() - 0.5;
          //});
          //console.log(tokenRandom)
          //if (mintAmount > tokenRandom.length) {
          //  return;
          //} else {
          //  const split = tokenRandom.splice(mintAmount); 
          //  console.log(split)
          //  console.log(tokenRandom)
            
          let clamingAddress = leafNodes[index];
          let hexProof = merkleTree.getHexProof(clamingAddress);

            //const response = await genContract.mintPublicGen( {value: ethers.utils.parseEther((0.000 * mintAmount).toString())})
            console.log('test1')
            
            const response = await genContract.arcListMint(ethers.BigNumber.from(mintAmount), hexProof);
            console.log('test2')
            console.log('response: ', response) 
            //setNotMinted(split)
            setMinting(Boolean(0));
            setMinted(Boolean(1))

          }
        //}
        
      } 
      catch (err) {
          console.log('error', err )
      }
    }
      
    } else {
      setConnected(0)
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

        <p className="paragraphs">
          {(isConnected) && (<span>Connected. </span>) }
          {(isConnected && globalArcTokens.length===0) && (<span> You must hold Arcturium to mint. Public mint opens 2:00 pm EST 24/09/2022</span>)}
          { (isConnected && globalNotMinted.length>0) && (<span>You have {globalNotMinted.length} Gen-0 available to mint.</span>)}
          
          </p>
        
        {Boolean(totalSupply) && <div> <p className='inactive'> {totalSupply} of 6000 Gen-0 Characters have been minted.</p></div>}
        <p className='inactive'>{(isMinting && Boolean(globalArcTokens) ) && <span>Waiting on confirmation...</span>} {isMinted && <span>Minting...</span>}</p>
        {(isMinting && !Boolean(globalArcTokens)) && <p className='inactive'>Mint cancelled. You must hold Arcturium to mint. Public mint opens 2:00 pm EST 24/09/2022</p>}
        {(isConnected && globalNotMinted.length === 0 && globalArcTokens.length > 0) && <p className='inactive'>You have minted all available Gen-0. Public mint opens 2:00 pm EST 24/09/2022 </p>}
        



        <span className="rectangleblink">&#9646;</span>
        { !isConnected && (
              <p className="button" onClick={connectAccount}><span className="check">>></span>| Connect</p>
          )}
        </div>
        <div>
          {(isConnected && globalArcTokens.length > 0 && globalNotMinted.length > 0) &&  ( 
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
          {(isConnected && globalNotMinted.length===0) && <p>All of your Arcturium has been redeemed already. Public mint opens 2:00 pm EST 24/09/2022<br></br>
              <span className='button' 
                onClick={getTotalSupply}><span className="check">>></span>| #Minted?
                </span></p>}
          
        </div>
      </div>
      </div>
    </div>
  );
}

export default App;
