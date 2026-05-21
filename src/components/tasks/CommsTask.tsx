import React, { useState, useEffect } from 'react';
import { Radio } from 'lucide-react';
import DegreeCerts from '../portfolio/DegreeCerts';

interface CommsTaskProps {
  onComplete: () => void;
  isCompleted: boolean;
}

export default function CommsTask({ onComplete, isCompleted }: CommsTaskProps) {
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'completed'>('idle');

  const startDownloading = () => {
    setDownloadState('downloading');
    setDownloadProgress(0);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (downloadState === 'downloading') {
      timer = setInterval(() => {
        setDownloadSpeed(Math.floor(Math.random() * 80) + 120); // 120-200 kB/s
        setDownloadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setDownloadState('completed');
            onComplete();
            return 100;
          }
          return prev + 5;
        });
      }, 150);
    }
    return () => clearInterval(timer);
  }, [downloadState, onComplete]);

  // Handle skip game via props
  useEffect(() => {
    if (isCompleted && downloadState !== 'completed') {
      setDownloadState('completed');
      setDownloadProgress(100);
    }
  }, [isCompleted, downloadState]);

  return (
    <div className="flex-1 flex flex-col">
      {downloadState !== 'completed' ? (
        <div className="flex-1 flex flex-col items-center justify-center p-2 text-center space-y-6">
          <div className="w-20 h-20 bg-slate-900 border-2 border-[#1a9eff] rounded-lg flex items-center justify-center relative">
            <Radio size={36} className={`text-[#1a9eff] ${downloadState === 'downloading' ? 'animate-bounce' : ''}`} />
            {downloadState === 'downloading' && (
              <span className="absolute -inset-2 border-2 border-[#1a9eff] rounded-lg animate-ping opacity-70" />
            )}
          </div>

          <div className="max-w-md space-y-2">
            <h3 className="text-[10px] sm:text-xs md:text-sm font-bold text-white uppercase tracking-wider" style={{ fontFamily: '"Press Start 2P"' }}>
              {downloadState === 'downloading' ? 'DOWNLOADING FILES' : 'INCOMING COMMS FREQUENCY'}
            </h3>
            <p className="text-xs text-gray-400">
              We have intercepted two massive files containing Ashfakh's complete production marketplaces, checkout pipelines, and testing metrics.
            </p>
          </div>

          <div className="w-full max-w-xs space-y-2">
            {downloadState === 'downloading' && (
              <div className="flex justify-between text-[10px] text-[#38FEDE]">
                <span>DOWNLOADING AT: {downloadSpeed} kB/s</span>
                <span>{downloadProgress}%</span>
              </div>
            )}

            <div className="w-full h-8 bg-black border-2 border-slate-700 rounded overflow-hidden p-1 flex items-center">
              <div 
                className="h-full bg-[#1a9eff] rounded-sm transition-all duration-150" 
                style={{ width: `${downloadProgress}%` }} 
              />
            </div>

            {downloadState === 'idle' ? (
              <button 
                onClick={startDownloading}
                className="w-full p-2.5 bg-[#1a9eff] text-black hover:bg-[#38FEDE] font-bold text-[10px] sm:text-xs uppercase tracking-wide rounded border-2 border-black active:translate-y-0.5 transition-all text-center cursor-pointer"
                style={{ fontFamily: '"Press Start 2P"' }}
              >
                DOWNLOAD DATA
              </button>
            ) : (
              <span className="text-[10px] text-gray-500 block">DO NOT CLOSE TERMINAL...</span>
            )}
          </div>
        </div>
      ) : (
        <DegreeCerts />
      )}
    </div>
  );
}
