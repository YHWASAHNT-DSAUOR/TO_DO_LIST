import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallAppBanner: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already running in standalone PWA mode
    const isRunningStandalone = window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(isRunningStandalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Capture Chrome/Android beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (isStandalone || isDismissed) return null;
  if (!installPrompt && !isIOS) return null;

  const handleInstallClick = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      <div className="pwa-install-banner">
        <div className="pwa-banner-icon">
          <Smartphone size={20} />
        </div>
        <div className="pwa-banner-content">
          <h4>Install Tempo on your phone</h4>
          <p>Get instant access from your home screen with full offline support.</p>
        </div>
        <div className="pwa-banner-actions">
          <button
            type="button"
            className="pwa-install-btn"
            onClick={handleInstallClick}
          >
            <Download size={14} />
            <span>Install App</span>
          </button>
          <button
            type="button"
            className="pwa-dismiss-btn"
            onClick={() => setIsDismissed(true)}
            title="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* iOS Step-by-Step Installation Modal */}
      {showIOSGuide && (
        <div className="modal-backdrop" onClick={() => setShowIOSGuide(false)}>
          <div className="ios-install-guide-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ios-guide-header">
              <div className="ios-guide-icon-badge">
                <Share size={20} />
              </div>
              <h3>Install on iPhone / iPad</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowIOSGuide(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="ios-guide-steps">
              <div className="ios-step-item">
                <span className="ios-step-number">1</span>
                <p>Tap the <strong>Share</strong> button <Share size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> at the bottom of Safari.</p>
              </div>
              <div className="ios-step-item">
                <span className="ios-step-number">2</span>
                <p>Scroll down and tap <strong>"Add to Home Screen"</strong> (➕).</p>
              </div>
              <div className="ios-step-item">
                <span className="ios-step-number">3</span>
                <p>Tap <strong>"Add"</strong> in the top-right corner.</p>
              </div>
            </div>

            <button
              type="button"
              className="ios-guide-gotit-btn"
              onClick={() => setShowIOSGuide(false)}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
