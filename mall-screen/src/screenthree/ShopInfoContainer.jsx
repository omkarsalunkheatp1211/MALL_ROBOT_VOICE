import React from "react";
import adSampleData from "../screentwo/AdSampleData";
import '../screentwo/AdManagement.css';
import './ShopInfoContainer.css';

/**
 * ShopInfoContainer Component
 * Shows centered shop name, up to 5 messages, and address based on selected language.
 * Also includes a button to show a QR code for navigation.
 *
 * @param {Object} props
 * @param {string} props.selectedLang - Language code for multilingual support
 * @param {Function} props.setShowQrCode - Function to update QR code visibility state
 * @param {Function} props.setShopId - Function to update shop ID in parent component
 */
const ShopInfoContainer = ({ selectedLang, showQrCode, setShowQrCode, setShopId }) => {
  const shopId = "5"; // This could be dynamic in a real app
  const shop = adSampleData.find(item => item.id === shopId);

  // Pass shop ID to parent component for QR code generation
  React.useEffect(() => {
    if (setShopId) {
      setShopId(shopId);
    }
  }, [shopId, setShopId]);

  if (!shop) {
    return <div className="shop-info-box">Shop not found</div>;
  }

  // Get localized field from item
  const getLocalizedContent = (item, baseKey) => {
    const langFieldMap = {
      "English": baseKey,
      "हिंदी": `${baseKey}Hindi`,
      "मराठी": `${baseKey}Marathi`
    };

    const langField = langFieldMap[selectedLang];
    return item[langField] || item[baseKey];
  };

  // Collect all available localized messages (up to 5)
  const messageKeys = [
    "message",
    "messageSecond",
    "messageThird",
    "messageFourth",
    "messageFifth",
  ];
  const localizedMessages = messageKeys
    .map(key => getLocalizedContent(shop, key))
    .filter(Boolean);

  return (
    <>
      <div className="shop-info-centered">
        {/* Shop Name */}
        <div className="shop-name shop-name-centered">
          {getLocalizedContent(shop, "shopName")}
        </div>

        {/* Messages */}
        <div className="shop-messages">
          {localizedMessages.slice(0, 5).map((msg, idx) => (
            <div key={idx} className="shop-info-text message-line">
              {msg}
            </div>
          ))}
        </div>

        {/* Address */}
        <div className="shop-info-text shop-address">
          {getLocalizedContent(shop, "address")}
        </div>

      </div>

    </>
  );
};

export default ShopInfoContainer;
