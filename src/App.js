import { useState } from 'react';
import './App.css';
import { ethers } from "ethers";
import Onboard from '@web3-onboard/core'
import injectedModule from '@web3-onboard/injected-wallets'
//import ledgerModule from '@web3-onboard/ledger'
import arc from './Arc.json';
import gen from './Gen.json';
import { Buffer } from "buffer/";

import walletConnectModule from '@web3-onboard/walletconnect'
window.Buffer = window.Buffer || Buffer;



const walletConnect = walletConnectModule()
//const ledger = ledgerModule()

//const {MerkleTree} =  require('merkletreejs');
//const keccak256 = require('keccak256');


//const allowlist = require ('./allowlist');


const arcAddress = '0x4B396F08cDa12A9F6C0cD9cBab6bDfa06585077B';
const genAddress = '0x5f095d8f0bb3bfc75355be996e8aafd5ad95b3a8';


//const allowList = allowlist.allowListAddresses();

//let leafNodes = allowList.map(addr => keccak256(addr));

//let merkleTree = new MerkleTree(leafNodes, keccak256, {sortPairs: true});

function App() {
  //const [accounts, setAccounts] = useState([]);
  const accounts = []
  const [isConnected, setConnected] = useState(Boolean(0));
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
    const MAINNET_RPC_URL = 'https://mainnet.infura.io/v3/a38f564330de45c8b14056143c2fcd32'
        const injected = injectedModule()
        const onboard = Onboard({
          wallets: [
            injected,
            walletConnect,
            //ledger
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
            icon: '../src/assets/backgrounds/favicon-32x32.png', // svg string icon
            logo: '../src/assets/backgrounds/logo.png', // svg string logo
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
        accounts.push(account)
        console.log(accounts[0])
        console.log(account)

        

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
    let account = accounts[0]
    const provider =new ethers.providers.Web3Provider(account.provider, 'any');

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
    if (Boolean(accounts[0])) {
      const provider = ethers.getDefaultProvider(['goerli'])
      const signer = provider.getSigner();
      const address = (await signer.getAddress());
            console.log(address)
      //let index = null
      //for(let i =0; i < allowList.length; i++) {
      //  if (allowList[i] == address) {
      //    index = i
      //    console.log('yay!')
      //  } else {
      //    index = -1
      //  }
      //}
      //console.log(typeof(allowList[0]))
      
      const genContract = new ethers.Contract(
        genAddress,
        gen.abi,
        signer
      );
      //if (index === -1) {
      //  alert('You must be allowlisted to mint these Gen-0 Characters');
      //  return;
    //} else {
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
            
            //let clamingAddress = leafNodes[index];
            //let hexProof = merkleTree.getHexProof(clamingAddress);

            const response = await genContract.mintPublicGen(tokenRandom, {value: ethers.utils.parseEther((0.000 * mintAmount).toString())})
            
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
    //}
      
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
          {(isConnected) && (<span>Connected. </span>) }
          {(isConnected && globalArcTokens.length===0) && (<span> You must hold Arcturium to mint. Public mint opens 2:00 pm EST 24/09/2022</span>)}
          { (isConnected && globalNotMinted.length>0) && (<span>You have {globalNotMinted.length} Gen-0 available to mint.</span>)}
          
          </p>
        
        {isTotalSupply && <div> <p className='inactive'> {totalSupply} of 6000 Gen-0 Characters have been minted.</p></div>}
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
          {(isConnected && globalNotMinted===0) && <p>All of your Arcturium has been redeemed already. Public mint opens 2:00 pm EST 24/09/2022</p>}
        </div>
      </div>
      </div>
    </div>
  );
}

export default App;
