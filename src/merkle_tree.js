const {MerkleTree} =  require('merkletreejs');
const keccak256 = require('keccak256');

const allowlist = require ('./allowlist');

let allowListAddresses = allowlist.allowListAddresses();




const leafNodes = allowListAddresses.map(addr => keccak256(addr));
const merkleTree = new MerkleTree(leafNodes, keccak256, {sortPairs: true});

console.log(leafNodes);
console.log(merkleTree);

const rootHash = merkleTree.getRoot();
console.log('WL merkle tree/n', merkleTree.toString());
console.log('root hash: ', rootHash )

const clamingAddress = leafNodes[6770]; 



let hexproof = merkleTree.getHexProof(clamingAddress);

let hex_Proof = hexproof.toString();
let hexProof = "[" + hex_Proof + "]";

console.log('hex Proof: ',hexProof)
console.log('hex Proof: ',hexproof)
//let index = allowListAddresses.indexOf(address);
let index = allowListAddresses.indexOf("0x4f0AD22Da38Ba8dcE5B953Dc24917DdC64C67459")

console.log(index)
//console.log(leafNodes[2])

console.log(merkleTree.verify(hexproof, clamingAddress, rootHash));
console.log('root hash: ', rootHash )


