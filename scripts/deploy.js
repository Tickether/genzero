
const hre = require("hardhat");

async function main() {

  const url = 'https://bafybeihnroh6ryrewm7bheun4fza6koqportaunryvtiya7xqqgfoddyki.ipfs.nftstorage.link/';

  const Gen = await hre.ethers.getContractFactory("Gen");
  const gen = await Gen.deploy(url);

  await gen.deployed();

  console.log("Gen deployed to:", gen.address);

/*
  const Arcturium = await hre.ethers.getContractFactory("Arcturium");
  const arcturium = await Arcturium.deploy();

  await arcturium.deployed();

  console.log("Arcturium deployed to:", arcturium.address);
*/
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
