import type { CSSProperties } from 'react';
import { ChevronLeft, Users, MoreVertical } from 'lucide-react';

const IMG_PLACEHOLDER = 'linear-gradient(135deg,#E9E4F0,#D9CFEA)';

type Member = {
  top: number;
  name: string;
  nameWidth: number;
  status: 'active' | 'offline';
};

const MEMBERS: Member[] = [
  { top: 344, name: 'Sanjay Sharma', nameWidth: 142, status: 'active' },
  { top: 430, name: 'Riya Verma', nameWidth: 142, status: 'active' },
  { top: 516, name: 'Lisa Rai', nameWidth: 142, status: 'active' },
  { top: 602, name: 'Rahul Singh', nameWidth: 142, status: 'active' },
  { top: 688, name: 'Sonal Soni', nameWidth: 136, status: 'offline' },
];

const BADGE = {
  active: {
    left: 247,
    width: 59,
    bg: '#F0FDF4',
    border: '#7BF1A8',
    dot: '#05DF72',
    label: 'Active',
    labelColor: '#00A63E',
    labelWidth: 31,
  },
  offline: {
    left: 241,
    width: 65,
    bg: '#F1F5F9',
    border: '#E2E8F0',
    dot: '#D1D5DC',
    label: 'Offline',
    labelColor: '#64748B',
    labelWidth: 32,
  },
} as const;

