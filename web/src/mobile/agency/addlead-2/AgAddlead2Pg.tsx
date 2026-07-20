import type { ReactNode, CSSProperties } from 'react';
import {
  ChevronLeft,
  Instagram,
  Youtube,
  Plus,
  Tag,
  Globe,
  Mail,
  User,
  Phone,
  FileText,
  MapPin,
} from 'lucide-react';

const sectionLabel = (
  _text: string,
  left: number,
  top: number,
  width: number
): CSSProperties => ({
  position: 'absolute',
  left,
  top,
  width,
  height: 17,
  fontSize: 11,
  lineHeight: '16.5px',
  fontWeight: 600,
  color: '#888888',
  fontFamily: 'Inter, sans-serif',
  whiteSpace: 'nowrap',
});

function Field(props: {
  label: string;
  top: number;
  placeholder: string;
  icon: ReactNode;
}) {
  const { label, top, placeholder, icon } = props;
  return (
    <>
      <div style={sectionLabel(label, 45, top, 285)}>{label}</div>
      <div
        style={{
          position: 'absolute',
          left: 45,
          top: top + 25,
          width: 285,
          height: 51,
          background: '#F8F9FA',
          border: '1px solid #EFEFEF',
          borderRadius: 18,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 62,
          top: top + 43,
          width: 15,
          height: 15,
          color: '#BBBBBB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 89,
          top: top + 40,
          width: 224,
          height: 21,
          fontSize: 14,
          lineHeight: '21px',
          fontWeight: 500,
          color: '#BBBBBB',
          fontFamily: 'Inter, sans-serif',
          whiteSpace: 'nowrap',
        }}
      >
        {placeholder}
      </div>
    </>
  );
}

