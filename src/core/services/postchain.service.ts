import * as config from '../../config';

export function getBlockHeight(): Promise<number> {
  return Promise.resolve(-1);
  /*const url = `${config.blockchain.nodeApiUrl}/blocks/${config.blockchain.rid}?limit=1`;
  return fetch(url)
    .then((response: any) => response.json())
    .then((json: any) => json[0].height);*/
}
