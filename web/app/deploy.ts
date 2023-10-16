import { BigNumberish, utils } from "ethers";

const { arrayify, hexConcat, hexlify, hexZeroPad, keccak256 } = utils;

// from: https://github.com/Arachnid/deterministic-deployment-proxy
export const DETERMINISTIC_DEPLOYER_ADDRESS =
  "0x4e59b44847b379578588920ca78fbf26c0b4956c";

export const getDeployedAddress = (
  initCode: string,
  salt: BigNumberish,
): string => {
  const saltBytes32 = hexZeroPad(hexlify(salt), 32);
  return (
    "0x" +
    keccak256(
      hexConcat([
        "0xff",
        DETERMINISTIC_DEPLOYER_ADDRESS,
        saltBytes32,
        keccak256(initCode),
      ]),
    ).slice(-40)
  );
};

export const getDeployTransactionCallData = (
  initCode: string,
  salt: BigNumberish,
): string => {
  const saltBytes32 = hexZeroPad(hexlify(salt), 32);
  return hexConcat([saltBytes32, initCode]);
};

export const getDeployTx = (initCode: string, salt: BigNumberish) => {


  return {
    to: DETERMINISTIC_DEPLOYER_ADDRESS,
    data: getDeployTransactionCallData(initCode, salt),
  };
};

// TODO use signer.estimateGas(deployTx);
export const getGasEstimate = (initCode: string) => {
  const gasLimit =
    arrayify(initCode)
      .map((x) => (x === 0 ? 4 : 16))
      .reduce((sum, x) => sum + x) +
    (200 * initCode.length) / 2 + // actual is usually somewhat smaller (only deposited code, not entire constructor)
    6 * Math.ceil(initCode.length / 64) + // hash price. very minor compared to deposit costs
    32000 +
    21000;

  // deployer requires some extra gas
  return Math.floor((gasLimit * 64) / 63);
};