export default function AgAddlead2Pg() {
  const cardStyle: CSSProperties = {
    position: 'absolute',
    left: 24,
    width: 327,
    background: '#FFFFFF',
    border: '1px solid rgba(0,0,0,0.06)',
    borderRadius: 28,
    boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
  };

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
      {/* ===== Header ===== */}
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
          width: 192,
          height: 24,
          fontSize: 20,
          lineHeight: '24px',
          fontWeight: 500,
          color: '#141311',
          fontFamily: 'Geist, sans-serif',
          whiteSpace: 'nowrap',
        }}
      >
        Add Lead
      </div>

      {/* ===== CAMPAIGN TYPE ===== */}
      <div style={sectionLabel('CAMPAIGN TYPE', 24, 106, 327)}>CAMPAIGN TYPE</div>
      <div
        style={{
          position: 'absolute',
          left: 24,
          top: 135,
          width: 160.5,
          height: 46,
          background: '#FFFFFF',
          border: '1px solid #EAEAEA',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          fontWeight: 600,
          color: '#555555',
        }}
      >
        Barter
      </div>
      <div
        style={{
          position: 'absolute',
          left: 192.5,
          top: 135,
          width: 158.5,
          height: 45.5,
          background: '#312B28',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          fontWeight: 600,
          color: '#FFFFFF',
        }}
      >
        Paid
      </div>

      {/* ===== PLATFORMS ===== */}
      <div style={sectionLabel('PLATFORMS', 24, 205, 327)}>PLATFORMS</div>
      {/* Instagram chip */}
      <div
        style={{
          position: 'absolute',
          left: 24,
          top: 234,
          width: 110.3,
          height: 36,
          background: '#EDF2F6',
          border: '1px solid #A8C7F4',
          borderRadius: 9999,
        }}
      />
      <div style={{ position: 'absolute', left: 39, top: 245, width: 14, height: 14 }}>
        <Instagram size={14} color="#3A5C7E" strokeWidth={1.17} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 61,
          top: 243,
          width: 58.3,
          height: 18,
          fontSize: 12,
          lineHeight: '18px',
          fontWeight: 600,
          color: '#3A5C7E',
          whiteSpace: 'nowrap',
        }}
      >
        Instagram
      </div>
      {/* YouTube chip */}
      <div
        style={{
          position: 'absolute',
          left: 142.3,
          top: 234,
          width: 102.4,
          height: 36,
          background: '#F5F0FA',
          border: '1px solid #C5A8F4',
          borderRadius: 9999,
        }}
      />
      <div style={{ position: 'absolute', left: 157.3, top: 245, width: 14, height: 14 }}>
        <Youtube size={14} color="#6A3A7E" strokeWidth={1.17} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 179.3,
          top: 243,
          width: 50.4,
          height: 18,
          fontSize: 12,
          lineHeight: '18px',
          fontWeight: 600,
          color: '#6A3A7E',
          whiteSpace: 'nowrap',
        }}
      >
        YouTube
      </div>
      {/* Add button (platforms) */}
      <div
        style={{
          position: 'absolute',
          left: 252.7,
          top: 234,
          width: 72.5,
          height: 36,
          background: '#FFFFFF',
          border: '1px solid #DDDDDD',
          borderRadius: 9999,
        }}
      />
      <div style={{ position: 'absolute', left: 267.7, top: 245.5, width: 13, height: 13 }}>
        <Plus size={13} color="#AAAAAA" strokeWidth={1.08} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 286.7,
          top: 243,
          width: 23.5,
          height: 18,
          fontSize: 12,
          lineHeight: '18px',
          fontWeight: 600,
          color: '#AAAAAA',
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        Add
      </div>

      {/* ===== NICHE ===== */}
      <div style={sectionLabel('NICHE', 24, 294, 327)}>NICHE</div>
      {/* Lifestyle */}
      <div
        style={{
          position: 'absolute',
          left: 24,
          top: 323,
          width: 75.8,
          height: 32,
          background: '#FEF9EE',
          border: '1px solid #F4E4BC',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 37,
          top: 330,
          width: 49.8,
          height: 18,
          fontSize: 12,
          lineHeight: '18px',
          fontWeight: 600,
          color: '#7E5C2A',
          whiteSpace: 'nowrap',
        }}
      >
        Lifestyle
      </div>
      {/* Fitness */}
      <div
        style={{
          position: 'absolute',
          left: 107.8,
          top: 323,
          width: 68.1,
          height: 32,
          background: '#F0F5F1',
          border: '1px solid #C5DEC5',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 120.8,
          top: 330,
          width: 42.1,
          height: 18,
          fontSize: 12,
          lineHeight: '18px',
          fontWeight: 600,
          color: '#3E5C45',
          whiteSpace: 'nowrap',
        }}
      >
        Fitness
      </div>
      {/* Fashion */}
      <div
        style={{
          position: 'absolute',
          left: 183.9,
          top: 323,
          width: 71.4,
          height: 32,
          background: '#F5F0FA',
          border: '1px solid #DDD4EF',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 196.9,
          top: 330,
          width: 45.5,
          height: 18,
          fontSize: 12,
          lineHeight: '18px',
          fontWeight: 600,
          color: '#6A3A7E',
          whiteSpace: 'nowrap',
        }}
      >
        Fashion
      </div>
      {/* Add button (niche) */}
      <div
        style={{
          position: 'absolute',
          left: 263.3,
          top: 323,
          width: 64.5,
          height: 32,
          border: '1px solid #DDDDDD',
          borderRadius: 9999,
        }}
      />
      <div style={{ position: 'absolute', left: 276.3, top: 333.5, width: 11, height: 11 }}>
        <Plus size={11} color="#AAAAAA" strokeWidth={0.92} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 291.3,
          top: 330,
          width: 23.5,
          height: 18,
          fontSize: 12,
          lineHeight: '18px',
          fontWeight: 600,
          color: '#AAAAAA',
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        Add
      </div>

      {/* ===== Card 1 (brand details) ===== */}
      <div style={{ ...cardStyle, top: 379, height: 831 }} />
      <Field
        label="BRAND NAME"
        top={400}
        placeholder="e.g. Lumina Skin"
        icon={<Tag size={15} strokeWidth={1.25} />}
      />
      <Field
        label="BRAND WEBSITE"
        top={496}
        placeholder="https://"
        icon={<Globe size={15} strokeWidth={1.25} />}
      />
      <Field
        label="EMAIL ADDRESS"
        top={592}
        placeholder="brand@example.com"
        icon={<Mail size={15} strokeWidth={1.25} />}
      />
      <Field
        label="CONTACT PERSON"
        top={688}
        placeholder="Full name"
        icon={<User size={15} strokeWidth={1.25} />}
      />
      <Field
        label="PHONE NUMBER"
        top={784}
        placeholder="+1 (000) 000-0000"
        icon={<Phone size={15} strokeWidth={1.25} />}
      />
      {/* CAMPAIGN BUDGET (custom) */}
      <div style={sectionLabel('CAMPAIGN BUDGET', 45, 880, 285)}>CAMPAIGN BUDGET</div>
      <div
        style={{
          position: 'absolute',
          left: 45,
          top: 905,
          width: 285,
          height: 51,
          background: '#F8F9FA',
          border: '1px solid #EFEFEF',
          borderRadius: 18,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 62,
          top: 920,
          width: 8,
          height: 21,
          fontSize: 14,
          lineHeight: '21px',
          fontWeight: 500,
          color: '#BBBBBB',
        }}
      >
        ₹
      </div>
      <div
        style={{
          position: 'absolute',
          left: 78,
          top: 920,
          width: 30.6,
          height: 21,
          fontSize: 14,
          lineHeight: '21px',
          fontWeight: 500,
          color: '#BBBBBB',
        }}
      >
        0.00
      </div>
      {/* NO. OF INFLUENCERS (custom, no icon) */}
      <div style={sectionLabel('NO. OF INFLUENCERS', 45, 992, 285)}>NO. OF INFLUENCERS</div>
      <div
        style={{
          position: 'absolute',
          left: 45,
          top: 1017,
          width: 285,
          height: 51,
          background: '#F8F9FA',
          border: '1px solid #EFEFEF',
          borderRadius: 18,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 62,
          top: 1032,
          width: 37.4,
          height: 21,
          fontSize: 14,
          lineHeight: '21px',
          fontWeight: 500,
          color: '#BBBBBB',
        }}
      >
        e.g. 5
      </div>
      <Field
        label="DELIVERABLES PER CREATOR"
        top={1104}
        placeholder="e.g. 2 Reels + 1 Story"
        icon={<FileText size={15} strokeWidth={1.25} />}
      />

      {/* ===== Card 2 (audience) ===== */}
      <div style={{ ...cardStyle, top: 1234, height: 409 }} />
      {/* CITIES */}
      <div style={sectionLabel('CITIES', 45, 1255, 285)}>CITIES</div>
      <div
        style={{
          position: 'absolute',
          left: 45,
          top: 1284,
          width: 70,
          height: 32,
          background: '#EDF2F6',
          borderRadius: 9999,
        }}
      />
      <div style={{ position: 'absolute', left: 57, top: 1295, width: 10, height: 10 }}>
        <MapPin size={10} color="#3A5C7E" strokeWidth={0.83} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 73,
          top: 1291,
          width: 30,
          height: 18,
          fontSize: 12,
          lineHeight: '18px',
          fontWeight: 600,
          color: '#3A5C7E',
          whiteSpace: 'nowrap',
        }}
      >
        Delhi
      </div>
      <div
        style={{
          position: 'absolute',
          left: 123,
          top: 1284,
          width: 117.7,
          height: 32,
          border: '1px solid #DDDDDD',
          borderRadius: 9999,
        }}
      />
      <div style={{ position: 'absolute', left: 136, top: 1294.5, width: 11, height: 11 }}>
        <Plus size={11} color="#AAAAAA" strokeWidth={0.92} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 151,
          top: 1291,
          width: 76.7,
          height: 18,
          fontSize: 12,
          lineHeight: '18px',
          fontWeight: 600,
          color: '#AAAAAA',
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        Add Location
      </div>
      {/* GENDER */}
      <div style={sectionLabel('GENDER', 45, 1336, 285)}>GENDER</div>
      <div
        style={{
          position: 'absolute',
          left: 45,
          top: 1365,
          width: 88.3,
          height: 40,
          background: '#312B28',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 600,
          color: '#FFFFFF',
        }}
      >
        Female
      </div>
      <div
        style={{
          position: 'absolute',
          left: 141.3,
          top: 1365,
          width: 90.3,
          height: 40,
          background: '#FFFFFF',
          border: '1px solid #EAEAEA',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 600,
          color: '#555555',
        }}
      >
        Male
      </div>
      <div
        style={{
          position: 'absolute',
          left: 239.7,
          top: 1365,
          width: 90.3,
          height: 40,
          background: '#FFFFFF',
          border: '1px solid #EAEAEA',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 600,
          color: '#555555',
        }}
      >
        All
      </div>
      {/* LANGUAGE */}
      <Field
        label="LANGUAGE"
        top={1425}
        placeholder="e.g. English, Hindi"
        icon={<Globe size={15} strokeWidth={1.25} />}
      />
      {/* AGE RANGE */}
      <div style={sectionLabel('AGE RANGE', 45, 1521, 285)}>AGE RANGE</div>
      {[
        { left: 45, top: 1550, width: 56.7, height: 32, label: '13–17', selected: false },
        { left: 109.7, top: 1550, width: 58, height: 30, label: '18–24', selected: true },
        { left: 177.8, top: 1550, width: 62.5, height: 32, label: '25–34', selected: false },
        { left: 248.2, top: 1550, width: 63, height: 32, label: '35–44', selected: false },
        { left: 45, top: 1590, width: 49.4, height: 32, label: '45+', selected: false },
      ].map((b) => (
        <div
          key={b.label}
          style={{
            position: 'absolute',
            left: b.left,
            top: b.top,
            width: b.width,
            height: b.height,
            background: b.selected ? '#312B28' : '#FFFFFF',
            border: b.selected ? '1px solid #111111' : '1px solid #EAEAEA',
            borderRadius: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 600,
            color: b.selected ? '#FFFFFF' : '#555555',
          }}
        >
          {b.label}
        </div>
      ))}

      {/* ===== PRIORITY ===== */}
      <div style={sectionLabel('PRIORITY', 24, 1667, 327)}>PRIORITY</div>
      {[
        { left: 24, width: 103.7, label: 'Low', bg: '#FFFFFF', border: '#C5DEC5', color: '#3E5C45' },
        { left: 135.7, width: 103.7, label: 'Medium', bg: '#FEF9EE', border: '#F4E4BC', color: '#7E5C2A' },
        { left: 247.3, width: 103.7, label: 'High', bg: '#FFFFFF', border: '#F4BCBC', color: '#7E3A3A' },
      ].map((b) => (
        <div
          key={b.label}
          style={{
            position: 'absolute',
            left: b.left,
            top: 1696,
            width: b.width,
            height: 40,
            background: b.bg,
            border: `1px solid ${b.border}`,
            borderRadius: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 600,
            color: b.color,
          }}
        >
          {b.label}
        </div>
      ))}

      {/* ===== SUBMISSION DEADLINE ===== */}
      <div style={sectionLabel('SUBMISSION DEADLINE', 24, 1760, 327)}>SUBMISSION DEADLINE</div>
      {[
        { left: 24, width: 58.9, height: 60.8, day: 'MON', num: '4', selected: false },
        { left: 90.9, width: 54.8, height: 60.8, day: 'TUE', num: '5', selected: false },
        { left: 153.7, width: 56, height: 58.8, day: 'WED', num: '6', selected: true },
        { left: 217.7, width: 56, height: 60.8, day: 'THU', num: '7', selected: false },
        { left: 281.7, width: 50.4, height: 60.8, day: 'FRI', num: '8', selected: false },
      ].map((d) => (
        <div
          key={d.day}
          style={{
            position: 'absolute',
            left: d.left,
            top: 1789,
            width: d.width,
            height: d.height,
            background: d.selected ? '#312B28' : '#FFFFFF',
            border: d.selected ? '1px solid #111111' : '1px solid #EAEAEA',
            borderRadius: 18,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <span
            style={{
              fontSize: 9,
              lineHeight: '13.5px',
              fontWeight: 700,
              color: d.selected ? '#FFFFFF' : '#AAAAAA',
            }}
          >
            {d.day}
          </span>
          <span
            style={{
              fontSize: 17,
              lineHeight: '17px',
              fontWeight: 600,
              color: d.selected ? '#FFFFFF' : '#555555',
            }}
          >
            {d.num}
          </span>
        </div>
      ))}

      {/* ===== Bottom fixed button ===== */}
      <div
        style={{
          position: 'absolute',
          left: 24,
          top: 781,
          width: 327,
          height: 54.5,
          background: '#312B28',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 15,
          fontWeight: 600,
          color: '#FFFFFF',
        }}
      >
        Add Lead
      </div>
    </div>
  );
}
