import React from "react";
import Messagebar from "../component/Message/Messagebar";
import ChatingWindow from "../component/ChatMenu/ChatingWindow";
import ChatHeader from "../component/Header/ChatHeader";

const Chating = () => {
  //채팅 페이지 폼
  return (
    <div className="form">
      <ChatHeader />
      <ChatingWindow />
      <Messagebar />
    </div>
  );
};

export default Chating;
