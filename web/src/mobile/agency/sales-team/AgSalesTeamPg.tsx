import type { CSSProperties } from 'react';
import {
  ArrowLeft,
  Users,
  Lightbulb,
  Mail,
  MoreVertical,
  Wifi,
  Signal,
  BatteryFull,
} from 'lucide-react';

const clash = "'Clash Display', sans-serif";
const inter = 'Inter, sans-serif';
const urbanist = 'Urbanist, sans-serif';

type Avatar =
  | { type: 'image' }
  | {
      type: 'initial';
      letter: string;
      bg: string;
      color: string;
      letterWidth: number;
      align: 'left' | 'center';
    };

interface Member {
  rowTop: number;
  name: string;
  avatar: Avatar;
  badgeTop: number;
  badgeTextTop: number;
  status: string;
  statusColor: string;
}

const members: Member[] = [
  {
    rowTop: 347,
    name: 'Sanjay Sharma',
    avatar: { type: 'image' },
    badgeTop: 357,
    badgeTextTop: 361,
    status: 'Active',
    statusColor: '#4CCC16',
  },
  {
    rowTop: 415,
    name: 'Rahul Singh',
    avatar: {
      type: 'initial',
      letter: 'R',
      bg: '#C2E9CF',
      color: '#2A9A4F',
      letterWidth: 11,
      align: 'center',
    },
    badgeTop: 425,
    badgeTextTop: 429,
    status: 'Active',
    statusColor: '#4CCC16',
  },
  {
    rowTop: 483,
    name: 'Sonal Soni',
    avatar: {
      type: 'initial',
      letter: 'S',
      bg: '#A1BAE6',
      color: '#2158BA',
      letterWidth: 10,
      align: 'left',
    },
    badgeTop: 496,
    badgeTextTop: 500,
    status: 'Offline',
    statusColor: '#777876',
  },
  {
    rowTop: 551,
    name: 'Kunal Singh',
    avatar: {
      type: 'initial',
      letter: 'K',
      bg: '#CFA9DC',
      color: '#761D93',
      letterWidth: 11,
      align: 'left',
    },
    badgeTop: 561,
    badgeTextTop: 565,
    status: 'Offline',
    statusColor: '#777876',
  },
];

