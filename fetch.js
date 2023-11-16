export class FetchError extends Error {
  /**
   * @param {string} message
   * @param {Response} response
   */
  constructor(message, response) {
    super(message);
    this.response = response;
  }
}

export async function doFetch(
  url,
  { pat, method = 'GET', headers = {}, body = undefined, json, parse = true, retryCount = 0 } = {},
) {
  console.log(`Fetching (${method}): ${url}`, body || '');
  try {
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: pat ? `Basic ${pat}` : undefined,
        Accept: json ? 'application/json' : 'text/plain',
        'Content-Type': json ? 'application/json' : 'text/plain',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      let responseText;
      try {
        responseText = await response.text();
      } catch {}
      console.error(`Fetch failed with status code ${response.status} and body ${responseText}`);
      throw new FetchError(
        `Fetch for ${url} failed. Received status code ${response.status}. Body: ${responseText}`,
        response,
      );
    }

    if (!parse) return response;

    return json ? response.json() : response.text();
  } catch (err) {
    if (err instanceof FetchError) {
      if ((err.response.status >= 400 && err.response.status < 500) || retryCount === 0) {
        throw err;
      }
      console.log('Retrying', url);
      await new Promise(r => setTimeout(r, 500));
      return fetch(url, {
        method,
        pat,
        body,
        json,
        headers,
        retryCount: retryCount - 1,
      });
    }
    if (err instanceof Error) {
      console.log('Fetch failed with error', err);
      throw new Error(`Fetch for ${url} failed: ${err.message}`);
    }
    throw err;
  }
}
