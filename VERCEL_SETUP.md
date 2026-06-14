# Vercel Environment Variables Configuration

Para que tu aplicación funcione correctamente en Vercel, necesitas agregar las siguientes variables de entorno:

## Pasos para configurar en Vercel:

1. Accede a tu proyecto en [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto `pomo-deep`
3. Ve a **Settings** → **Environment Variables**
4. Agrega las siguientes variables:

### Firebase Configuration

```
VITE_FIREBASE_PROJECT_ID=gen-lang-client-0315719483
VITE_FIREBASE_APP_ID=1:462887859012:web:98797fcac9cd4e7db61d11
VITE_FIREBASE_API_KEY=AIzaSyD7mqOfXjAD_RXFT6ccekjbpU7CnuATcDk
VITE_FIREBASE_AUTH_DOMAIN=gen-lang-client-0315719483.firebaseapp.com
VITE_FIREBASE_FIRESTORE_DATABASE_ID=ai-studio-105c5826-8fd7-479b-aa62-9958c641f271
VITE_FIREBASE_STORAGE_BUCKET=gen-lang-client-0315719483.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=462887859012
VITE_FIREBASE_MEASUREMENT_ID=
```

### Notion API (si lo usas)

```
NOTION_TOKEN=your_notion_token_here
NOTION_DATABASE_ID=your_database_id_here
```

### Google Generative AI

```
GEMINI_API_KEY=your_gemini_api_key_here
```

## Próximos pasos:

1. Después de agregar las variables, Vercel redeployará automáticamente
2. Las variables VITE_* serán inyectadas en tiempo de build (Vite)
3. Las otras variables estarán disponibles en runtime

## ⚠️ IMPORTANTE - Seguridad:

- ✅ Tu API key de Firebase ya NO está en GitHub (fue removida del historio)
- ✅ Nunca commits `.env` o `.env.local` files
- ✅ Usa `.env.example` como referencia para nuevos desarrolladores
- ✅ Cada deployement en Vercel usará las variables que configuraste en el dashboard

## Verificación local:

Para verificar que todo funciona localmente:

```bash
npm install
npm run dev
```

Tu archivo `.env.local` contiene los valores para desarrollo local.