export default function AgSalesTeamPg() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: 375,
        height: 946,
        background: '#FFFFFF',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Frame '2' — content background */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 375,
          height: 946,
          background: '#FDFDFD',
        }}
      />

      {/* Decorative gradient blobs */}
      {/* Group 35898 — blue blob (top-left) */}
      <div
        style={{
          position: 'absolute',
          left: -16.4,
          top: 167.5,
          width: 163.4,
          height: 157.1,
          background: '#CCF5FD',
          borderRadius: '50%',
          filter: 'blur(28px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -25,
          top: 93,
          width: 157.1,
          height: 152.8,
          background:
            'linear-gradient(135deg, rgba(70,181,252,0.7), rgba(143,190,255,0.7))',
          borderRadius: '50%',
          filter: 'blur(28px)',
        }}
      />
      {/* Group 35897 — purple/pink blob (center) */}
      <div
        style={{
          position: 'absolute',
          left: 66.6,
          top: 612,
          width: 493.7,
          height: 488.6,
          background: '#FF90A9',
          borderRadius: '50%',
          filter: 'blur(40px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 135.2,
          top: 457.6,
          width: 476.7,
          height: 473.2,
          background: 'linear-gradient(135deg, #8673B3, #A79AC6)',
          borderRadius: '50%',
          filter: 'blur(40px)',
        }}
      />

      {/* Rectangle — background IMAGE overlay (frosted glass placeholder) */}
      <div
        style={{
          position: 'absolute',
          left: -13,
          top: 0,
          width: 402,
          height: 946,
          background: 'rgba(255,255,255,0.38)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      />

      {/* Container — header bar */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 70,
          width: 375,
          height: 54,
          background: '#FFFFFF',
          border: '1px solid #717171',
        }}
      />
      {/* header arrow icon (outline: meteor-icons:arrow-up) */}
      <div
        style={{
          position: 'absolute',
          left: 16,
          top: 85,
          width: 24,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ArrowLeft size={18} color="#000000" strokeWidth={2} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 44,
          top: 82,
          width: 298,
          height: 30,
          color: '#1B1B1C',
          fontFamily: clash,
          fontWeight: 500,
          fontSize: 20,
          lineHeight: '37px',
          textAlign: 'left',
        }}
      >
        Team
      </div>

      {/* Main card — ',manager view]' */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 136,
          width: 336,
          height: 525,
          background: '#FFFFFF',
          border: '1px solid #000000',
          borderRadius: 8,
        }}
      />

      {/* Card header — team avatar + name */}
      <div
        style={{
          position: 'absolute',
          left: 37,
          top: 151.5,
          width: 42,
          height: 42,
          background: '#FDFFBC',
          border: '1px solid #373636',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Users size={22} color="#000000" strokeWidth={1.5} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 86,
          top: 154.5,
          width: 172,
          height: 20,
          color: '#242220',
          fontFamily: clash,
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '20px',
        }}
      >
        Sales
      </div>
      {/* ph:users-fill small icon */}
      <div
        style={{
          position: 'absolute',
          left: 86,
          top: 175,
          width: 16,
          height: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Users size={14} color="#000000" strokeWidth={2} fill="#000000" />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 107,
          top: 172.5,
          width: 110,
          height: 21,
          color: '#000000',
          fontFamily: clash,
          fontWeight: 400,
          fontSize: 10,
          lineHeight: '24px',
        }}
      >
        10 Members
      </div>

      {/* button — toggle pill */}
      <div
        style={{
          position: 'absolute',
          left: 271,
          top: 158.5,
          width: 71,
          height: 27,
          background: '#FFFFFF',
          border: '0.586px solid #000000',
          borderRadius: 14.07,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 276.9,
          top: 164,
          width: 16,
          height: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Lightbulb size={13} color="#000000" strokeWidth={1.5} />
      </div>
      {/* toggle track */}
      <div
        style={{
          position: 'absolute',
          left: 300.9,
          top: 162.8,
          width: 36,
          height: 18.4,
          background: '#E6E6E6',
          borderRadius: 10.94,
        }}
      />
      {/* toggle knob */}
      <div
        style={{
          position: 'absolute',
          left: 302.3,
          top: 164.2,
          width: 16.9,
          height: 15.5,
          background: '#FFFFFF',
          borderRadius: 9.53,
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        }}
      />

      {/* Leads stats bar */}
      <div
        style={{
          position: 'absolute',
          left: 34,
          top: 215,
          width: 308,
          height: 64,
          background: '#FCFCFC',
          border: '1px solid #000000',
          borderRadius: 8,
        }}
      />
      {/* Leads label box */}
      <div
        style={{
          position: 'absolute',
          left: 35,
          top: 216,
          width: 52,
          height: 55,
          background: '#FDFFFB',
          border: '1px solid #000000',
          borderRadius: 8,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 48,
          top: 222,
          width: 25,
          height: 25,
          background: '#DAFDB0',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Mail size={15} color="#000000" strokeWidth={1.5} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 42,
          top: 247,
          width: 38,
          height: 20,
          color: '#242220',
          fontFamily: clash,
          fontWeight: 500,
          fontSize: 10,
          lineHeight: '20px',
          textAlign: 'center',
        }}
      >
        Leads
      </div>

      {/* Leads stats: All / Unattended / Contacted / Converted */}
      {/* All */}
      <div style={statNum(93, 39)}>10</div>
      <div style={statLabel(93, 39)}>All</div>
      {/* Unattended */}
      <div style={statNum(137, 52)}>4</div>
      <div style={statLabel(132, 61)}>Unattended</div>
      {/* Contacted */}
      <div style={statNum(225, 9)}>4</div>
      <div style={statLabel(204, 50)}>Contacted</div>
      {/* Converted */}
      <div style={statNum(297, 8)}>2</div>
      <div style={statLabel(275, 52)}>Converted</div>

      {/* Members section label */}
      <div
        style={{
          position: 'absolute',
          left: 37,
          top: 303,
          width: 149,
          height: 18,
          color: '#000000',
          fontFamily: clash,
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '17.5px',
        }}
      >
        Members
      </div>

      {/* Add Members button */}
      <div
        style={{
          position: 'absolute',
          left: 254,
          top: 300,
          width: 86,
          height: 23,
          background: '#212020',
          border: '1px solid #131414',
          borderRadius: 8,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 262,
          top: 300,
          width: 70,
          height: 24,
          color: '#FFFDFD',
          fontFamily: clash,
          fontWeight: 500,
          fontSize: 10,
          lineHeight: '24px',
          textAlign: 'center',
        }}
      >
        Add Members
      </div>

      {/* Member rows */}
      {members.map((m) => {
        const av = m.avatar;
        return (
          <div key={m.name}>
            {/* Input row container */}
            <div
              style={{
                position: 'absolute',
                left: 37,
                top: m.rowTop,
                width: 303,
                height: 62,
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: 8,
              }}
            />
            {/* avatar */}
            <div
              style={{
                position: 'absolute',
                left: 47,
                top: m.rowTop + 8,
                width: 42,
                height: 42,
                background:
                  av.type === 'initial'
                    ? av.bg
                    : 'linear-gradient(135deg, #E9E4F0, #D9CFEA)',
                border: '1px solid #373636',
                borderRadius: 9999,
              }}
            />
            {av.type === 'initial' && (
              <div
                style={{
                  position: 'absolute',
                  left: 63,
                  top: m.rowTop + 17,
                  width: av.letterWidth,
                  height: 24,
                  color: av.color,
                  fontFamily: clash,
                  fontWeight: 500,
                  fontSize: 15,
                  lineHeight: '24px',
                  textAlign: av.align,
                }}
              >
                {av.letter}
              </div>
            )}
            {/* name */}
            <div
              style={{
                position: 'absolute',
                left: 102,
                top: m.rowTop + 8,
                width: 110,
                height: 24,
                color: '#000000',
                fontFamily: clash,
                fontWeight: 500,
                fontSize: 15,
                lineHeight: '24px',
              }}
            >
              {m.name}
            </div>
            {/* role */}
            <div
              style={{
                position: 'absolute',
                left: 102,
                top: m.rowTop + 27,
                width: 99,
                height: 23,
                color: '#000000',
                fontFamily: inter,
                fontWeight: 400,
                fontSize: 10,
                lineHeight: '24px',
              }}
            >
              Sales
            </div>
            {/* dots menu */}
            <div
              style={{
                position: 'absolute',
                left: 313,
                top: m.rowTop + 7,
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MoreVertical size={16} color="#000000" strokeWidth={2} />
            </div>
            {/* status badge */}
            <div
              style={{
                position: 'absolute',
                left: 222,
                top: m.badgeTop,
                width: 53,
                height: 20,
                background: '#FFFFFF',
                border: '1px solid #000000',
                borderRadius: 24,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 228,
                top: m.badgeTextTop,
                width: 41,
                height: 12,
                color: m.statusColor,
                fontFamily: inter,
                fontWeight: 500,
                fontSize: 8,
                lineHeight: '16px',
                textAlign: 'center',
              }}
            >
              {m.status}
            </div>
          </div>
        );
      })}

      {/* Status bar */}
      <div
        style={{
          position: 'absolute',
          left: 21,
          top: 19,
          width: 54,
          height: 18,
          color: '#000000',
          fontFamily: urbanist,
          fontWeight: 600,
          fontSize: 15,
          lineHeight: '18px',
          textAlign: 'center',
        }}
      >
        19:56
      </div>
      <div style={{ position: 'absolute', left: 294, top: 21, width: 17, height: 12 }}>
        <Signal size={16} color="#000000" strokeWidth={2} fill="#000000" />
      </div>
      <div style={{ position: 'absolute', left: 315, top: 21, width: 16, height: 12 }}>
        <Wifi size={16} color="#000000" strokeWidth={2} />
      </div>
      <div style={{ position: 'absolute', left: 333, top: 19, width: 26, height: 14 }}>
        <BatteryFull size={24} color="#000000" strokeWidth={1.5} />
      </div>
    </div>
  );
}

function statNum(left: number, width: number): CSSProperties {
  return {
    position: 'absolute',
    left,
    top: 232,
    width,
    height: 15,
    color: '#000000',
    fontFamily: clash,
    fontWeight: 600,
    fontSize: 12,
    lineHeight: '15px',
    textAlign: 'center',
  };
}

function statLabel(left: number, width: number): CSSProperties {
  return {
    position: 'absolute',
    left,
    top: 248,
    width,
    height: 13,
    color: '#000000',
    fontFamily: clash,
    fontWeight: 400,
    fontSize: 10,
    lineHeight: '12.5px',
    textAlign: 'center',
  };
}
