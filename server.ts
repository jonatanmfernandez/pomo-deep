import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Notion API endpoint
  app.post('/api/notion/create-page', async (req, res) => {
    const { token, databaseId, title, content } = req.body;
    const notionToken = token || process.env.NOTION_TOKEN;
    const notionDatabaseId = databaseId || process.env.NOTION_DATABASE_ID;

    if (!notionToken || !notionDatabaseId) {
      return res.status(400).json({ error: 'Notion Token and Database ID are required' });
    }

    try {
      const response = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${notionToken}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify({
          parent: { database_id: notionDatabaseId },
          properties: {
            title: {
              title: [
                {
                  text: {
                    content: title
                  }
                }
              ]
            }
          },
          children: [
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [
                  {
                    type: 'text',
                    text: {
                      content: content.substring(0, 2000) // Notion limit
                    }
                  }
                ]
              }
            }
          ]
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create Notion page');
      }

      res.json({ success: true, url: data.url });
    } catch (error: any) {
      console.error('Notion API Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
