import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ref, set } from "firebase/database";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
} from "firebase/auth";
import app, { db } from "../db/firebase";
import { useDispatch } from "react-redux";
import { setUser } from "../component/Redux/userSlice";

function RegisterPage() {
  //회원가입 페이지
  const {
    register,
    watch,
    formState: { errors },
    handleSubmit,
  } = useForm();
  const [errorFromSubmit, setErrorFromSubmit] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = getAuth(app);

  const dispatch = useDispatch();

  const password = useRef();
  password.current = watch("password");

  const emailSingup = async (data) => {
    try {
      setLoading(true);

      const createdUser = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      console.log(createdUser);

      await updateProfile(auth.currentUser, {
        displayName: data.name,
        photoURL: null /* 값 입력 필요 */,
      });

      const userData = {
        uid: createdUser.user.uid,
        displayName: createdUser.user.displayName,
        photoURL: createdUser.user.photoURL,
      };
      dispatch(setUser(userData));

      //Firebase 데이터베이스에 저장해주기
      set(ref(db, `users/${createdUser.user.uid}`), {
        name: createdUser.user.displayName,
        image: createdUser.user.photoURL,
      });

      setLoading(false);
    } catch (error) {
      setErrorFromSubmit(error.message);
      setLoading(false);
      setTimeout(() => {
        setErrorFromSubmit("");
      }, 5000);
    }
  };

  // GOOGLE SIGNUP
  const googleSingup = (e) => {
    signInWithPopup(auth, new GoogleAuthProvider())
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        console.log(token);
        // The signed-in user info.
        const user = result.user;
        // IdP data available using getAdditionalUserInfo(result)
        // ...

        // 계정 생성에 성공했다면, 홈으로 돌아갑니다.
        if (user) {
          window.location.replace("/");
        }
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...

        // alert(errorCode, errorMessage, email, credential);
      });
  };

  // FACEBOOK SIGNUP
  const facebookSingup = (e) => {
    signInWithPopup(auth, new FacebookAuthProvider())
      .then((result) => {
        // The signed-in user info.
        const user = result.user;

        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        const credential = FacebookAuthProvider.credentialFromResult(result);
        const accessToken = credential.accessToken;
        console.log(accessToken);

        // IdP data available using getAdditionalUserInfo(result)
        // ...

        // 계정 생성에 성공했다면, 홈으로 돌아갑니다.
        if (user) {
          window.location.replace("/");
        }
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = FacebookAuthProvider.credentialFromError(error);

        console.log(email, credential);

        // ...
        // alert(errorCode, errorMessage);
      });
  };

  return (
    <div style={{ justifyContent: "center", width: "50%" }}>
      <div style={{ textAlign: "center" }}>
        <div id="label" className="label">
          Create an account
        </div>
      </div>

      <div style={{ flexDirection: "row" }}>
        <button
          style={{ width: "30px", height: "30px" }}
          onClick={googleSingup}
          icon={"https://img.icons8.com/color/48/000000/google-logo.png"}
        />
        <button
          style={{ width: "30px", height: "30px" }}
          onClick={facebookSingup}
          icon={"https://img.icons8.com/color/48/000000/facebook-new.png"}
        />
      </div>
      <form
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
        onSubmit={handleSubmit(emailSingup)}
      >
        <div>
          <label>Email</label>
          <input
            name="email"
            type="email"
            {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
          />
          {errors.email && <p>This email field is required</p>}
        </div>
        <div>
          <label>Name</label>
          <input
            name="name"
            {...register("name", { required: true, maxLength: 10 })}
          />
          {errors.name && errors.name.type === "required" && (
            <p>This name field is required</p>
          )}
          {errors.name && errors.name.type === "maxLength" && (
            <p>Your input exceed maximum length</p>
          )}
        </div>

        <div>
          <label>Password</label>
          <input
            name="password"
            type="password"
            {...register("password", { required: true, minLength: 6 })}
          />
          {errors.password && errors.password.type === "required" && (
            <p>This password field is required</p>
          )}
          {errors.password && errors.password.type === "minLength" && (
            <p>Password must have at least 6 characters</p>
          )}
        </div>

        <div>
          <label>Password Confirm</label>
          <input
            name="password_confirm"
            type="password"
            {...register("password_confirm", {
              required: true,
              validate: (value) => value === password.current,
            })}
          />
          {errors.password_confirm &&
            errors.password_confirm.type === "required" && (
              <p>This password confirm field is required</p>
            )}
          {errors.password_confirm &&
            errors.password_confirm.type === "validate" && (
              <p>The passwords do not match</p>
            )}

          {errorFromSubmit && <p>{errorFromSubmit}</p>}
        </div>
        <div>
          <input type="submit" disabled={loading} />
        </div>
      </form>
      <div>
        <div>Already have an account?</div>
        <Link style={{ color: "gray", textDecoration: "none" }} to="/login">
          Login{" "}
        </Link>
      </div>
    </div>
  );
}

export default RegisterPage;
