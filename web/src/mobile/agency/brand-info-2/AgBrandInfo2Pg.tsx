import { ArrowLeft, SquarePen, ChevronDown, Wifi, Signal, BatteryFull } from 'lucide-react';

/**
 * Agency — Brand Info 2 (Edit Profile & Brand Info)
 * Figma node 4100:65145 — pixel-exact static reproduction.
 */
export default function AgBrandInfo2Pg() {
  return (
    <div
      className="relative overflow-hidden"
      style={{ width: 375, height: 931, background: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}
    >
      {/* FRAME '2' base layer */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 375, height: 2062, background: '#FDFDFD' }} />

      {/* ---- Decorative gradient blobs ---- */}
      {/* Group 35897 (bottom, off-screen) */}
      <div style={{ position: 'absolute', left: 3.8, top: 1891.1, width: 204.3, height: 196.5, borderRadius: '9999px', background: '#FBB7C6' }} />
      <div style={{ position: 'absolute', left: -4, top: 1798, width: 196.5, height: 191.1, borderRadius: '9999px', background: 'linear-gradient(135deg, #F3D29F, #EE9688)' }} />
      {/* Group 35897 (large) */}
      <div style={{ position: 'absolute', left: 66.6, top: 612, width: 493.7, height: 488.6, borderRadius: '9999px', background: '#FF90A9' }} />
      <div style={{ position: 'absolute', left: 135.2, top: 457.6, width: 476.7, height: 473.2, borderRadius: '9999px', background: 'linear-gradient(135deg, #8673B3, #A79AC6)' }} />
      {/* Group 35898 (small, top-left) */}
      <div style={{ position: 'absolute', left: -16.4, top: 167.5, width: 163.4, height: 157.1, borderRadius: '9999px', background: '#CCF5FD' }} />
      <div style={{ position: 'absolute', left: -25, top: 93, width: 157.1, height: 152.8, borderRadius: '9999px', background: 'linear-gradient(135deg, rgba(70,181,252,0.7), rgba(143,190,255,0.7))' }} />

      {/* Rectangle fill=IMAGE — frosted glass overlay placeholder */}
      <div
        style={{
          position: 'absolute',
          left: -13,
          top: 0,
          width: 402,
          height: 2045,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.42), rgba(255,255,255,0.66))',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
        }}
      />

      {/* ---- Header Container ---- */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 70,
          width: 375,
          height: 54,
          background: '#FFFFFF',
          border: '1px solid #717171',
          boxSizing: 'border-box',
        }}
      />
      {/* back arrow (meteor-icons:arrow-up) */}
      <div style={{ position: 'absolute', left: 16, top: 85, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ArrowLeft size={16} color="#000000" strokeWidth={2} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 44,
          top: 82,
          width: 298,
          height: 30,
          color: '#1B1B1C',
          fontFamily: "'Clash Display', sans-serif",
          fontWeight: 500,
          fontSize: 20,
          lineHeight: '37px',
          textAlign: 'left',
        }}
      >
        Edit Profile &amp; Brand Info
      </div>

      {/* ---- Card 37: Profile Info (collapsed) ---- */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 136,
          width: 336,
          height: 52,
          background: '#FFFFFF',
          border: '1px solid #000000',
          borderRadius: 8,
          boxSizing: 'border-box',
        }}
      />
      {/* edit icon */}
      <div style={{ position: 'absolute', left: 40, top: 152, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <SquarePen size={16} color="#000000" strokeWidth={1.5} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 76,
          top: 152,
          width: 234,
          height: 20,
          color: '#242220',
          fontFamily: "'Clash Display', sans-serif",
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '20px',
          textAlign: 'left',
        }}
      >
        Profile Info
      </div>
      <div style={{ position: 'absolute', left: 319, top: 156, width: 24, height: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ChevronDown size={16} color="#000000" strokeWidth={2} />
      </div>

      {/* ---- Card 36: Agency Info (expanded) ---- */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 198,
          width: 336,
          height: 545,
          background: '#FFFFFF',
          border: '1px solid #000000',
          borderRadius: 8,
          boxSizing: 'border-box',
        }}
      />
      {/* edit icon */}
      <div style={{ position: 'absolute', left: 40, top: 214, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <SquarePen size={16} color="#000000" strokeWidth={1.5} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 76,
          top: 214,
          width: 234,
          height: 20,
          color: '#242220',
          fontFamily: "'Clash Display', sans-serif",
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '20px',
          textAlign: 'left',
        }}
      >
        Agency Info
      </div>
      <div style={{ position: 'absolute', left: 319, top: 218, width: 24, height: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ChevronDown size={16} color="#000000" strokeWidth={2} />
      </div>

      {/* Upload image block */}
      <div
        style={{
          position: 'absolute',
          left: 158.5,
          top: 250,
          width: 60,
          height: 60,
          borderRadius: '9999px',
          background: 'linear-gradient(135deg, #E9E4F0, #D9CFEA)',
          border: '1px solid #000000',
          boxSizing: 'border-box',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 123,
          top: 317,
          width: 131,
          height: 20,
          color: '#000000',
          fontFamily: "'Clash Display', sans-serif",
          fontWeight: 500,
          fontSize: 11,
          lineHeight: '20px',
          textAlign: 'center',
        }}
      >
        Upload image
      </div>

      {/* ----- Field: Agency Name ----- */}
      <div style={{ position: 'absolute', left: 32, top: 350, width: 99, height: 22, color: '#040404', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 13, lineHeight: '24px', textAlign: 'left' }}>
        Agency Name
      </div>
      <div style={{ position: 'absolute', left: 32, top: 377, width: 313, height: 38, background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }} />
      <div style={{ position: 'absolute', left: 44, top: 384, width: 265, height: 24, color: '#000000', fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 13, lineHeight: '24px', textAlign: 'left' }}>
        Stellar Talents
      </div>

      {/* ----- Field: Email Address ----- */}
      <div style={{ position: 'absolute', left: 32, top: 428, width: 99, height: 22, color: '#040404', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 13, lineHeight: '24px', textAlign: 'left' }}>
        Email Address
      </div>
      <div style={{ position: 'absolute', left: 32, top: 455, width: 313, height: 38, background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }} />
      <div style={{ position: 'absolute', left: 44, top: 462, width: 265, height: 24, color: '#000000', fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 13, lineHeight: '24px', textAlign: 'left' }}>
        vinay77@gmail.com
      </div>

      {/* ----- Field: Contact Number ----- */}
      <div style={{ position: 'absolute', left: 32, top: 506, width: 124, height: 22, color: '#040404', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 13, lineHeight: '24px', textAlign: 'left' }}>
        Conatct Number
      </div>
      <div style={{ position: 'absolute', left: 32, top: 533, width: 313, height: 38, background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }} />
      <div style={{ position: 'absolute', left: 44, top: 540, width: 265, height: 24, color: '#000000', fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 13, lineHeight: '24px', textAlign: 'left' }}>
        9228453401
      </div>

      {/* ----- Field: Agency Website ----- */}
      <div style={{ position: 'absolute', left: 32, top: 584, width: 111, height: 22, color: '#040404', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 13, lineHeight: '24px', textAlign: 'left' }}>
        Agency Website
      </div>
      <div style={{ position: 'absolute', left: 32, top: 611, width: 313, height: 38, background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }} />
      <div style={{ position: 'absolute', left: 44, top: 618, width: 265, height: 24, color: '#000000', fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 13, lineHeight: '24px', textAlign: 'left' }}>
        www.stellartalent.com
      </div>

      {/* ---- Status bar ---- */}
      <div
        style={{
          position: 'absolute',
          left: 19,
          top: 31,
          width: 54,
          height: 18,
          color: '#000000',
          fontFamily: 'Urbanist, sans-serif',
          fontWeight: 600,
          fontSize: 15,
          lineHeight: '18px',
          textAlign: 'center',
        }}
      >
        19:56
      </div>
      <div style={{ position: 'absolute', left: 292, top: 33, width: 17, height: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Signal size={16} color="#000000" strokeWidth={2} />
      </div>
      <div style={{ position: 'absolute', left: 314, top: 33, width: 16, height: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Wifi size={15} color="#000000" strokeWidth={2} />
      </div>
      <div style={{ position: 'absolute', left: 333, top: 32, width: 26, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BatteryFull size={22} color="#000000" strokeWidth={2} />
      </div>
    </div>
  );
}
