import {
  ArrowLeft,
  Filter,
  ArrowUpDown,
  Search,
  Users,
  User,
  Globe,
  Star,
  Phone,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Flame,
  Frown,
  Cat,
  Wifi,
  BatteryFull,
  SignalHigh,
} from 'lucide-react';

const CLASH = "'Clash Display', sans-serif";
const URBANIST = 'Urbanist, sans-serif';

type CardData = {
  left: number;
  top: number;
  avatarRing?: string;
  name: string;
  nameWidth: number;
  handle: string;
  emoji: 'fire' | 'sad' | 'cry';
  followers: string;
  followersW: number;
  views: string;
  viewsW: number;
  leads: string;
  leadsW: number;
  callLeft: number;
  arrowLeft: number;
  trend: 'increase' | 'below' | 'decrease';
  checkLeft: number;
  checkTop: number;
  checkFill: string;
};

const cards: CardData[] = [
  {
    left: 17, top: 224, name: 'Leena Sharma', nameWidth: 89, handle: '@leenabliss',
    emoji: 'fire', followers: '1.2M', followersW: 22, views: '900k views', viewsW: 58,
    leads: '89 leads', leadsW: 42, callLeft: 280, arrowLeft: 309, trend: 'increase',
    checkLeft: 322, checkTop: 53, checkFill: '#D9D9D9',
  },
  {
    left: 17, top: 307, name: 'Khushi Sharma', nameWidth: 97, handle: '@khushi111',
    avatarRing: '#25AEFD', emoji: 'sad', followers: '1.2M', followersW: 22, views: '300k views',
    viewsW: 58, leads: '39 leads', leadsW: 42, callLeft: 280, arrowLeft: 309, trend: 'below',
    checkLeft: 321, checkTop: 52, checkFill: '#D9D9D9',
  },
  {
    left: 17, top: 390, name: 'Diya Sharma', nameWidth: 80, handle: '@diya444',
    avatarRing: '#B5B5B5', emoji: 'cry', followers: '1.1M', followersW: 19, views: '30k views',
    viewsW: 51, leads: '5 leads', leadsW: 35, callLeft: 275, arrowLeft: 304, trend: 'decrease',
    checkLeft: 322, checkTop: 52, checkFill: '#FFFFFF',
  },
  {
    left: 18, top: 473, name: 'Leena Sharma', nameWidth: 89, handle: '@leenabliss',
    emoji: 'fire', followers: '1.2M', followersW: 22, views: '900k views', viewsW: 58,
    leads: '89 leads', leadsW: 42, callLeft: 280, arrowLeft: 309, trend: 'increase',
    checkLeft: 322, checkTop: 53, checkFill: '#D9D9D9',
  },
  {
    left: 18, top: 556, name: 'Khushi Sharma', nameWidth: 97, handle: '@khushi111',
    avatarRing: '#25AEFD', emoji: 'sad', followers: '1.2M', followersW: 22, views: '300k views',
    viewsW: 58, leads: '39 leads', leadsW: 42, callLeft: 280, arrowLeft: 309, trend: 'below',
    checkLeft: 321, checkTop: 52, checkFill: '#D9D9D9',
  },
  {
    left: 18, top: 639, name: 'Diya Sharma', nameWidth: 80, handle: '@diya444',
    avatarRing: '#B5B5B5', emoji: 'cry', followers: '1.1M', followersW: 19, views: '30k views',
    viewsW: 51, leads: '5 leads', leadsW: 35, callLeft: 275, arrowLeft: 304, trend: 'decrease',
    checkLeft: 320, checkTop: 52, checkFill: '#FFFFFF',
  },
  {
    left: 18, top: 722, name: 'Khushi Sharma', nameWidth: 97, handle: '@khushi111',
    avatarRing: '#25AEFD', emoji: 'sad', followers: '1.2M', followersW: 22, views: '300k views',
    viewsW: 58, leads: '39 leads', leadsW: 42, callLeft: 280, arrowLeft: 309, trend: 'below',
    checkLeft: 321, checkTop: 52, checkFill: '#D9D9D9',
  },
  {
    left: 18, top: 805, name: 'Diya Sharma', nameWidth: 80, handle: '@diya444',
    avatarRing: '#B5B5B5', emoji: 'cry', followers: '1.1M', followersW: 19, views: '30k views',
    viewsW: 51, leads: '5 leads', leadsW: 35, callLeft: 275, arrowLeft: 304, trend: 'decrease',
    checkLeft: 321, checkTop: 52, checkFill: '#FFFFFF',
  },
];

