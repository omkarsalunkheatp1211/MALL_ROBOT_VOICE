import React from "react";
import "./AdSection.css";
import AdManagement from "./AdManagement";
import Microphonebutton from "./Microphonebutton";
import { useNavigate } from "react-router-dom";
import Robot from "../Robot/Robot";

/**
 * Main section component that displays robot and advertisement content
 * @param {Object} props
 * @param {string} props.selectedLang
 * @param {boolean} props.pauseAds
 */
const AdSection = ({ selectedLang, pauseAds }) => {
  const navigate = useNavigate();

  return (
    <div
      className="screen-container flex-grow flex flex-col items-center text-center px-0 text-white overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #0f162a, #131E39)",
        maxWidth: "3600px",
        height: "8400px",
        margin: "0 auto",
        position: "relative",
        zIndex: 0,
      }}
    >
      {/* Top section for Robot with 70% height allocation */}
      <div
        className="w-full flex flex-col items-center justify-center robot-section"
        style={{
          flex: "0 0 70%",
          height: "5880px", // 70% of 8400px
          overflow: "hidden",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          maxWidth: "3600px",
          margin: "0 auto",
        }}
      >
        <Robot />
        <div
          style={{ position: "absolute", bottom: "2rem", right: "2rem", zIndex: 10 }}
        >
          <Microphonebutton selectedLang={selectedLang} />
        </div>

        {/* btn */}
        {/* <div
          style={{ position: "absolute", bottom: "30rem", right: "2rem", zIndex: 10 }}
          className="shop-info-btn"
        >
          <button style={{ fontSize: "90px" }} onClick={() => navigate("/shop-info")}>
            click
          </button>
        </div> */}
      </div>

      {/* Bottom section for Ads with 30% height allocation */}
      <div
        className="w-full ad-management-section"
        style={{
          flex: "0 0 30%",
          height: "2520px", // 30% of 8400px
          overflow: "hidden",
          maxWidth: "3600px",
          margin: "0 auto",
        }}
      >
        <AdManagement selectedLang={selectedLang} pauseAds={pauseAds} />
      </div>
    </div>
  );
};

export default AdSection;
