const hre = require("hardhat");
const path = require("path");

async function main() {
  const { ethers } = hre;

  // 1) 获取部署的注册表合约实例
  const registry = await ethers.getContractAt(
    "ZkGateRegistry",
    process.env.REGISTRY
  );

  // 2) 加载 circuits 文件夹中的 public.json
  const publicJson = require(path.join(__dirname, "../public.json"));
  const decRoot = publicJson[0].toString();

  // 3) 将十进制字符串转换为 BigInt，然后转换为 bytes32 格式的十六进制字符串
  const newRoot = ethers.zeroPadValue(
    ethers.toBeHex(BigInt(decRoot)),
    32
  );

  console.log("Updating on-chain root to:", newRoot);

  // 4) 以管理员身份发送交易
  const [admin] = await ethers.getSigners();
  const tx = await registry.connect(admin).updateRoot(newRoot);
  await tx.wait();

  console.log("✅ Root updated on-chain");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
