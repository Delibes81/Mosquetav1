import { ImageResponse } from 'next/og';

export const alt = 'Mosqueta — Hogar y Oficina';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 84px',
          background: 'linear-gradient(135deg, #141414 0%, #2b1520 58%, #bf1e5f 100%)',
          color: 'white',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 18, height: 54, borderRadius: 999, background: '#f2b3cc' }} />
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 800, letterSpacing: 2 }}>MOSQUETA</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 920 }}>
          <div style={{ display: 'flex', fontSize: 68, lineHeight: 1.06, fontWeight: 800 }}>
            Hogar y oficina con respaldo y experiencia.
          </div>
          <div style={{ display: 'flex', marginTop: 28, fontSize: 26, color: '#f5dbe5' }}>
            Electrodomésticos, muebles y equipamiento para México.
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 22, color: '#f2b3cc' }}>mosquetav1.vercel.app</div>
      </div>
    ),
    size,
  );
}

