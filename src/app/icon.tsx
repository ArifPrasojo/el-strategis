import { ImageResponse } from 'next/og'

export function generateImageMetadata() {
  return [
    { id: '192', size: { width: 192, height: 192 }, alt: '192x192 icon', contentType: 'image/png' },
    { id: '512', size: { width: 512, height: 512 }, alt: '512x512 icon', contentType: 'image/png' },
  ]
}

export default function Icon({ id }: { id: string }) {
  const size = id === '192' ? 192 : 512;
  const svgSize = id === '192' ? 100 : 280;

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #34d399, #059669)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '20%',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={svgSize}
          height={svgSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0a0a0a"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a8 8 0 0 1-5.046 7.322l-.175.056a1 1 0 0 1-.925.034l-.066-.034A8 8 0 0 1 3 15V7h16Z" />
          <path d="M22 13v-2" />
          <path d="M22 17v-2" />
        </svg>
      </div>
    ),
    { width: size, height: size }
  )
}