export default function AgSalesPg() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: 375,
        height: 876,
        background: '#F8F5EF',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Decorative gradient circle */}
      <div
        style={{
          position: 'absolute',
          left: 240.6,
          top: -57.6,
          width: 192,
          height: 192,
          borderRadius: 9999,
          background:
            'linear-gradient(135deg, rgba(155,110,221,0.35), rgba(225,94,68,0.20))',
        }}
      />

      {/* Header */}
      <div
        style={{
          position: 'absolute',
          left: 16,
          top: 22,
          width: 36,
          height: 36,
          background: '#1F1A17',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ChevronLeft size={16} color="#FAF7F2" strokeWidth={1.35} />
      </div>
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
        Team
      </div>

      {/* Divider */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 80,
          width: 335,
          height: 1,
          background: '#E2E8F0',
        }}
      />

      {/* Sales summary card */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 101,
          width: 335,
          height: 179,
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 24,
          boxShadow: '0 8px 24px rgba(17,17,17,0.06)',
        }}
      />

      {/* Sales icon badge */}
      <div
        style={{
          position: 'absolute',
          left: 41,
          top: 118,
          width: 44,
          height: 44,
          background:
            'linear-gradient(135deg, rgba(225,94,68,0.28), rgba(225,94,68,0.23))',
          border: '1px solid #FFB5A0',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Users size={18} color="#E15E44" strokeWidth={2} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 101,
          top: 118,
          width: 171,
          height: 24,
          color: '#111111',
          fontWeight: 600,
          fontSize: 16,
          lineHeight: '24px',
        }}
      >
        Sales
      </div>
      <div
        style={{
          position: 'absolute',
          left: 101,
          top: 144,
          width: 171,
          height: 18,
          color: '#000000',
          fontWeight: 500,
          fontSize: 12,
          lineHeight: '18px',
        }}
      >
        10 Members
      </div>

      {/* Toggle (on) */}
      <div
        style={{
          position: 'absolute',
          left: 288,
          top: 127,
          width: 46,
          height: 26,
          background: 'linear-gradient(135deg, #7A8AE8, #9B6EDD)',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 310,
          top: 130,
          width: 20,
          height: 20,
          background: '#FFFFFF',
          borderRadius: 9999,
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      />

      {/* Inner divider between info and stats */}
      <div
        style={{
          position: 'absolute',
          left: 21,
          top: 203,
          width: 333,
          height: 1,
          background: '#F1F1F1',
        }}
      />

      {/* Stats row */}
      {/* Leads */}
      <div style={statNumStyle(21, '#111111')}>10</div>
      <div style={statLabelStyle(21)}>Leads</div>
      {/* Unattended */}
      <div style={statNumStyle(104.5, '#FF7E67')}>4</div>
      <div style={statLabelStyle(104.5)}>Unattended</div>
      {/* Contacted */}
      <div style={statNumStyle(188, '#3A7DE8')}>4</div>
      <div style={statLabelStyle(188)}>Contacted</div>
      {/* Converted */}
      <div style={statNumStyle(271.5, '#3E7D52')}>2</div>
      <div style={statLabelStyle(271.5)}>Converted</div>

      {/* Members header */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 302,
          width: 74,
          height: 24,
          color: '#111111',
          fontWeight: 600,
          fontSize: 16,
          lineHeight: '24px',
        }}
      >
        Members
      </div>
      <div
        style={{
          position: 'absolute',
          left: 250,
          top: 300,
          width: 105,
          height: 28,
          background: '#111111',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            color: '#F4F6F8',
            fontWeight: 500,
            fontSize: 12,
            lineHeight: '16px',
          }}
        >
          Add Members
        </span>
      </div>

      {/* Member cards */}
      {MEMBERS.map((m) => {
        const badge = BADGE[m.status];
        return (
          <div key={m.name}>
            {/* Card */}
            <div
              style={{
                position: 'absolute',
                left: 20,
                top: m.top,
                width: 335,
                height: 70,
                background: '#FFFFFF',
                border: '1px solid #FFFFFF',
                borderRadius: 40,
                boxShadow: '0 6px 18px rgba(17,17,17,0.05)',
              }}
            />
            {/* Avatar */}
            <div
              style={{
                position: 'absolute',
                left: 37,
                top: m.top + 13,
                width: 44,
                height: 44,
                borderRadius: 9999,
                background: IMG_PLACEHOLDER,
                border: '2px solid #FFFFFF',
              }}
            />
            {/* Name */}
            <div
              style={{
                position: 'absolute',
                left: 93,
                top: m.top + 17,
                width: m.nameWidth,
                height: 20,
                color: '#111111',
                fontWeight: 600,
                fontSize: 14,
                lineHeight: '20px',
              }}
            >
              {m.name}
            </div>
            {/* Role */}
            <div
              style={{
                position: 'absolute',
                left: 93,
                top: m.top + 37,
                width: m.nameWidth,
                height: 16,
                color: '#64748B',
                fontWeight: 400,
                fontSize: 12,
                lineHeight: '16px',
              }}
            >
              Sales
            </div>
            {/* Status badge */}
            <div
              style={{
                position: 'absolute',
                left: badge.left,
                top: m.top + 22,
                width: badge.width,
                height: 26,
                background: badge.bg,
                border: `1px solid ${badge.border}`,
                borderRadius: 9999,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 10,
                  top: 10,
                  width: 6,
                  height: 6,
                  background: badge.dot,
                  borderRadius: 9999,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 20,
                  top: 5,
                  width: badge.labelWidth,
                  height: 16,
                  color: badge.labelColor,
                  fontWeight: 500,
                  fontSize: 10,
                  lineHeight: '16px',
                }}
              >
                {badge.label}
              </div>
            </div>
            {/* Menu */}
            <div
              style={{
                position: 'absolute',
                left: 318,
                top: m.top + 27,
                width: 20,
                height: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MoreVertical size={16} color="#64748B" strokeWidth={2} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function statNumStyle(left: number, color: string): CSSProperties {
  return {
    position: 'absolute',
    left,
    top: 216,
    width: 82.5,
    height: 33,
    color,
    fontWeight: 600,
    fontSize: 22,
    lineHeight: '33px',
    textAlign: 'center',
  };
}

function statLabelStyle(left: number): CSSProperties {
  return {
    position: 'absolute',
    left,
    top: 251,
    width: 82.5,
    height: 15,
    color: '#AAAAAA',
    fontWeight: 700,
    fontSize: 10,
    lineHeight: '15px',
    textAlign: 'center',
  };
}
