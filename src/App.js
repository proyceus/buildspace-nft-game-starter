import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import SelectCharacter from './Components/SelectCharacter/SelectCharacter';
import { CONTRACT_ADDRESS, transformCharacterData } from './constants';
import myEpicGame from './utils/MyEpicGame.json';
import { ethers } from 'ethers';
import Arena from './Components/Arena/Arena';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {

  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);

  const checkIfWalletIsConnected = async () => {

    try{
      const {ethereum} = window;

      if (!ethereum) {
        console.log('Make sure you have MetaMask!');
        return;
      } else {
        console.log('We have the ethereum object', ethereum);

        //check if we're authorized to access user's wallet
        const accounts = await ethereum.request({method: 'eth_accounts'});

        //the user can have multiple authorized accounts, we grab the first one if its there
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log('Found an authorized account:', account);
          setCurrentAccount(account);
        } else {
          console.log('No authorized account found');
        }


      }
    } catch (err) {
      console.error(err);
    }
  }

  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      //fancy method of requesting access to account
      const accounts = await ethereum.request({method: 'eth_requestAccounts'});

      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);

    } catch (err) {
      console.error(err);
    }
  }

  const renderContent = () => {
    if (!currentAccount) {
      return (
      <div className="connect-wallet-container">
      <img
        src="https://media.giphy.com/media/3osxYfP8SJVa9XpVyo/giphy.gif"
        alt="Batman/Superman Rock Paper Scissor"
      />
      <button className="cta-button connect-wallet-button" onClick={connectWalletAction}>Connect Wallet To Get Started</button>
      </div>
      )
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />
    } else if (currentAccount && characterNFT) {
      return <Arena characterNFT={characterNFT} />
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {

    const fetchNFTMetadata = async () => {
      console.log('Checking for Character NFT on address:', currentAccount);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        console.log('User has character NFT');
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log('No character NFT found');
      }
    };

    //we only want to run the above function if user is connected
    if (currentAccount) {
      console.log('CurrentAccount:', currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount])


  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Rock x Paper x Scissor</p>
          <p className="sub-text">Can you defeat the awful hand?!</p>
          {renderContent()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built with @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
