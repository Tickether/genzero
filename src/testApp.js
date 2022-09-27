import React, { useState } from 'react';
import Web3 from 'web3';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import Fortmatic from 'fortmatic';
import Torus from '@toruslabs/torus-embed';

const walletConnectOptions = {
    package: WalletConnectProvider, // required
    options: {
      infuraId: infuraID, // required
    },
}

const coinbaseWalletOptions = {
    package: CoinbaseWalletSDK, // Required
    options: {
        appName: 'Eternity Complex', // Required
        infuraId: infuraID, // Required
        chainId: chainId, // Optional. It defaults to 1 if not provided
    },
}

const fortmaticOptions = {
    package: Fortmatic, // required
    options: {
        key: 'pk_test_4B10E90D66655B33E', // required
    },
}

const torusOptions = {
    package: Torus, // required
    options: {
        networkParams: {
            chainId: chainId,
        },
    },
}
const binanceChainWalletOptions = {
  package: true,
}

const chainId = 1

// create individual provider options objects with the code snippets above

const providerOptions = {
    walletconnect: walletConnectOptions,
    coinbasewallet: coinbaseWalletOptions,
    fortmatic: fortmaticOptions,
    torus: torusOptions,
    binancechainwallet: binanceChainWalletOptions,
};


const ConnectWalletButton = () => {
    const [web3Account, setWeb3Account] = useState();
    const [web3, setWeb3] = useState();
    

    const onConnectClick = async () => {
        const web3Modal = new Web3Modal({
            disableInjectedProvider: false,
            cacheProvider: false, // optional
            providerOptions: providerOptions, // required
        });

        const provider = await web3Modal.connect();
        const web3 = new Web3(provider);
        const accounts = await web3.eth.getAccounts();
        
        setWeb3(web3);
        setAccount(accounts[0]);
    }

    return (
        <div>
            {account ? (
              <button onClick={onConnectClick}>Connect a wallet</button>
            ) : (
              <p>Connected with {account}</p>  
            )}
        </div>
    )
}