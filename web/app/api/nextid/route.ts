import { Data } from '@/app/interfaces/nextid';
import { request as requestGQL, gql } from 'graphql-request';
import { NextResponse } from 'next/server';

export async function POST(request: Request, response: Response) {

    const { walletAddress } = await request.json();

    const getUserData = async (userAddress : string) => {
      
        const document = gql`
        {
          identity(platform: "ethereum", identity: "${userAddress}") {
            platform
            identity
            displayName
            # Here we perform a 3-depth deep search for this identity's "neighbor".
            neighbor(depth: 3) {
              sources # Which upstreams provide these connection infos.
              identity {
                platform
                identity
                displayName
              }
            }
          }
        }
        `;
  
        const requestHeaders = {
          'x-api-key': process.env.NEXTID_API_KEY!
        };
  
        const badgeData : Data = await requestGQL('https://relation-service.next.id/graphql/', document, requestHeaders);

        return badgeData.identity === null ? [] : badgeData?.identity?.neighbor;
        
      }

      const returndata = await getUserData(walletAddress);
      // const returndata = await getUserData("0x934b510d4c9103e6a87aef13b816fb080286d649");
      // console.log("returning from nextid api", returndata);

    return NextResponse.json(returndata);
}