function EmojiIcon({ kind }: { kind: 'fire' | 'sad' | 'cry' }) {
  if (kind === 'fire') return <Flame size={16} color="#FF5141" fill="#FF953D" />;
  if (kind === 'sad') return <Frown size={16} color="#FFB02E" />;
  return <Cat size={16} color="#E3821D" />;
}

function StatText({ left, width, children }: { left: number; width: number; children: string }) {
  return (
    <span
      style={{
        position: 'absolute', left, top: 32, width, height: 16,
        fontFamily: CLASH, fontWeight: 500, fontSize: 10.2, lineHeight: '16px',
        color: '#000000', whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

function TrendBlock({ type }: { type: 'increase' | 'below' | 'decrease' }) {
  if (type === 'increase') {
    const c = '#FD564B';
    return (
      <>
        <TrendingUp size={13} color={c} style={{ position: 'absolute', left: 44, top: 51 }} />
        <span style={{ position: 'absolute', left: 60, top: 50, width: 64, fontFamily: CLASH, fontWeight: 500, fontSize: 8, lineHeight: '16px', color: c, whiteSpace: 'nowrap' }}>+35% above avg</span>
        <IndianRupee size={13} color={c} style={{ position: 'absolute', left: 131, top: 51 }} />
        <span style={{ position: 'absolute', left: 148, top: 50, width: 90, fontFamily: CLASH, fontWeight: 500, fontSize: 8, lineHeight: '16px', color: c, whiteSpace: 'nowrap' }}>Suggestion: Increase</span>
      </>
    );
  }
  if (type === 'below') {
    const c = '#25AEFD';
    return (
      <>
        <TrendingDown size={13} color={c} style={{ position: 'absolute', left: 44, top: 51 }} />
        <span style={{ position: 'absolute', left: 60, top: 50, width: 70, fontFamily: CLASH, fontWeight: 500, fontSize: 8, lineHeight: '16px', color: c, whiteSpace: 'nowrap' }}>-15% below avg</span>
      </>
    );
  }
  const c = '#666767';
  return (
    <>
      <TrendingDown size={13} color={c} style={{ position: 'absolute', left: 43, top: 50 }} />
      <span style={{ position: 'absolute', left: 59, top: 49, width: 42, fontFamily: CLASH, fontWeight: 500, fontSize: 8, lineHeight: '16px', color: c, whiteSpace: 'nowrap' }}>-15% avg</span>
      <IndianRupee size={13} color={c} style={{ position: 'absolute', left: 106, top: 50 }} />
      <span style={{ position: 'absolute', left: 123, top: 49, width: 95, fontFamily: CLASH, fontWeight: 500, fontSize: 8, lineHeight: '16px', color: c, whiteSpace: 'nowrap' }}>Suggestion: Decrease</span>
    </>
  );
}

function CreatorCard(props: CardData) {
  return (
    <div
      style={{
        position: 'absolute', left: props.left, top: props.top, width: 343, height: 75,
        background: '#FBFFFC', border: '1px solid #000000', borderRadius: 12,
      }}
    >
      {/* avatar */}
      <div
        style={{
          position: 'absolute', left: 7, top: 12, width: 32, height: 32, borderRadius: 9999,
          background: 'linear-gradient(135deg,#E9E4F0,#D9CFEA)',
          border: props.avatarRing ? `2px solid ${props.avatarRing}` : 'none',
        }}
      />
      {/* emoji */}
      <div style={{ position: 'absolute', left: 23, top: 33, width: 16, height: 16 }}>
        <EmojiIcon kind={props.emoji} />
      </div>
      {/* name */}
      <span
        style={{
          position: 'absolute', left: 42, top: 12, width: props.nameWidth, height: 18,
          fontFamily: CLASH, fontWeight: 500, fontSize: 12, lineHeight: '18px',
          color: '#000000', whiteSpace: 'nowrap',
        }}
      >
        {props.name}
      </span>
      {/* handle */}
      <span
        style={{
          position: 'absolute', left: 42 + props.nameWidth + 8, top: 14.5, width: 51, height: 13,
          fontFamily: CLASH, fontWeight: 500, fontSize: 8, lineHeight: '13px',
          color: '#000000', whiteSpace: 'nowrap',
        }}
      >
        {props.handle}
      </span>
      {/* stats icons */}
      <User size={14} color="#000000" style={{ position: 'absolute', left: 43, top: 33 }} />
      <StatText left={61} width={props.followersW}>{props.followers}</StatText>
      <Globe size={13} color="#000000" style={{ position: 'absolute', left: 92, top: 33 }} />
      <StatText left={111} width={props.viewsW}>{props.views}</StatText>
      <Star size={13} color="#000000" style={{ position: 'absolute', left: 178, top: 33 }} />
      <StatText left={197} width={props.leadsW}>{props.leads}</StatText>
      {/* trend */}
      <TrendBlock type={props.trend} />
      {/* call button */}
      <div
        style={{
          position: 'absolute', left: props.callLeft, top: 12, width: 25, height: 25,
          background: '#FFFFFF', border: '1px solid #EAEAEA', borderRadius: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Phone size={14} color="#000000" />
      </div>
      {/* arrow button */}
      <div
        style={{
          position: 'absolute', left: props.arrowLeft, top: 12, width: 25, height: 25,
          background: '#FFFFFF', border: '1px solid #EAEAEA', borderRadius: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <ArrowUpRight size={16} color="#000000" strokeWidth={1.5} />
      </div>
      {/* checkbox */}
      <div
        style={{
          position: 'absolute', left: props.checkLeft, top: props.checkTop, width: 15, height: 15,
          background: props.checkFill, border: '1px solid #000000', borderRadius: 5,
        }}
      />
    </div>
  );
}

export default function AgCreators10Pg() {
  return (
    <div
      className="relative overflow-hidden"
      style={{ width: 375, height: 931, background: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}
    >
      {/* ===== decorative background blobs ===== */}
      <div style={{ position: 'absolute', left: -25, top: 93, width: 157.1, height: 152.8, borderRadius: 9999, background: 'linear-gradient(135deg, rgba(70,181,252,0.7), rgba(143,190,255,0.7))' }} />
      <div style={{ position: 'absolute', left: -16.4, top: 167.5, width: 163.4, height: 157.1, borderRadius: 9999, background: '#CCF5FD', opacity: 0.7 }} />
      <div style={{ position: 'absolute', left: 66.6, top: 612, width: 493.7, height: 488.6, borderRadius: 9999, background: '#FF90A9', opacity: 0.5 }} />
      <div style={{ position: 'absolute', left: 135.2, top: 457.6, width: 476.7, height: 473.2, borderRadius: 9999, background: 'linear-gradient(135deg, #8673B3, #A79AC6)', opacity: 0.5 }} />

      {/* ===== full-bleed image overlay (frosted placeholder) ===== */}
      <div
        style={{
          position: 'absolute', left: -13, top: 0, width: 402, height: 2045,
          background: 'linear-gradient(135deg, rgba(240,238,247,0.6), rgba(223,214,238,0.55))',
        }}
      />

      {/* ===== status bar ===== */}
      <span
        style={{
          position: 'absolute', left: 19, top: 31, width: 54, height: 18, textAlign: 'center',
          fontFamily: URBANIST, fontWeight: 600, fontSize: 15, lineHeight: '18px', color: '#000000',
        }}
      >
        19:56
      </span>
      <SignalHigh size={16} color="#000000" style={{ position: 'absolute', left: 292, top: 34 }} />
      <Wifi size={15} color="#000000" style={{ position: 'absolute', left: 314, top: 34 }} />
      <BatteryFull size={24} color="#000000" style={{ position: 'absolute', left: 333, top: 33 }} />

      {/* ===== header container ===== */}
      <div
        style={{
          position: 'absolute', left: 0, top: 70, width: 375, height: 54,
          background: '#FFFFFF', border: '1px solid #717171',
        }}
      >
        <ArrowLeft size={22} color="#000000" strokeWidth={2} style={{ position: 'absolute', left: 16, top: 15 }} />
        <span
          style={{
            position: 'absolute', left: 44, top: 12, width: 298, height: 30,
            fontFamily: CLASH, fontWeight: 500, fontSize: 20, lineHeight: '30px', color: '#1B1B1C',
          }}
        >
          Creators
        </span>
      </div>

      {/* ===== filter / sort row ===== */}
      <div
        style={{
          position: 'absolute', left: 16, top: 134, width: 166, height: 36,
          background: '#FFFFFF', border: '1px solid #100F0F', borderRadius: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
        }}
      >
        <Filter size={18} color="#000000" />
        <span style={{ fontFamily: CLASH, fontWeight: 500, fontSize: 12, lineHeight: '16px', color: '#000000' }}>Filter</span>
      </div>
      <div
        style={{
          position: 'absolute', left: 192, top: 134, width: 166, height: 36,
          background: '#FFFFFF', border: '1px solid #100F0F', borderRadius: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
        }}
      >
        <ArrowUpDown size={18} color="#000000" />
        <span style={{ fontFamily: CLASH, fontWeight: 500, fontSize: 12, lineHeight: '16px', color: '#000000' }}>Sort by</span>
      </div>

      {/* ===== search row ===== */}
      <div
        style={{
          position: 'absolute', left: 16, top: 180, width: 235, height: 36,
          background: '#FFFFFF', border: '1px solid #100F0F', borderRadius: 24,
        }}
      >
        <Search size={18} color="#000000" strokeWidth={1.5} style={{ position: 'absolute', left: 8.5, top: 9 }} />
        <span
          style={{
            position: 'absolute', left: 31.5, top: 10, width: 195, height: 16,
            fontFamily: CLASH, fontWeight: 400, fontSize: 10, lineHeight: '16px', color: '#000000',
          }}
        >
          Search Creators
        </span>
      </div>
      {/* D / W / M pills */}
      <div style={{ position: 'absolute', left: 261, top: 183, width: 30, height: 30, borderRadius: 9999, background: '#000000', border: '1px solid #DCDCDC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: CLASH, fontWeight: 500, fontSize: 15, color: '#FFFFFF' }}>D</span>
      </div>
      <div style={{ position: 'absolute', left: 295, top: 183, width: 30, height: 30, borderRadius: 9999, background: '#B1B1B1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: URBANIST, fontWeight: 600, fontSize: 15, color: '#000000' }}>W</span>
      </div>
      <div style={{ position: 'absolute', left: 329, top: 183, width: 30, height: 30, borderRadius: 9999, background: '#B1B1B1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: URBANIST, fontWeight: 600, fontSize: 15, color: '#000000' }}>M</span>
      </div>

      {/* ===== creator cards ===== */}
      {cards.map((c) => (
        <CreatorCard key={`${c.name}-${c.top}`} {...c} />
      ))}

      {/* ===== total pill ===== */}
      <div
        style={{
          position: 'absolute', left: 123, top: 814, width: 133, height: 23.4,
          background: '#DBDBDB', border: '0.65px solid #100F0F', borderRadius: 15.57,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}
      >
        <Users size={11} color="#000000" fill="#000000" />
        <span style={{ fontFamily: CLASH, fontWeight: 500, fontSize: 9, lineHeight: '10.4px', color: '#000000' }}>
          Total: 49 Creators
        </span>
      </div>

      {/* ===== share button ===== */}
      <div
        style={{
          position: 'absolute', left: 19, top: 847, width: 335, height: 48,
          background: '#B7D0EE', border: '1px solid #000000', borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <span style={{ fontFamily: CLASH, fontWeight: 500, fontSize: 15, lineHeight: '18.5px', color: '#333333' }}>
          Share
        </span>
      </div>
    </div>
  );
}
