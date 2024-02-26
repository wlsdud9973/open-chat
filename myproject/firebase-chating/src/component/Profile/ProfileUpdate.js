import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getAuth, signOut, updateProfile } from "firebase/auth";
import {
  getStorage,
  ref as strRef,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import { ref, update } from "firebase/database";
import app, { db } from "../../db/firebase";

import { clearUser, setPhotoUrl } from "../../component/Redux/userSlice";

const ProfileUpdate = () => {
  // Firebase에 프로필 이미지 업로드 및 저장, 로그아웃 버튼 포함 함수
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const inputOpenImageRef = useRef();
  const auth = getAuth(app);
  const [isVisible, setIsVisible] = useState(false);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        dispatch(clearUser());
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleOpenImageRef = () => {
    inputOpenImageRef.current.click();
  };

  const handleUploadImage = async (event) => {
    const file = event.target.files[0];
    const user = auth.currentUser;

    const metadata = { contentType: file.type };
    const storage = getStorage();
    // https://firebase.google.com/docs/storage/web/upload-files#full_example
    try {
      //스토리지에 파일 저장하기
      let uploadTask = uploadBytesResumable(
        strRef(storage, `user_image/${user.uid}`),
        file,
        metadata
      );

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
            default:
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
            case "storage/unknown":
              // Unknown error occurred, inspect error.serverResponse
              break;
            default:
              break;
          }
        },
        () => {
          // Upload completed successfully, now we can get the download URL
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            // 프로필 이미지 수정
            updateProfile(user, {
              photoURL: downloadURL,
            });
            dispatch(setPhotoUrl(downloadURL));
            //데이터베이스 유저 이미지 수정
            update(ref(db, `users/${user.uid}`), { image: downloadURL });
          });
        }
      );
      // console.log('uploadTaskSnapshot', uploadTaskSnapshot)
    } catch (error) {
      console.log(error);
    }
  };

  if (!currentUser) return <div>...loading</div>;

  const handleButtonClick = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="profileUpdate">
      <img
        src={currentUser.photoURL}
        className="profile-button"
        onClick={handleButtonClick}
      />
      {isVisible && (
        <div className="profile-menu">
          <div onClick={handleOpenImageRef}>프로필 이미지 변경</div>
          <div onClick={handleLogout}>로그아웃</div>
        </div>
      )}
      <input
        onChange={handleUploadImage}
        accept="image/jpeg, image/png"
        style={{ display: "none" }}
        ref={inputOpenImageRef}
        type="file"
      />
    </div>
  );
};

export default ProfileUpdate;
