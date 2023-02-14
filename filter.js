const { JsonRpcProvider, BigNumber, ethers } = require("ethers");

/**
 * 
 * @param {Array<string[]>} addresses 
 * @param {JsonRpcProvider[]} chains 
 */
const _hasTx = async (addresses, chains) => {
    const hasBalanceResults = {};
    for (const chain of chains) {
        const res = await Promise.all(addresses.map((address) => chain.getTransactionCount(address)));
        res.forEach((v, index) => {
            if (BigNumber.from(v).gte(5)) hasBalanceResults[addresses[index]] = true;
        })
    }

    return Object.keys(hasBalanceResults);
}

/**
 * 
 * @param {Array<string[]>} addresses 
 * @param {JsonRpcProvider[]} chains 
 */
const _hasBalance = async (addresses, chains) => {
    const hasBalanceResults = {};
    for (const chain of chains) {
        const res = await Promise.all(addresses.map((address) => chain.getBalance(address)));
        res.forEach((v, index) => {
            if (BigNumber.from(v).gte(ethers.utils.parseEther("0.015"))) hasBalanceResults[addresses[index]] = true;
        })
    }

    return Object.keys(hasBalanceResults);
}

/**
 * 
 * @param {string[]} adddresses
 * @param {JsonRpcProvider[]} chains 
 * @param {string} fn
 */
module.exports.filter = async (addresses, chains, fn) => {
    let tracks = [];
    for (let i = 0; i < addresses.length; i += 100) {
        const isLast = (i + 100) > addresses.length;
        tracks.push([...addresses.slice(i, !isLast && i+100)]);
    }

    const validAddresses = [];
    
    try {
        for (let i = 0; i < tracks.length; i++) {
            let _items;
            if (fn === "balance") {
                _items = await _hasBalance(tracks[i], chains);
            } else if (fn === "tx") {
                _items = await _hasTx(tracks[i], chains);
            } else {
                throw new Error("Invalid Function");
            }
            validAddresses.push(..._items);
            const sleep = await new Promise(resolve => setTimeout(resolve, 50));
            console.log("#" + i + "/" + tracks.length + ": ", _items.length, validAddresses.length);
        }
    } catch (err) {
        console.error(err);
    } finally {
        return ([].concat(...validAddresses)); ///.filter((v) => BigNumber.from(v).gt(0));
    }
}