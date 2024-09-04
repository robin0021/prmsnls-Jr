import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {

        const response = await fetch('http://localhost:8000/run_lottery', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // body: JSON.stringify(""), 
        });

        if (!response.ok) {
            throw new Error(`Fetch error: ${response.statusText}`);
        }

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('API request failed:', error);

        if (error instanceof Error) {
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error', error: 'Unknown error' });
        }
    }
}
