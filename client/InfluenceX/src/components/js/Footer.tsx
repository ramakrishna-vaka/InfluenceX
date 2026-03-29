import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Zap, Github, Instagram, Youtube } from 'lucide-react';
import '../css/Footer.css';

const NAV = [
  { label: 'Home',              path: '/' },
  { label: 'My Collaborations', path: '/my-collaborations' },
  { label: 'My Promotions',     path: '/my-promotions' },
  { label: 'Messages',          path: '/messages' },
  { label: 'About',             path: '/about' },
  { label: 'Help',              path: '/help' },
];

const LEGAL = [
  { label: 'Privacy Policy',    href: '#' },
  { label: 'Terms of Service',  href: '#' },
  { label: 'Cookie Policy',     href: '#' },
];

/** Pages where the footer should not render */
const HIDDEN_ON = ['/login', '/register'];

const Footer: React.FC = () => {
  const navigate  = useNavigate();
  const { pathname } = useLocation();

  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <footer className="ftr-root">
      <div className="ftr-inner">

        {/* ── Brand column ──────────────────────────────── */}
        <div className="ftr-brand">
          <button className="ftr-logo" onClick={() => navigate('/')}>
            <Zap size={16} />
            InfluenceX
          </button>
          <p className="ftr-tagline">
            The structured marketplace connecting genuine brands with verified creators.
            From application to payment — all in one place.
          </p>
         <div className="ftr-socials">
            <a
                href="https://www.youtube.com/@vaka-ramakrishna"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                          className="ftr-social"
                          title="Visit my YouTube channel"
            >
                <Youtube size={15} /> {/* replace with YouTube icon if you want */}
            </a>

            <a
                href="https://instagram.com/vaka_ramakrishna_ramakrishna?igsh=aHJ3b3ZrOWtqbnl6"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                          className="ftr-social"
                          title="Visit my Instagram profile"
            >
                <Instagram size={15} />
            </a>

            <a
                href="https://github.com/ramakrishna-vaka"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                          className="ftr-social"
                          title ="Visit my GitHub profile"
            >
                <Github size={15} />
            </a>
            </div>
        </div>

        {/* ── Navigation column ─────────────────────────── */}
        <div className="ftr-col">
          <span className="ftr-col-label">Platform</span>
          <ul className="ftr-links">
            {NAV.map(n => (
              <li key={n.path}>
                <button onClick={() => navigate(n.path)} className="ftr-link">
                  {n.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Resources column ──────────────────────────── */}
        <div className="ftr-col">
          <span className="ftr-col-label">Resources</span>
          <ul className="ftr-links">
            <li>
              <a
                href="/InfluenceX_UserGuide_V1.pdf"
                download="InfluenceX_UserGuide_V1.pdf"
                className="ftr-link"
              >
                User Guide (PDF)
              </a>
            </li>
            <li><button onClick={() => navigate('/about')} className="ftr-link">About</button></li>
            <li><button onClick={() => navigate('/help')}  className="ftr-link">Support</button></li>
            {LEGAL.map(l => (
              <li key={l.label}>
                <a href={l.href} className="ftr-link">{l.label}</a>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* ── Bottom bar ────────────────────────────────────── */}
      <div className="ftr-bottom">
        <span>© {new Date().getFullYear()} InfluenceX. All rights reserved.</span>
        <span className="ftr-bottom-right">Built with ⚡ for small brands & real creators.</span>
      </div>
    </footer>
  );
};

export default Footer;