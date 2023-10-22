"use client";

import { useState, useEffect } from "react";
import { Data, IdentityRecord, IdentityWithSource, DataSource, Platform } from '../interfaces/nextid';
import Link from 'next/link';
import Image from 'next/image';
import { unknown, lens, github, ethereum, nextid, space_id, twitter, keybase, reddit, farcaster, unstoppabledomains, dot, rss3, sybil, notSybil } from "./imports";


export default function NextidBadges({walletAddress}: { walletAddress: string }) {
  const [identities, setIdentities] = useState<IdentityWithSource[]>([]);
  // const walletAddress = "0x934b510d4c9103e6a87aef13b816fb080286d649";
  

  const convertToVar = (name:string) => {

    if (name == "twitter") return twitter;
    else if (name == "farcaster") return farcaster;
    else if (name == "lens") return lens;
    else if (name == "keybase") return keybase;
    else if (name == "reddit") return reddit;
    else if (name == "github") return github;
    else if (name == "ethereum") return ethereum;
    else if (name == "space_id") return space_id;
    else if (name == "nextid") return nextid;
    else if (name == "unstoppabledomains") return unstoppabledomains;
    else if (name == "dot") return dot;
    else if (name == "rss3") return rss3;
    else return unknown;

  }

  const convertToUrl = (name:string) => {

    if (name == "twitter") return "https://twitter.com/";
    else if (name == "farcaster") return "https://warpcast.com/";
    else if (name == "lens") return "https://hey.xyz/u/";
    else if (name == "reddit") return "https://www.reddit.com/user/";
    else if (name == "github") return "https://github.com/";
    else if (name == "space_id") return "https://space.id/search?query=";
    else if (name == "unstoppabledomains") return "https://unstoppabledomains.com/search?searchTerm=";
    // ethereum with displayName https://web3.bio/sujiyan.eth
    // keybase with displayName https://keybase.io/sujiyan
    else return "https://www.example.com/";

  }

  const sybilCheck = () => {
    let isSybil = 0;
    identities.forEach(identity => {
      identity.sources?.forEach(syb => {
        if (syb === "sybil") {isSybil = 1;}
      })
    });
    return isSybil == 1 ? sybil : notSybil;
  }

  useEffect(() => {

    // make an api request to /api/nextid to fetch the userdata
    const getIdentities = async () => {
      
      const customerdata = await fetch('/api/nextid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: walletAddress }),
      });
      
      const identities: IdentityWithSource[]= await customerdata.json();
      setIdentities(identities);
      console.log("fetched identities");
      // console.log(identities);
      
    }
    getIdentities();
  }, []);

  return (
  <div className="font-serif text-center">
    <div className="flex">
      Sybil Verified:
      <Link href="https://github.com/Uniswap/sybil-list/blob/master/verified.json" target="blank">
      <div className="py-0 px-1"><Image src= { sybilCheck() } height={30} width={30} alt="sybil check" /></div>
      </Link>
    </div>
    <div className="flex">
      <div>Platforms:</div>
      <div className="flex">
        {
        identities.map((ele: IdentityWithSource) => 
        <div>
          {
            ele?.identity?.displayName !== "" &&
            ele?.identity?.platform !== "keybase" && 
            ele?.identity?.platform !== "ethereum" && 
            ele?.identity?.platform !== "nextid" &&
            <div key={ele?.identity.uuid} className="px-2">
              <Link href={convertToUrl(ele?.identity?.platform) + ele?.identity?.identity} target="blank">
                <div><Image src= { convertToVar(ele?.identity?.platform) } height={24} width={24} alt="nextIimge" /></div>
                <div>
                  {`@${ele?.identity?.identity}`}
                </div>
                {/* <div>{ele?.identity?.platform}</div> */}
              </Link>
            </div>
          }
        </div>
        )
        }
      </div>
  
    </div>
  </div>
  );
}