import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import adSampleData from "../screentwo/AdSampleData";

const QrViewer = ({ selectedLang }) => {
  const [searchParams] = useSearchParams();
  const [shop, setShop] = useState(null);
  const [qrLang, setQrLang] = useState(selectedLang);

  useEffect(() => {
    const shopId = searchParams.get('id');
    const lang = searchParams.get('lang');
    
    if (shopId) {
      const shopData = adSampleData.find(item => item.id === shopId);
      setShop(shopData);
    }
    
    if (lang) {
      // Convert URL language codes back to full language names
      const langCodeMap = {
        "English": "English",
        "हिंदी": "हिंदी",
        "मराठी": "मराठी"
      };
      
      const fullLang = langCodeMap[lang] || "English";
      setQrLang(fullLang);
    }
  }, [searchParams]);

  const getLocalizedContent = (item, baseKey) => {
    const langFieldMap = {
      "English": baseKey,
      "हिंदी": `${baseKey}Hindi`,
      "मराठी": `${baseKey}Marathi`
    };

    const langField = langFieldMap[qrLang];
    return item?.[langField] || item?.[baseKey];
  };

  if (!shop) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-60px)]">
        <p className="text-xl">Shop not found</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        {getLocalizedContent(shop, "shopName")}
      </h1>
      <div className="space-y-4">
        <p className="text-xl">{getLocalizedContent(shop, "message")}</p>
        <p className="text-lg">{getLocalizedContent(shop, "address")}</p>
        {shop.phone && (
          <p className="text-lg">
            <span className="font-semibold">Phone:</span> {shop.phone}
          </p>
        )}
      </div>
    </div>
  );
};

export default QrViewer;