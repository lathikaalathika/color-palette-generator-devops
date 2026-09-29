import { useState, useCallback, useEffect } from 'react';
import { RefreshCw, Check, Palette, Github, Heart } from 'lucide-react';

interface Color {
  hex: string;
  rgb: string;
  locked: boolean;
}

function randomHex(): string {
  const chars = '0123456789ABCDEF';
  let hex = '#';
  for (let i = 0; i < 6; i++) {
    hex += chars[Math.floor(Math.random() * 16)];
  }
  return hex;
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#1a1a2e' : '#ffffff';
}

function generatePalette(count: number): Color[] {
  return Array.from({ length: count }, () => {
    const hex = randomHex();
    return { hex, rgb: hexToRgb(hex), locked: false };
  });
}

function App() {
  const [colors, setColors] = useState<Color[]>(() => generatePalette(5));
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<'hex' | 'rgb' | null>(null);

  const regenerate = useCallback(() => {
    setColors((prev) =>
      prev.map((c) => (c.locked ? c : (() => {
        const hex = randomHex();
        return { hex, rgb: hexToRgb(hex), locked: false };
      })()))
    );
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        regenerate();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [regenerate]);

  const toggleLock = (index: number) => {
    setColors((prev) =>
      prev.map((c, i) => (i === index ? { ...c, locked: !c.locked } : c))
    );
  };

  const copyValue = (index: number, format: 'hex' | 'rgb') => {
    const value = format === 'hex' ? colors[index].hex : colors[index].rgb;
    navigator.clipboard.writeText(value);
    setCopiedIndex(index);
    setCopiedFormat(format);
    setTimeout(() => {
      setCopiedIndex(null);
      setCopiedFormat(null);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f1a] text-white">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Color Palette Generator</h1>
              <p className="text-xs text-white/40">Press SPACE to regenerate · Click lock to keep</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={regenerate}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 transition-all duration-200 text-sm font-medium active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              Generate
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 flex items-center justify-center"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Palette Display */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {colors.map((color, index) => {
          const textColor = getContrastColor(color.hex);
          const isMuted = textColor === '#1a1a2e' ? 'text-black/50' : 'text-white/50';

          return (
            <div
              key={index}
              className="flex-1 relative group transition-all duration-500 ease-out flex flex-col items-center justify-end pb-10 min-h-[140px] lg:min-h-0"
              style={{ backgroundColor: color.hex }}
            >
              {/* Lock button */}
              <button
                onClick={() => toggleLock(index)}
                className="absolute top-6 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full backdrop-blur-md transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100"
                style={{
                  backgroundColor: textColor === '#1a1a2e' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)',
                  color: textColor,
                }}
                aria-label={color.locked ? 'Unlock color' : 'Lock color'}
              >
                {color.locked ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5zm-3 8V6a3 3 0 0 1 6 0v3H9z"/></svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5zm0 2a3 3 0 0 1 3 3v3H9V6a3 3 0 0 1 3-3z"/></svg>
                )}
              </button>

              {/* Color info */}
              <div className="flex flex-col items-center gap-2" style={{ color: textColor }}>
                <button
                  onClick={() => copyValue(index, 'hex')}
                  className="text-xl md:text-2xl font-bold tracking-wide hover:scale-105 transition-transform duration-200 cursor-pointer"
                >
                  {color.hex}
                </button>
                <button
                  onClick={() => copyValue(index, 'rgb')}
                  className={`text-xs ${isMuted} hover:opacity-80 transition-opacity cursor-pointer`}
                >
                  {color.rgb}
                </button>
                {/* Copy feedback */}
                {copiedIndex === index && (
                  <div
                    className="flex items-center gap-1 text-xs font-medium mt-1 animate-pulse"
                    style={{ color: textColor }}
                  >
                    <Check className="w-3 h-3" />
                    {copiedFormat === 'hex' ? 'HEX copied!' : 'RGB copied!'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between text-xs text-white/30">
          <span>DevOps Pipeline: GitHub → Jenkins → Docker → Terraform → Ansible → K8s</span>
          <span className="flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-pink-500" /> DevOps
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
