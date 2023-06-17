/**
 * Login to the healthspan wiki
 * @param fetch fetcher needed for cookie maintenance
 * @returns the login token
 */
async function getLoginToken(fetch: any): Promise<string> {
    const loginTokenResponse = await fetch(process.env.WIKI_API_URL, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
        action: 'query',
        meta: 'tokens',
        type: 'login',
        format: 'json'
        })
    });

    const loginTokenData = await loginTokenResponse.json();
    // @ts-ignore
    const loginToken = loginTokenData.query.tokens.logintoken;

    return loginToken
}

/**
 * Login and get the csrf token
 * @param fetch fetcher needed for cookie maintenance
 * @param username bot username 
 * @param password bot password
 * @returns Login token 
 */
export default async function login(fetch: any, username: string, password: string): Promise<string> {
    const loginToken = (await getLoginToken(fetch))

    console.log(loginToken)

    console.log(username, password)

    const loginResponse = await fetch(process.env.WIKI_API_URL, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            action: 'login',
            lgname: username,
            lgpassword: password,
            lgtoken: loginToken,
            format: 'json'
        })
    });

    const loginData = await loginResponse.json();
    // @ts-ignore
    if (loginData.login.result === "Success") {
        return await getCsrfToken(fetch);
    }
    else {
        throw new Error("Login failed");
    }
}

/**
 * Fetch the csrf token
 * @param fetch fetcher needed for cookie maintenance
 * @returns csrf token
 */
async function getCsrfToken(fetch: any) {
    const csrfTokenResponse = await fetch(process.env.WIKI_API_URL, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
        action: 'query',
        meta: 'tokens',
        format: 'json'
        })
    });

    const csrfTokenData = await csrfTokenResponse.json();
    console.log(csrfTokenData)
    // @ts-ignore
    const csrfToken: string = csrfTokenData.query.tokens.csrftoken;

    return csrfToken;
}  