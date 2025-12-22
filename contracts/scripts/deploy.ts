import { ethers } from 'hardhat';

async function main() {
  const ConsentRegistry = await ethers.getContractFactory('ConsentRegistry');
  const contract = await ConsentRegistry.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`ConsentRegistry deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
