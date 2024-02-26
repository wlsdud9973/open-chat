import "../style/Chating.css";
import React from "react";
import ChatRoom from "../component/ChatMenu/ChatRoom";
import ChatHeader from "../component/Header/ChatHeader";

const ChatHome = () => {
  return (
    // 채팅 페이지 홈
    <div className="form">
      <ChatHeader />
      <ChatRoom />
    </div>
  );
};

export default ChatHome;
