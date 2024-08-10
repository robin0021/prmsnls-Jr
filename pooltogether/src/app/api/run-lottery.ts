import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
            headers.append(key, value);
        }
    });

    const response = await fetch('http://0.0.0.0:8000/run-lottery', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
}