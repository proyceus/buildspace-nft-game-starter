import React, { useEffect, useState } from 'react';
import './SelectCharacter.css';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants';
import myEpicGame from '../../utils/MyEpicGame.json';

const SelectCharacter = ({ setCharacterNFT }) => {

    const [characters, setCharacters] = useState([]);
    const [gameContract, setGameContract] = useState(null);

    const mintCharacterNFTAction = (characterId) => async () => {
        try {
            if (gameContract) {
                console.log('Minting character in progress...');
                const mintTxn = await gameContract.mintCharacterNFT(characterId);
                await mintTxn.wait();
                console.log('mintTxn:', mintTxn);
            }
        } catch (err) {
            console.warn('MintCharacterAction Error:', err);
        }
    }


    const renderCharacters = () =>
  characters.map((character, index) => (
    <div className="character-item" key={character.name}>
      <div className="name-container">
        <p>{character.name}</p>
      </div>
      <img src={character.imageURI} alt={character.name} />
      <button
        type="button"
        className="character-mint-button"
        onClick={mintCharacterNFTAction(index)}
      >{`Mint ${character.name}`}</button>
    </div>
  ));

    useEffect(() => {
        const { ethereum } = window;

        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const gameContract = new ethers.Contract(
                CONTRACT_ADDRESS,
                myEpicGame.abi,
                signer
            );

            setGameContract(gameContract);
        } else {
            console.log('Ethereum object not found');
        }
    }, []);

    useEffect(() => {
        const getCharacters = async () => {
            try {
                console.log('Getting contract characters to mint');

                //call contract to get all mintable characters
                const charactersTxn = await gameContract.getAllDefaultCharacters();
                console.log('charactersTxn:', charactersTxn);

                //go through the characters and transform the data
                const characters = charactersTxn.map((characterData) => 
                    transformCharacterData(characterData)
                );

                //set all mintable characters in state
                setCharacters(characters);

            } catch (err) {
                console.error('Something went wrong when fetching characters:', err);
            }
        };

        const onCharacterMint = async (sender, tokenId, characterIndex) => {
            console.log(
                `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
            )

            //once character is minted, fetch metadata from contract and set it in state
            if (gameContract) {
                const characterNFT = await gameContract.checkIfUserHasNFT();
                console.log('CharacterNFT:', characterNFT);
                setCharacterNFT(transformCharacterData(characterNFT));
            }
        };

        if (gameContract) {
            getCharacters();

            //setup NFT minted listener
            gameContract.on('CharacterNFTMinted', onCharacterMint);
        }

        return () => {
            //when component unmounts, make sure to clean up this listener
            if (gameContract) {
                gameContract.off('CharacterNFTMinted', onCharacterMint);
            }
        }


    }, [gameContract]);





    return (
        <div className="select-character-container">
            <h2>Mint Your Hero. Choose wisely.</h2>
            {characters.length > 0 && (<div className="character-grid">{renderCharacters()}</div>)}
        </div>
    )
};

export default SelectCharacter;