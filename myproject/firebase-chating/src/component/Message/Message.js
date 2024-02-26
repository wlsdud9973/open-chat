import moment from "moment";
import React from "react";

function Message({ message, user }) {
  // 메시지 출력 컴포넌트
  const timeFromNow = (timestamp) => moment(timestamp).fromNow();

  const isImage = (message) => {
    if (message.image) {
      return true;
    }
    return false;
  };

  const isMessageMine = (message, user) => {
    if (user) {
      return message.user.id === user.uid;
    }
  };

  return (
    <div
      className="message-line"
      style={{
        display: "flex",
        justifyContent: isMessageMine(message, user) && "flex-end",
      }}
    >
      <div
        className="chating-data"
        style={{
          flexDirection: isMessageMine(message, user) && "row-reverse",
        }}
      >
        <img
          className="chating-avatar"
          src={message.user.image}
          alt={message.user.name}
          style={{
            display: isMessageMine(message, user) && "none",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: isMessageMine(message, user) && "flex-end",
          }}
        >
          <div
            className="chating-name"
            style={{
              color: isMessageMine(message, user) && "#ff3388",
            }}
          >
            {message.user.name}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              flexDirection: isMessageMine(message, user) && "row-reverse",
            }}
          >
            <div className="messages">
              {isImage(message) ? (
                <img
                  className="chat-image"
                  style={{ borderRadius: 10 }}
                  alt="이미지"
                  src={message.image}
                />
              ) : (
                <div className="chat-text">{message.content}</div>
              )}
            </div>
            <div className="timeStemp">{timeFromNow(message.timestamp)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Message;
