export interface Data {
    identity: {
      platform: Platform;
      identity: string;
      displayName: string | null;
      neighbor: IdentityWithSource[];
    };
  }
  
  export interface IdentityRecord {
    uuid: string;
    platform: Platform;
    identity: string;
    displayName?: string | null;
    neighbor?: IdentityWithSource[] | null;
  }
  
  export interface IdentityWithSource {
    sources: DataSource[] | undefined;
    identity: IdentityRecord;
  }
  
  export enum DataSource {
    Sybil = "sybil",
    Keybase = "keybase",
    NextID = "nextid",
    RSS3 = "rss3",
    KNN3 = "knn3",
    CyberConnect = "cyberconnect",
    EthLeaderboard = "ethLeaderboard",
    TheGraph = "the_graph",
    RpcServer = "rpc_server",
    DotBit = "dotbit",
    UnstoppableDomains = "unstoppabledomains",
    Lens = "lens",
    Farcaster = "farcaster",
    SpaceID = "space_id",
    Unknown = "unknown",
  }
  
  export enum Platform {
    Twitter = "twitter",
    Ethereum = "ethereum",
    NextID = "nextid",
    Keybase = "keybase",
    Github = "github",
    Reddit = "reddit",
    Lens = "lens",
    DotBit = "dotbit",
    DNS = "dns",
    Minds = "minds",
    UnstoppableDomains = "unstoppabledomains",
    Farcaster = "farcaster",
    SpaceId = "space_id",
    Unknown = "unknown"
  }