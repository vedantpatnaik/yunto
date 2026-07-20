import { ChevronLeft, Plus, MoreVertical, X, User, Mail } from 'lucide-react';

/**
 * Agency — Add Creators (bottom-sheet modal state)
 * Figma node 7784:20329 — 375 x 876
 * Pixel-exact reproduction from the Figma outline.
 * All coordinates are root-frame-relative and absolutely positioned.
 */
export default function AgAddCreators2Pg() {
  return (
    <div
      className="relative overflow-hidden"
      style={{ width: 375, height: 876, background: '#F8F5EF', fontFamily: 'Inter, sans-serif' }}
    >
      {/* ===== Header ===== */}
      {/* Back button (dark circle) */}
      <div
        style={{
          position: 'absolute',
          left: 16,
          top: 22,
          width: 36,
          height: 36,
          background: '#1F1A17',
          borderRadius: 9999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        }}
      />
      <ChevronLeft
        style={{ position: 'absolute', left: 25.9, top: 31.9 }}
        width={16.2}
        height={16.2}
        color="#FAF7F2"
        strokeWidth={1.35}
      />
      {/* Heading */}
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
        Add Creators
      </div>

      {/* ===== Top card (behind scrim) ===== */}
      <div
        style={{
          position: 'absolute',
          left: 15,
          top: 106,
          width: 345,
          height: 266,
          background: '#FFFFFF',
          border: '1px solid #000000',
          borderRadius: 28,
        }}
      />
      {/* Card header — Creator / 50 Creators */}
      <div
        style={{
          position: 'absolute',
          left: 36,
          top: 125.8,
          width: 71,
          height: 23,
          color: '#111111',
          fontWeight: 600,
          fontSize: 15,
          lineHeight: '22.5px',
        }}
      >
        Creator
      </div>
      <div
        style={{
          position: 'absolute',
          left: 37,
          top: 146,
          width: 69,
          height: 18,
          color: '#888888',
          fontWeight: 500,
          fontSize: 12,
          lineHeight: '18px',
        }}
      >
        50 Creators
      </div>
      {/* Add Creator pill button */}
      <div
        style={{
          position: 'absolute',
          left: 218.1,
          top: 123,
          width: 120.9,
          height: 32,
          background: '#141311',
          borderRadius: 9999,
        }}
      />
      <Plus
        style={{ position: 'absolute', left: 234.1, top: 133 }}
        width={12}
        height={12}
        color="#FAF7F2"
        strokeWidth={2}
      />
      <div
        style={{
          position: 'absolute',
          left: 252.1,
          top: 131,
          width: 70.9,
          height: 16,
          color: '#FAF7F2',
          fontWeight: 700,
          fontSize: 12,
          lineHeight: '16px',
          textAlign: 'center',
        }}
      >
        Add Creator
      </div>

      {/* ===== Creator list — Card 1 (Leena) ===== */}
      <div
        style={{
          position: 'absolute',
          left: 37,
          top: 190,
          width: 301,
          height: 77,
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 58,
          top: 207.5,
          width: 42,
          height: 42,
          background: 'linear-gradient(135deg,#E9E4F0,#D9CFEA)',
          border: '1px solid #373636',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 116,
          top: 206,
          width: 100,
          height: 23,
          color: '#111111',
          fontWeight: 600,
          fontSize: 15,
          lineHeight: '22.5px',
        }}
      >
        Leena Sharma
      </div>
      <div
        style={{
          position: 'absolute',
          left: 116,
          top: 231.5,
          width: 70,
          height: 18,
          color: '#999999',
          fontWeight: 500,
          fontSize: 12,
          lineHeight: '18px',
        }}
      >
        @leenabliss
      </div>
      {/* Active badge */}
      <div
        style={{
          position: 'absolute',
          left: 232,
          top: 215.5,
          width: 59,
          height: 26,
          background: '#F0FDF4',
          border: '1px solid #7BF1A8',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 242,
          top: 225.5,
          width: 6,
          height: 6,
          background: '#05DF72',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 252,
          top: 220.5,
          width: 31,
          height: 16,
          color: '#00A63E',
          fontWeight: 500,
          fontSize: 10,
          lineHeight: '16px',
        }}
      >
        Active
      </div>
      <MoreVertical
        style={{ position: 'absolute', left: 311, top: 220.5 }}
        width={16}
        height={16}
        color="#64748B"
        strokeWidth={2}
      />

      {/* ===== Creator list — Card 2 (Riya) ===== */}
      <div
        style={{
          position: 'absolute',
          left: 37,
          top: 279,
          width: 301,
          height: 77,
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 58,
          top: 296.5,
          width: 42,
          height: 42,
          background: 'linear-gradient(135deg,#E9E4F0,#D9CFEA)',
          border: '1px solid #373636',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 116,
          top: 295,
          width: 78,
          height: 23,
          color: '#111111',
          fontWeight: 600,
          fontSize: 15,
          lineHeight: '22.5px',
        }}
      >
        Riya Verma
      </div>
      <div
        style={{
          position: 'absolute',
          left: 116,
          top: 320.5,
          width: 63,
          height: 18,
          color: '#999999',
          fontWeight: 500,
          fontSize: 12,
          lineHeight: '18px',
        }}
      >
        @Riyabliss
      </div>
      {/* Invite Sent badge */}
      <div
        style={{
          position: 'absolute',
          left: 210,
          top: 304.5,
          width: 79,
          height: 26,
          background: '#E5ECFF',
          border: '1px solid #6990FD',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 220,
          top: 314.5,
          width: 6,
          height: 6,
          background: '#1D4ED8',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 230,
          top: 309.5,
          width: 51,
          height: 16,
          color: '#1D4ED8',
          fontWeight: 500,
          fontSize: 10,
          lineHeight: '16px',
        }}
      >
        Invite Sent
      </div>
      <MoreVertical
        style={{ position: 'absolute', left: 309, top: 309.5 }}
        width={16}
        height={16}
        color="#64748B"
        strokeWidth={2}
      />

      {/* ===== Scrim (modal backdrop) ===== */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 375,
          height: 876,
          background: '#B5B4B9',
        }}
      />

      {/* ===== Bottom sheet ===== */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 493,
          width: 375,
          height: 383,
          background: '#FFFFFF',
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
        }}
      />
      {/* Drag handle */}
      <div
        style={{
          position: 'absolute',
          left: 167.5,
          top: 509,
          width: 40,
          height: 4,
          background: '#E5E5E5',
          borderRadius: 2,
        }}
      />
      {/* Title */}
      <div
        style={{
          position: 'absolute',
          left: 24,
          top: 537,
          width: 280,
          height: 31,
          color: '#111111',
          fontWeight: 600,
          fontSize: 24,
          lineHeight: '29px',
        }}
      >
        Add Creator{' '}
      </div>
      {/* Close button */}
      <div
        style={{
          position: 'absolute',
          left: 315,
          top: 537,
          width: 36,
          height: 36,
          background: '#F8F8F8',
          borderRadius: 18,
        }}
      />
      <X
        style={{ position: 'absolute', left: 323, top: 545 }}
        width={20}
        height={20}
        color="#555555"
        strokeWidth={1.67}
      />

      {/* Name field */}
      <div
        style={{
          position: 'absolute',
          left: 28,
          top: 599,
          width: 323,
          height: 17,
          color: '#6B7280',
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '16.9px',
        }}
      >
        Enter creator’s name
      </div>
      <div
        style={{
          position: 'absolute',
          left: 24,
          top: 624,
          width: 327,
          height: 52,
          background: '#FFFFFF',
          border: '1px solid #E8E8E8',
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 45,
          top: 641,
          width: 268,
          height: 18,
          color: '#111827',
          fontWeight: 500,
          fontSize: 15,
          lineHeight: '18.2px',
        }}
      >
        Full Name
      </div>
      <User
        style={{ position: 'absolute', left: 313, top: 640 }}
        width={20}
        height={20}
        color="#9CA3AF"
        strokeWidth={1.67}
      />

      {/* Email field */}
      <div
        style={{
          position: 'absolute',
          left: 28,
          top: 693,
          width: 323,
          height: 17,
          color: '#6B7280',
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '16.9px',
        }}
      >
        Enter creator’s email address
      </div>
      <div
        style={{
          position: 'absolute',
          left: 24,
          top: 718,
          width: 327,
          height: 52,
          background: '#FFFFFF',
          border: '1px solid #E5E5E5',
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 45,
          top: 735,
          width: 268,
          height: 18,
          color: '#111827',
          fontWeight: 500,
          fontSize: 15,
          lineHeight: '18.2px',
        }}
      >
        Email Address
      </div>
      <Mail
        style={{ position: 'absolute', left: 313, top: 734 }}
        width={20}
        height={20}
        color="#9CA3AF"
        strokeWidth={1.67}
      />

      {/* Send Invite button */}
      <div
        style={{
          position: 'absolute',
          left: 37,
          top: 792.7,
          width: 301,
          height: 55,
          background: '#312B28',
          borderRadius: 100,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 144,
          top: 810.7,
          width: 87,
          height: 19,
          color: '#FFFFFF',
          fontWeight: 600,
          fontSize: 16,
          lineHeight: '19.4px',
          textAlign: 'center',
        }}
      >
        Send Invite
      </div>
    </div>
  );
}
