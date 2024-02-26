import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ref,
  onChildAdded,
  onChildRemoved,
  child,
  off,
} from "firebase/database";
import { db } from "../../db/firebase";
import { setUserPosts } from "../../component/Redux/chatRoomSlice";
import Message from "../Message/Message";
import Skeleton from "../Skeleton/Skeleton";

const ChatingWindow = () => {
  // 채팅 창
  const messageEndRef = useRef(null);
  const messagesRef = ref(db, "messages");
  const typingRef = ref(db, "typing");

  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const [listenerLists, setListenerLists] = useState([]);

  const { currentUser } = useSelector((state) => state.user);
  const { currentChatRoom } = useSelector((state) => state.chatRoom);
  const dispatch = useDispatch();

  useEffect(() => {
    if (currentChatRoom.id) {
      addMessagesListeners(currentChatRoom.id);
      addTypingListeners(currentChatRoom.id);
    }

    return () => {
      off(messagesRef);
      removeListeners(listenerLists);
    };
  }, [currentChatRoom.id]);

  useEffect(() => {
    messageEndRef.current.scrollIntoView({ behavior: "smooth" });
  });

  const removeListeners = (listeners) => {
    listeners.forEach((listener) => {
      off(ref(db, `messages/${listener.id}`), listener.event);
    });
  };

  const addTypingListeners = (chatRoomId) => {
    let typingUsers = [];

    //typing이 새로 들어올 때
    onChildAdded(child(typingRef, chatRoomId), (DataSnapshot) => {
      if (DataSnapshot.key !== currentUser.uid) {
        typingUsers = typingUsers.concat({
          id: DataSnapshot.key,
          name: DataSnapshot.val(),
        });
        setTypingUsers(typingUsers);
      }
    });

    //listenersList state에 등록된 리스너를 넣어주기
    addToListenerLists(chatRoomId, typingRef, "child_added");

    //typing을 지워줄 때
    onChildRemoved(child(typingRef, chatRoomId), (DataSnapshot) => {
      const index = typingUsers.findIndex(
        (user) => user.id === DataSnapshot.key
      );
      if (index !== -1) {
        typingUsers = typingUsers.filter(
          (user) => user.id !== DataSnapshot.key
        );
        setTypingUsers(typingUsers);
      }
    });

    //listenersList state에 등록된 리스너를 넣어주기
    addToListenerLists(chatRoomId, typingRef, "child_removed");
  };

  const addToListenerLists = (id, ref, event) => {
    //이미 등록된 리스너인지 확인
    const index = listenerLists.findIndex((listener) => {
      return (
        listener.id === id && listener.ref === ref && listener.event === event
      );
    });

    if (index === -1) {
      const newListener = { id, ref, event };
      setListenerLists(listenerLists.concat(newListener));
    }
  };

  const addMessagesListeners = (chatRoomId) => {
    let messagesArray = [];
    setMessages([]);
    // 대화가 없는 방에 들어갔을 때 아래 로직이 동작 안 해서 사용한 trick

    onChildAdded(child(messagesRef, chatRoomId), (DataSnapshot) => {
      messagesArray.push(DataSnapshot.val());
      const newMessageArray = [...messagesArray];
      // 이 부분 없으면 messages state 가 동일하게 [] 이여서 리렌더링 X

      setMessages(newMessageArray);
      setMessagesLoading(false);
      userPostsCount(newMessageArray);
    });
  };

  const userPostsCount = (messages) => {
    const userPosts = messages.reduce((acc, message) => {
      if (message.user.name in acc) {
        acc[message.user.name].count += 1;
      } else {
        acc[message.user.name] = {
          image: message.user.image,
          count: 1,
        };
      }
      return acc;
    }, {});
    // console.log('userPosts :', userPosts);
    dispatch(setUserPosts(userPosts));
  };

  const renderMessages = (messages) =>
    messages.length > 0 &&
    messages.map((message) => (
      <Message key={message.timestamp} message={message} user={currentUser} />
    ));

  const renderTypingUsers = (typingUsers) =>
    typingUsers.length > 0 &&
    typingUsers.map((user) => (
      <span key={user.name.userUid}>
        {user.name.userUid}님이 채팅을 입력하고 있습니다...
      </span>
    ));

  const renderMessageSkeleton = (loading) =>
    loading && (
      <>
        {[...Array(11)].map((v, i) => (
          <Skeleton key={i} />
        ))}
      </>
    );

  return (
    <div>
      <div className="chat-window">
        {renderMessageSkeleton(messagesLoading)}

        {renderMessages(messages)}

        {renderTypingUsers(typingUsers)}
        <div ref={messageEndRef} />
      </div>
    </div>
  );
};

export default ChatingWindow;
