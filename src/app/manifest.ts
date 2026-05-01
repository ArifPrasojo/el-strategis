import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'El Strategis',
    short_name: 'El Strategis',
    description: 'Aplikasi Manajemen Keuangan Pribadi',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#3b82f6',
    icons: [
      {
        src: '/icon?size=192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon?size=512',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
