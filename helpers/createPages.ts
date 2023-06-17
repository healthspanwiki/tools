import fs from 'fs';
import fetch from 'node-fetch';

interface WikiPage {
    title: string;
    links: string[];
}

/**
 * Parses the provided text file into an array of WikiPage objects.
 * @param filepath The path to the text file.
 * @returns An array of WikiPage objects.
 */
async function parseFile(filepath: string): Promise<WikiPage[]> {
    const data = await fs.promises.readFile(filepath, 'utf-8');
    const lines = data.split('\n');
    const pages = lines.map(line => {
        const [title, links] = line.split(':');
        return { title: title.trim(), links: links.split(',').map(link => link.trim()) };
    });
    return pages;
}

/**
 * Formats the wikiText for a page.
 * @param page The page to format the wikiText for.
 * @returns The formatted wikiText.
 */
function formatWikiText(page: WikiPage): string {
    const links = page.links.map(link => `* [[${link}]]`).join(' | ')
    return `Start here.

== Temporary Links ==
${links}

== References ==

`;
}

/**
 * Creates a page on the wiki.
 * @param fetch fetcher needed for cookie maintenance
 * @param title The title of the page to create.
 * @param wikiText The wikiText for the page.
 * @param csrfToken The CSRF token for authentication.
 */
async function createPage(fetch: any, title: string, wikiText: string, csrfToken: string) {
    const params = new URLSearchParams();
    params.append('action', 'edit');
    params.append('title', title);
    params.append('text', wikiText);
    params.append('token', csrfToken);
    params.append('format', 'json');

    const response = await fetch(process.env.WIKI_API_URL, {
        method: 'POST',
        body: params,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    const data = await response.json();

    if (data && data.error) {
        console.log(`Error creating page ${title}: ${data.error.info}`);
    } else {
        console.log(`Created page ${title}`);
    }
}

/**
 * Creates pages on the wiki from a text file.
 * @param fetch fetcher needed for cookie maintenance
 * @param filepath The path to the text file.
 * @param token The CSRF token for authentication.
 */
export default async function createPages(fetch: any, filepath: string, token: string) {
    const pages = await parseFile(filepath);
    for (const page of pages) {
        const wikiText = formatWikiText(page);
        await createPage(fetch, page.title, wikiText, token);
    }
}

