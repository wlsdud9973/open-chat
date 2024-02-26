import React from "react";
import { useNavigate } from "react-router-dom";
import ProfileUpdate from "../Profile/ProfileUpdate";

const ChatHeader = () => {
  // 채팅앱 용 HEADER
  const navigate = useNavigate();

  const moveChathome = () => {
    navigate("/");
  };

  return (
    <div className="chating-header">
      <img
        onClick={moveChathome}
        src={require("../../image/test_profile.jpeg")}
        className="logo_main"
      />
      <ProfileUpdate />
    </div>
  );
};

export default ChatHeader;
