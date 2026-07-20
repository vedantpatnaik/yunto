import { ChevronLeft, ChevronDown, ChevronUp, User, Building2 } from 'lucide-react';

/**
 * Agency — Brand Info 3 (Agency Information)
 * Figma node 7791:22768 — pixel-exact static reproduction.
 * All coordinates are frame-relative to the 375x876 frame.
 */
export default function AgBrandInfo3Pg() {
  return (
    <div
      className="relative overflow-hidden"
      style={{ width: 375, height: 876, background: '#F8F5EF', fontFamily: 'Inter, sans-serif' }}
    >
      {/* ============ Header (Frame 2147223268) @(0,0) 375x80 ============ */}
      {/* Back Button @(16,22) 36x36 fill #1F1A17 fully rounded */}
      <div
        style={{
          position: 'absolute',
          left: 16,
          top: 22,
          width: 36,
          height: 36,
          background: '#1F1A17',
          borderRadius: 9999,
          boxShadow: '0 4px 10px rgba(31,26,23,0.18)',
        }}
      />
      {/* back chevron icon @(25.9,31.9) 16.2x16.2 stroke #FAF7F2 */}
      <div
        style={{
          position: 'absolute',
          left: 25.9,
          top: 31.9,
          width: 16.2,
          height: 16.2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ChevronLeft size={16} color="#FAF7F2" strokeWidth={1.35} />
      </div>
      {/* Heading 1 'Agency Information' @(72,28) 222x24 */}
      <div
        style={{
          position: 'absolute',
          left: 72,
          top: 28,
          width: 222,
          height: 24,
          color: '#141311',
          fontFamily: 'Geist, sans-serif',
          fontWeight: 500,
          fontSize: 20,
          lineHeight: '24px',
          textAlign: 'left',
        }}
      >
        Agency Information
      </div>

      {/* ============ Basics card (collapsed) @(20,116) 335x74 ============ */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 116,
          width: 335,
          height: 74,
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 28,
          boxSizing: 'border-box',
          boxShadow: '0 6px 20px rgba(17,24,39,0.05)',
        }}
      />
      {/* Background+Shadow @(33,129) 48x48 fill #F3E8FF radius 24 */}
      <div
        style={{
          position: 'absolute',
          left: 33,
          top: 129,
          width: 48,
          height: 48,
          background: '#F3E8FF',
          borderRadius: 24,
        }}
      />
      {/* profile/user icon @(45,141) 24x24 stroke #9333EA */}
      <div
        style={{
          position: 'absolute',
          left: 45,
          top: 141,
          width: 24,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <User size={22} color="#9333EA" strokeWidth={2} />
      </div>
      {/* 'Profile Info' @(97,143.5) 189x19 */}
      <div
        style={{
          position: 'absolute',
          left: 97,
          top: 143.5,
          width: 189,
          height: 19,
          color: '#111827',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: 16,
          lineHeight: '19.4px',
          textAlign: 'left',
        }}
      >
        Profile Info
      </div>
      {/* Overlay+Shadow @(302,135) 36x36 fill #FFFFFF radius 18 */}
      <div
        style={{
          position: 'absolute',
          left: 302,
          top: 135,
          width: 36,
          height: 36,
          background: '#FFFFFF',
          borderRadius: 18,
          boxShadow: '0 2px 6px rgba(17,24,39,0.06)',
        }}
      />
      {/* chevron-down icon @(310,143) 20x20 stroke #6B7280 (collapsed) */}
      <div
        style={{
          position: 'absolute',
          left: 310,
          top: 143,
          width: 20,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ChevronDown size={16} color="#6B7280" strokeWidth={1.67} />
      </div>

      {/* ============ Basics (Expanded) card @(20,202) 335x629 ============ */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 202,
          width: 335,
          height: 629,
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 28,
          boxSizing: 'border-box',
          boxShadow: '0 6px 20px rgba(17,24,39,0.05)',
        }}
      />
      {/* Background+Shadow @(33,215) 48x48 fill #DBEAFE radius 20 */}
      <div
        style={{
          position: 'absolute',
          left: 33,
          top: 215,
          width: 48,
          height: 48,
          background: '#DBEAFE',
          borderRadius: 20,
        }}
      />
      {/* building icon @(45,227) 24x24 stroke #2563EB */}
      <div
        style={{
          position: 'absolute',
          left: 45,
          top: 227,
          width: 24,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Building2 size={22} color="#2563EB" strokeWidth={2} />
      </div>
      {/* 'Agency Info' @(97,229.5) 189x19 */}
      <div
        style={{
          position: 'absolute',
          left: 97,
          top: 229.5,
          width: 189,
          height: 19,
          color: '#111827',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: 16,
          lineHeight: '19.4px',
          textAlign: 'left',
        }}
      >
        Agency Info
      </div>
      {/* Overlay+Shadow @(302,221) 36x36 fill #FFFFFF radius 18 */}
      <div
        style={{
          position: 'absolute',
          left: 302,
          top: 221,
          width: 36,
          height: 36,
          background: '#FFFFFF',
          borderRadius: 18,
          boxShadow: '0 2px 6px rgba(17,24,39,0.06)',
        }}
      />
      {/* chevron-up icon @(310,229) 20x20 stroke #6B7280 (expanded) */}
      <div
        style={{
          position: 'absolute',
          left: 310,
          top: 229,
          width: 20,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ChevronUp size={16} color="#6B7280" strokeWidth={1.67} />
      </div>

      {/* ---- Avatar upload (Frame 1171275467) @(37,263) 301x90 ---- */}
      {/* image circle @(157.5,266) 60x60 fill #EFEFEF border #FFFFFF fully rounded */}
      <div
        style={{
          position: 'absolute',
          left: 157.5,
          top: 266,
          width: 60,
          height: 60,
          background: 'linear-gradient(135deg, #E9E4F0, #D9CFEA)',
          border: '1px solid #FFFFFF',
          borderRadius: 9999,
          boxSizing: 'border-box',
        }}
      />
      {/* 'Upload image' @(122,333) 131x20 center */}
      <div
        style={{
          position: 'absolute',
          left: 122,
          top: 333,
          width: 131,
          height: 20,
          color: '#6B7280',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 11,
          lineHeight: '20px',
          textAlign: 'center',
        }}
      >
        Upload image
      </div>

      {/* HorizontalBorder top divider @(33,357) 309 wide, stroke #FFFFFF */}
      <div
        style={{
          position: 'absolute',
          left: 33,
          top: 357,
          width: 309,
          height: 0,
          borderTop: '1px solid #FFFFFF',
        }}
      />

      {/* ============ Field: Agency Name ============ */}
      <div
        style={{
          position: 'absolute',
          left: 53,
          top: 374,
          width: 285,
          height: 16,
          color: '#6B7280',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: 13,
          lineHeight: '15.7px',
          textAlign: 'left',
        }}
      >
        Agency Name
      </div>
      <div
        style={{
          position: 'absolute',
          left: 37,
          top: 398,
          width: 301,
          height: 52,
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 100,
          boxSizing: 'border-box',
          boxShadow: '0 1px 3px rgba(17,24,39,0.06)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 58,
          top: 415,
          width: 102,
          height: 18,
          color: '#111827',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 15,
          lineHeight: '18.2px',
          textAlign: 'left',
        }}
      >
        Stellar Talents
      </div>

      {/* ============ Field: Email Address ============ */}
      <div
        style={{
          position: 'absolute',
          left: 53,
          top: 466,
          width: 285,
          height: 16,
          color: '#6B7280',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: 13,
          lineHeight: '15.7px',
          textAlign: 'left',
        }}
      >
        Email Address
      </div>
      <div
        style={{
          position: 'absolute',
          left: 37,
          top: 490,
          width: 301,
          height: 52,
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 100,
          boxSizing: 'border-box',
          boxShadow: '0 1px 3px rgba(17,24,39,0.06)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 58,
          top: 507,
          width: 166,
          height: 18,
          color: '#111827',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 15,
          lineHeight: '18.2px',
          textAlign: 'left',
        }}
      >
        rohitkumar@gmail.com
      </div>

      {/* ============ Field: Phone ============ */}
      <div
        style={{
          position: 'absolute',
          left: 53,
          top: 558,
          width: 285,
          height: 16,
          color: '#6B7280',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: 13,
          lineHeight: '15.7px',
          textAlign: 'left',
        }}
      >
        Phone
      </div>
      <div
        style={{
          position: 'absolute',
          left: 37,
          top: 582,
          width: 301,
          height: 53,
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 100,
          boxSizing: 'border-box',
          boxShadow: '0 1px 3px rgba(17,24,39,0.06)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 58,
          top: 599,
          width: 123.8,
          height: 19,
          color: '#111827',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 15,
          lineHeight: '18.1px',
          textAlign: 'left',
        }}
      >
        +91 98765 43210
      </div>

      {/* ============ Field: Agency Website ============ */}
      <div
        style={{
          position: 'absolute',
          left: 53,
          top: 651,
          width: 285,
          height: 16,
          color: '#6B7280',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: 13,
          lineHeight: '15.7px',
          textAlign: 'left',
        }}
      >
        Agency Website
      </div>
      <div
        style={{
          position: 'absolute',
          left: 37,
          top: 675,
          width: 301,
          height: 52,
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 100,
          boxSizing: 'border-box',
          boxShadow: '0 1px 3px rgba(17,24,39,0.06)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 58,
          top: 692,
          width: 162,
          height: 18,
          color: '#111827',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 15,
          lineHeight: '18.2px',
          textAlign: 'left',
        }}
      >
        www.stellartalent.com
      </div>

      {/* ============ Save Changes button @(37,751) 301x56 fill #312B28 radius 100 ============ */}
      <div
        style={{
          position: 'absolute',
          left: 37,
          top: 751,
          width: 301,
          height: 56,
          background: '#312B28',
          borderRadius: 100,
          boxShadow: '0 8px 20px rgba(49,43,40,0.22)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 131.6,
          top: 769,
          width: 111.8,
          height: 20,
          color: '#FFFFFF',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 700,
          fontSize: 16,
          lineHeight: '19.4px',
          textAlign: 'center',
        }}
      >
        Save Changes
      </div>
    </div>
  );
}
