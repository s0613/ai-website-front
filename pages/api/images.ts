import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const imageDir = path.join(process.cwd(), 'public/images');

    try {
        const files = fs.readdirSync(imageDir);
        const images = files.map((file) => ({
            src: `/images/${file}`,
            alt: file.replace(/\.[^/.]+$/, ''), // 확장자를 제외한 파일명
        }));

        res.status(200).json(images);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load images' });
    }
}
