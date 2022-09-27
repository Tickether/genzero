const {MerkleTree} =  require('merkletreejs');
const keccak256 = require('keccak256');

const allowlist = require ('./allowlist');

let allowList = allowlist.allowListAddresses();




const leafNodes = allowList.map(addr => keccak256(addr));
const merkleTree = new MerkleTree(leafNodes, keccak256, {sortPairs: true});

console.log(leafNodes);
console.log(merkleTree);

const rootHash = merkleTree.getRoot();
console.log('WL merkle tree/n', merkleTree.toString());
console.log('root hash: ', rootHash )

const clamingAddress = leafNodes[900]; 



let hexproof = merkleTree.getHexProof(clamingAddress);

let hex_Proof = hexproof.toString();
let hexProof = "[" + hex_Proof + "]";

console.log('hex Proof: ',hexProof)
console.log('hex Proof: ',hexproof)
//let index = allowList.indexOf(address);
let testAddress= '0xdb8e7e97D9f0158Fa69b539B61d0cD8EbB2c6264'
let index = allowList.indexOf(testAddress.toLowerCase())

console.log(index)

console.log(merkleTree.verify(hexproof, clamingAddress, rootHash));
console.log(leafNodes[76])
console.log()
console.log('claiming address:',clamingAddress)
console.log('root hash: ', rootHash )


