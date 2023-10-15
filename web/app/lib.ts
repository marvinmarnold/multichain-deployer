export enum EPaths {
  CREATE_PROJECT_PAGE = "/create",
}

export type Chain = {
  name: string;
  id: string;
};

export const TARGET_CHAINS: { [chainId: string]: Chain } = {
  "5": {
    name: "Goerli",
    id: "5",
  },
  "11155111": {
    name: "Sepolia",
    id: "11155111",
  },
};
