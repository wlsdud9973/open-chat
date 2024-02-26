import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ref, onChildAdded, push, child, update, off } from "firebase/database";
import { db } from "../../db/firebase";
import { setCurrentChatRoom } from "../../component/Redux/chatRoomSlice";
import { useNavigate } from "react-router-dom";

const ChatRoom = () => {
  // 채팅 룸 생성 및 채팅 룸 리스트 페이지
  const navigate = useNavigate();

  function ChatRoomEnter() {
    //채팅 방에 입장
    navigate(`/chating`, {
      state: { id: activeChatRoomId },
    });
  }

  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const chatRoomsRef = ref(db, "chatRooms");

  const [chatRooms, setChatRooms] = useState([]);
  const [firstLoad, setFirstLoad] = useState(true);
  const [activeChatRoomId, setActiveChatRoomId] = useState("");
  const [activeChatRoomName, setActiveChatRoomName] = useState("");

  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    AddChatRoomsListeners();
    return () => {
      off(chatRoomsRef);
    };
  }, []);

  const setFirstChatRoom = (chatRooms) => {
    const firstChatRoom = chatRooms[0];
    if (firstLoad && chatRooms.length > 0) {
      dispatch(setCurrentChatRoom(firstChatRoom));
      setActiveChatRoomId(firstChatRoom.id);
    }
    setFirstLoad(false);
  };

  const AddChatRoomsListeners = () => {
    let chatRoomsArray = [];

    onChildAdded(chatRoomsRef, (DataSnapshot) => {
      chatRoomsArray.push(DataSnapshot.val());
      const newChatRooms = [...chatRoomsArray];
      setChatRooms(newChatRooms);

      setFirstChatRoom(newChatRooms);
    });
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isFormValid(name, description)) {
      addChatRoom();
    }
  };

  const addChatRoom = async () => {
    const key = push(chatRoomsRef).key;
    const newChatRoom = {
      id: key,
      name: name,
      description: description,
      createdBy: {
        name: currentUser.displayName,
        image: currentUser.photoURL,
      },
    };

    try {
      await update(child(chatRoomsRef, key), newChatRoom);
      setName("");
      setDescription("");
      setShow(false);
    } catch (error) {
      alert(error);
    }
  };

  const isFormValid = (name, description) => name && description;

  const changeChatRoom = (room) => {
    dispatch(setCurrentChatRoom(room));
    setActiveChatRoomId(room.id);
    setActiveChatRoomName(room.name);
  };

  const renderChatRooms = (chatRooms) =>
    chatRooms.length > 0 &&
    chatRooms.map((room) => (
      <li key={room.id} onClick={() => changeChatRoom(room)}>
        <div onClick={ChatRoomEnter} className="chatRoom-list">
          <img className="chating-avatar" src={room.createdBy.image} />{" "}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div>{room.name}</div>
            <div>{room.description}</div>
          </div>
        </div>
      </li>
    ));

  return (
    <div className="chatRoom-container">
      <div className="list">
        <div className="createChatRoom-button" onClick={handleShow}>
          <img
            style={{
              width: "20px",
              height: "20px",
              border: "1px solid gray",
              borderRadius: "50%",
              padding: "5px",
            }}
            src={require("../../image/Plus.png")}
          />
        </div>
        <ul className="chatRoom-link">{renderChatRooms(chatRooms)}</ul>
      </div>
      <div>
        {show && (
          <div className="chatRoom-create-form">
            <form onSubmit={handleSubmit}>
              <div>Create Room</div>
              <div className="create-input-box">
                <label className="font-1">방 이름</label>
                <input
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="채팅 방 이름을 입력하세요."
                />
              </div>

              <div className="create-input-box">
                <label className="font-1">방 설명</label>
                <input
                  onChange={(e) => setDescription(e.target.value)}
                  type="text"
                  placeholder="채팅 방 설명을 작성하세요."
                />
              </div>
              <div className="create-input-box">
                <button onClick={handleClose}>Close</button>
                <button onClick={handleSubmit}>추가하세요</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRoom;
