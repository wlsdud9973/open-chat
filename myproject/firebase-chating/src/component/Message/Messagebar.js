import React, { useState, useRef } from "react";
import { db } from "../../db/firebase";
import { useSelector } from "react-redux";

import {
  ref,
  set,
  remove,
  push,
  child,
  serverTimestamp,
} from "firebase/database";
import {
  getStorage,
  ref as strRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

function Messagebar() {
  // 메시지 생성 및 메시지 입력 폼바 함수
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesRef = ref(db, "messages");
  const inputOpenImageRef = useRef();

  // const storageRef = ref(getStorage());
  const typingRef = ref(db, "typing");

  const { currentChatRoom } = useSelector((state) => state.chatRoom);
  const { currentUser } = useSelector((state) => state.user);
  const { isPrivateChatRoom } = useSelector((state) => state.chatRoom);

  const handleChange = (event) => {
    setContent(event.target.value);

    if (event.target.value) {
      set(ref(db, `typing/${currentChatRoom.id}/${currentUser.uid}`), {
        userUid: currentUser.displayName,
      });
    } else {
      remove(ref(db, `typing/${currentChatRoom.id}/${currentUser.uid}`));
    }
  };

  const createMessage = (fileUrl = null) => {
    const message = {
      timestamp: serverTimestamp(),
      user: {
        id: currentUser.uid,
        name: currentUser.displayName,
        image: currentUser.photoURL,
      },
    };

    if (fileUrl !== null) {
      message["image"] = fileUrl;
    } else {
      message["content"] = content;
    }

    return message;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    //firebase에 메시지를 저장하는 부분
    try {
      // await messagesRef.child(chatRoom.id).push().set(createMessage())
      await set(push(child(messagesRef, currentChatRoom.id)), createMessage());

      // typingRef.child(chatRoom.id).child(user.uid).remove();
      await remove(
        child(typingRef, `${currentChatRoom.id}/${currentUser.uid}`)
      );
      setLoading(false);
      setContent("");
    } catch (error) {
      setLoading(false);
      setTimeout(() => {}, 5000);
    }
  };

  const handleOpenImageRef = () => {
    inputOpenImageRef.current.click();
  };

  const getPath = () => {
    if (isPrivateChatRoom) {
      return `/message/private/${currentChatRoom.id}`;
    } else {
      return `/message/public`;
    }
  };

  const handleUploadImage = (event) => {
    const file = event.target.files[0];
    const storage = getStorage();

    const filePath = `${getPath()}/${file.name}`;
    console.log("filePath", filePath);
    const metadata = { contentType: file.type };
    setLoading(true);
    try {
      // https://firebase.google.com/docs/storage/web/upload-files#full_example
      // Upload file and metadata to the object 'images/mountains.jpg'
      const storageRef = strRef(storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      // Listen for state changes, errors, and completion of the upload.
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
          }
        },
        (error) => {
          // A full list of error codes is available at
          // https://firebase.google.com/docs/storage/web/handle-errors
          switch (error.code) {
            case "storage/unauthorized":
              // User doesn't have permission to access the object
              break;
            case "storage/canceled":
              // User canceled the upload
              break;
            // ...
            case "storage/unknown":
              // Unknown error occurred, inspect error.serverResponse
              break;
          }
        },
        () => {
          // Upload completed successfully, now we can get the download URL
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            // console.log('File available at', downloadURL);
            set(
              push(child(messagesRef, currentChatRoom.id)),
              createMessage(downloadURL)
            );
            setLoading(false);
          });
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="message-bar">
          <div>
            <img
              src={require("../../image/Plus.png")}
              onClick={handleOpenImageRef}
              className="message-button"
              disabled={loading ? true : false}
            />
          </div>

          <textarea
            className="message-input"
            value={content}
            onChange={handleChange}
            placeholder="메시지를 입력하세요..."
          />
          <div>
            <img
              src={require("../../image/test_profile.jpeg")}
              onClick={handleSubmit}
              className="message-button"
              disabled={loading ? true : false}
            />
          </div>
        </div>
      </form>
      <input
        accept="image/jpeg, image/png"
        style={{ display: "none" }}
        type="file"
        ref={inputOpenImageRef}
        onChange={handleUploadImage}
      />
    </div>
  );
}

export default Messagebar;
