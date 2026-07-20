'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { createPortal } from 'react-dom';

interface PrintableLabelProps {
  assetId: string;
  assetTag: string;
  assetName: string;
  category: string;
  tenantName: string;
}

export function PrintableLabel({ assetId, assetTag, assetName, category, tenantName }: PrintableLabelProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Bu component sadece yazdırma anında ekranda görünecek şekilde CSS classları alır.
  // globals.css içerisindeki @media print ile yönetilir.
  
  const content = (
    <div className="print-only print-only-container hidden print:flex print:flex-col print:items-center print:justify-center w-[50mm] h-[25mm] bg-white border-2 border-black p-1 text-black font-sans box-border overflow-hidden absolute top-0 left-0 z-[9999]">
      
      {/* Şirket / Kurum Adı */}
      <div className="w-full text-center border-b border-black mb-1 pb-0.5">
        <span className="text-[7px] font-bold uppercase truncate block w-full text-black">{tenantName}</span>
      </div>

      <div className="flex w-full items-center justify-between px-1 h-[18mm]">
        {/* QR Kodu */}
        <div className="flex-shrink-0 bg-white p-0.5">
          <QRCode 
            value={assetId} 
            size={45} 
            level="M" 
            bgColor="#FFFFFF"
            fgColor="#000000"
          />
        </div>

        {/* Detay Bilgiler */}
        <div className="flex flex-col items-end justify-center flex-1 ml-1 overflow-hidden h-full">
          <span className="text-[6px] text-gray-800 uppercase leading-tight truncate w-full text-right">{category}</span>
          <span className="text-[9px] font-bold leading-tight truncate w-full text-right text-black">{assetName}</span>
          <span className="text-[8px] font-mono mt-0.5 px-1 py-0.5 truncate w-full text-right text-black font-bold border border-black">
            {assetTag}
          </span>
        </div>
      </div>
      
    </div>
  );

  if (!mounted) return null;

  return createPortal(content, document.body);
}
