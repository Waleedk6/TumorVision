// app/page.js
'use client';
import Link from 'next/link';

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 50%, #dbeafe 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '20px',
    overflow: 'hidden',
    position: 'relative',
  },
  particle: (delay) => ({
    position: 'absolute',
    background: 'rgba(0, 112, 243, 0.08)',
    borderRadius: '50%',
    animation: `float 6s infinite ease-in-out ${delay}s`,
    pointerEvents: 'none',
  }),
  hero: {
    zIndex: 10,
    textAlign: 'center',
    marginBottom: '48px',
    animation: 'fadeInUp 1s ease-out',
    maxWidth: '900px', // Add max width for better centering on large screens
    padding: '0 20px', // Add padding on sides
  },
  title: {
    fontSize: '3.8em',
    fontWeight: '900',
    background: 'linear-gradient(90deg, #0070f3, #00d4ff)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    margin: '0 0 16px 0',
    letterSpacing: '-1px',
    animation: 'pulseGlow 2s infinite alternate',
    textShadow: '0 4px 10px rgba(0, 112, 243, 0.2)',
  },
  subtitle: {
    fontSize: '1.4em',
    color: '#1e293b',
    maxWidth: '600px',
    margin: '0 auto 32px', // Add bottom margin
    lineHeight: '1.6',
    opacity: 0.9,
    animation: 'fadeInUp 1s ease-out 0.3s both',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', // Responsive grid
    gap: '24px',
    maxWidth: '800px',
    margin: '0 auto 40px', // Add margin above and below
    animation: 'fadeInUp 1s ease-out 0.4s both',
  },
  featureCard: {
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(0, 112, 243, 0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  featureCardHover: {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 24px rgba(0, 0, 0, 0.15)',
  },
  featureIcon: {
    fontSize: '2.5em',
    marginBottom: '16px',
    color: '#0070f3',
  },
  featureTitle: {
    fontSize: '1.2em',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 8px 0',
  },
  featureDescription: {
    fontSize: '0.95em',
    color: '#64748b',
    margin: '0',
    lineHeight: '1.5',
  },
  buttonContainer: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    animation: 'fadeInUp 1s ease-out 0.6s both',
  },
  buttonBase: {
    padding: '14px 32px',
    fontSize: '1.1em',
    fontWeight: '700',
    borderRadius: '12px',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    minWidth: '180px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  signupBtn: {
    background: 'linear-gradient(135deg, #0070f3, #00c6ff)',
    color: 'white',
    boxShadow: '0 8px 20px rgba(0, 112, 243, 0.3)',
  },
  signinBtn: {
    background: 'rgba(255, 255, 255, 0.85)',
    color: '#0070f3',
    border: '2px solid #0070f3',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
  },
  complianceInfo: {
    marginTop: '40px',
    fontSize: '0.9em',
    color: '#64748b',
    animation: 'fadeInUp 1s ease-out 0.9s both',
    display: 'flex',
    alignItems: 'center',
    gap: '8px', // Space between icons/text
  },
  icon: {
    fontSize: '1.1em',
    verticalAlign: 'middle',
  }
};

const keyframes = `
  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(5deg); }
  }
  @keyframes pulseGlow {
    from { text-shadow: 0 4px 10px rgba(0, 112, 243, 0.2); }
    to { text-shadow: 0 6px 20px rgba(0, 112, 243, 0.4); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes ripple {
    to { transform: scale(4); opacity: 0; }
  }
`;

const Particles = () => (
  <>
    {[...Array(6)].map((_, i) => {
      const size = 60 + Math.random() * 80;
      const left = `${10 + Math.random() * 80}%`;
      const delay = Math.random() * 5;
      return (
        <div
          key={i}
          style={{
            ...styles.particle(delay),
            width: size,
            height: size,
            left,
            top: `${20 + Math.random() * 60}%`,
          }}
        />
      );
    })}
  </>
);

export default function LandingPage() {
  const handleClick = (e, isSignup) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const ripple = document.createElement('span');
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = isSignup 
      ? 'rgba(255, 255, 255, 0.5)' 
      : 'rgba(0, 112, 243, 0.3)';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s linear';
    ripple.style.pointerEvents = 'none';
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  const features = [
    {
      icon: '🧠',
      title: 'AI-Powered MRI Analysis',
      description: 'Leverage advanced AI models to analyze MRI scans quickly and assist in identifying potential brain tumors with high accuracy.'
    },
    {
      icon: '🔒',
      title: 'Secure Patient Records',
      description: 'Store, manage, and share patient records securely with end-to-end encryption and strict access controls for doctors and patients.'
    },
    {
      icon: '👨‍⚕️',
      title: 'Doctor Verification',
      description: 'A robust admin approval system ensures only qualified medical professionals can access and contribute to patient data.'
    },
    {
      icon: '📧',
      title: 'Seamless Communication',
      description: 'Easily share scan results and reports directly with patients via secure email, improving communication and care continuity.'
    }
  ];

  return (
    <>
      <style jsx>{keyframes}</style>
      <div style={styles.container}>
        <Particles />
        <main style={styles.hero}>
          <h1 style={styles.title}>
            MedScan <span style={{ color: '#0070f3' }}>AI</span> (brain)
          </h1>
          <p style={styles.subtitle}>
            Revolutionize patient care with <strong>secure records</strong>, <strong>verified doctors</strong>, and <strong>AI-powered MRI insights</strong> – fast, accurate, private.
          </p>

          {/* Feature Cards Section */}
          <div style={styles.featureGrid}>
            {features.map((feature, index) => (
              <div
                key={index}
                style={styles.featureCard}
                onMouseEnter={(e) => {
                  Object.assign(e.currentTarget.style, styles.featureCardHover);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div style={styles.featureIcon}>{feature.icon}</div>
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </main>

        <div style={styles.buttonContainer}>
          <Link href="/auth/signup/select-role" style={{ textDecoration: 'none' }}>
            <button
              style={{ ...styles.buttonBase, ...styles.signupBtn }}
              onClick={(e) => handleClick(e, true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 112, 243, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 112, 243, 0.3)';
              }}
            >
              Launch Now
            </button>
          </Link>
          <Link href="/auth/signin" style={{ textDecoration: 'none' }}>
            <button
              style={{ ...styles.buttonBase, ...styles.signinBtn }}
              onClick={(e) => handleClick(e, false)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
                e.currentTarget.style.boxShadow = '0 10px 24px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
              }}
            >
              Sign In
            </button>
          </Link>
        </div>
        <div style={styles.complianceInfo}>
          <span style={styles.icon}>🔒</span> HIPAA-Ready • GDPR Compliant • Encrypted at Rest
        </div>
      </div>
    </>
  );
}