const CONTRACT_ADDRESS = "0x29388a7073E3fA4dbb441E412dAC284652Ed709b";

const transformCharacterData = (characterData) => {
    return {
        name: characterData.name,
        imageURI: characterData.imageURI,
        hp: characterData.hp.toNumber(),
        maxHp: characterData.maxHp.toNumber(),
        attackDamage: characterData.attackDamage.toNumber(),
    }; 
}

export {CONTRACT_ADDRESS, transformCharacterData};