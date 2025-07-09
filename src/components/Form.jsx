import React, { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  forgotPass,
  login,
  register,
  resetPass,
  sendOtp,
} from "../services/operations/auth";
import { useNavigate, useSearchParams } from "react-router";
import BeatLoader from "react-spinners/ClipLoader";
import { ReactComponent as UserIcon } from "../assets/user-svgrepo-com.svg";
import { ReactComponent as EyeIcon } from "../assets/eye-svgrepo-com.svg";
import { ReactComponent as EyeOffIcon } from "../assets/eye-off-svgrepo-com.svg";
import { ReactComponent as PassIcon } from "../assets/unlock-alt-svgrepo-com.svg";
import { ReactComponent as EmailIcon } from "../assets/email-svgrepo-com.svg";

const Form = ({ type }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [user, setUser] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const { loading } = useSelector((state) => state.auth);
  const loginData = useSelector((state) => state.loginData);
  const [searchParams] = useSearchParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    let isValid = true;

    if (type === "register") {
      if (
        username === "" ||
        email === "" ||
        password === "" ||
        confirmPassword === ""
      ) {
        toast.error("All fields are required");
        isValid = false;
        return;
      }
      if (
        username.length < 5 ||
        !/[A-Z]/.test(username) ||
        !/[0-9]/.test(username)
      ) {
        toast.error(
          <div className="">
            {username.length < 5 && "Username should be at least 5 characters"}
            {!/[A-Z]/.test(username) && (
              <div>
                {" "}
                <br /> Username should contain at least 1 uppercase letter{" "}
              </div>
            )}
            {!/[0-9]/.test(username) && (
              <div>
                {" "}
                <br /> Username should contain at least 1 number{" "}
              </div>
            )}
          </div>
        );
        isValid = false;
        return;
      }

      if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        toast.error("Please enter a valid email address", {
          duration: 3000,
        });
        isValid = false;
        return;
      }

      if (
        password.length < 8 ||
        !/[A-Z]/.test(password) ||
        !/[a-z]/.test(password) ||
        !/[0-9]/.test(password) ||
        !/[^A-Za-z0-9]/.test(password)
      ) {
        toast.error(
          <div>
            {password.length < 8 && <div>Password should be 8 char</div>}
            {!/[A-Z]/.test(password) && (
              <div>
                <br />
                Password should have at least one uppercase letter
              </div>
            )}
            {!/[a-z]/.test(password) && (
              <div>
                <br />
                Password should have at least one lowercase
              </div>
            )}
            {!/[0-9]/.test(password) && (
              <div>
                <br />
                Password should have at least one number
              </div>
            )}
            {!/[^A-Za-z0-9]/.test(password) && (
              <div>
                <br />
                Password should have at least one special character
              </div>
            )}
          </div>,
          {
            duration: 7000,
          }
        );
        isValid = false;
        return;
      }

      // Confirm password check
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        isValid = false;
        return;
      }

      if (!isValid) return;
      // console.log("username", username, "password", password, "email", email);

      const userData = {
        username,
        email,
        password,
      };
      // console.log("data: ", userData);
      dispatch(sendOtp(userData, navigate));
    } else if (type === "otp") {
      const userData = {
        username: loginData.username,
        email: loginData.email,
        password: loginData.password,
        otp: otp,
      };
      dispatch(register(userData, navigate));
    } else if (type === "forgot") {
      dispatch(forgotPass({ email }));
    } else if (type === "reset") {
      if (password === "" || confirmPassword === "") {
        toast.error("All fields are required");
        isValid = false;
        return;
      }

      if (
        password.length < 8 ||
        !/[A-Z]/.test(password) ||
        !/[a-z]/.test(password) ||
        !/[0-9]/.test(password) ||
        !/[^A-Za-z0-9]/.test(password)
      ) {
        toast.error(
          <div>
            {password.length < 8 && <div>Password should be 8 char</div>}
            {!/[A-Z]/.test(password) && (
              <div>
                <br />
                Password should have at least one uppercase letter
              </div>
            )}
            {!/[a-z]/.test(password) && (
              <div>
                <br />
                Password should have at least one lowercase
              </div>
            )}
            {!/[0-9]/.test(password) && (
              <div>
                <br />
                Password should have at least one number
              </div>
            )}
            {!/[^A-Za-z0-9]/.test(password) && (
              <div>
                <br />
                Password should have at least one special character
              </div>
            )}
          </div>,
          {
            duration: 7000,
          }
        );
        isValid = false;
        return;
      }

      // Confirm password check
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        isValid = false;
        return;
      }

      if (!isValid) return;
      const token = searchParams.get("token");
      dispatch(resetPass({ token, newPassword: password }, navigate));
    } else {
      const userData = {
        user,
        password,
      };
      dispatch(login(userData, navigate));
    }
  };

  return (
    <div>
      <form
        className="flex flex-col mx-auto py-8 px-3 gap-4"
        onSubmit={handleSubmit}
      >
        {type === "login" && (
          <div className="max-h-16 items-center rounded-2xl w-full bg-white flex md:pl-4">
            <UserIcon className="h-16 w-8" fill="currentColor" />
            <input
              placeholder="Username or Email"
              type="text"
              onChange={(e) => setUser(e.target.value)}
              value={user}
              className="outline-none h-full px-2 rounded-3xl w-full"
            />
          </div>
        )}

        {type === "otp" && (
          <label className="max-h-16 items-center rounded-2xl w-full bg-white flex md:pl-4">
            <PassIcon
              className="h-16 w-8 text-transparent"
              fill="currentColor"
            />

            <input
              placeholder="Enter the OTP"
              type="text"
              onChange={(e) => setOtp(e.target.value)}
              value={otp}
              className="outline-none h-full px-2 rounded-3xl w-full"
            />
          </label>
        )}

        {type === "register" && (
          <>
            <label className="max-h-16 items-center rounded-2xl w-full bg-white flex md:pl-4">
              <UserIcon className="h-16 w-8" fill="currentColor" />

              <input
                placeholder="Create Username"
                type="text"
                onChange={(e) => setUsername(e.target.value)}
                value={username}
                className="outline-none h-full px-2 rounded-3xl w-full"
              />
            </label>
            <label className="max-h-16 items-center rounded-2xl w-full bg-white flex md:pl-4">
              <EmailIcon
                className="h-16 w-8 text-transparent"
                fill="currentColor"
              />

              <input
                placeholder="Enter your email"
                type="text"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className="outline-none h-full px-2 rounded-3xl w-full"
              />
            </label>
          </>
        )}

        {type === "forgot" && (
          <label className="max-h-16 items-center rounded-2xl w-full bg-white flex md:pl-4">
            <EmailIcon
              className="h-16 w-8 text-transparent"
              fill="currentColor"
            />

            <input
              placeholder="Enter your email"
              type="text"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="outline-none h-full px-2 rounded-3xl w-full"
            />
          </label>
        )}

        {(type === "register" || type === "login" || type === "reset") && (
          <label className="max-h-16 items-center rounded-2xl w-full bg-white flex md:pl-4 relative">
            <PassIcon className="h-16 w-8 text-white" fill="currentColor" />
            <input
              placeholder={
                type === "register" ? "Enter a password" : "Password"
              }
              type={showPassword ? "text" : "password"}
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="outline-none h-full px-2 rounded-3xl w-full"
            />
            <div
              onClick={() => setShowPassword(!showPassword)}
              className="absolute md:right-5 right-2 cursor-pointer select-none"
            >
              {showPassword ? (
                <EyeOffIcon width={25} height={25} />
              ) : (
                <EyeIcon width={25} height={25} />
              )}
            </div>
          </label>
        )}
        {type === "register" ||
          (type === "reset" && (
            <label className="max-h-16 items-center rounded-2xl w-full bg-white flex md:pl-4 relative">
              <PassIcon className="h-16 w-8 text-white" fill="currentColor" />
              <input
                placeholder="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
                className="outline-none h-full px-2 rounded-3xl w-full"
              />
              <div
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute md:right-5  right-2 cursor-pointer select-none"
              >
                {showConfirmPassword ? (
                  <EyeOffIcon width={25} height={25} />
                ) : (
                  <EyeIcon width={25} height={25} />
                )}
              </div>
            </label>
          ))}

        {type === "login" && (
          <div
            onClick={() => navigate("/forgot-password")}
            className="w-full flex flex-row-reverse"
          >
            <p className="text-[#855aff] px-2 cursor-pointer">
              Forgot Password?
            </p>
          </div>
        )}

        {loading ? (
          <div className="w-full text-center mt-16">
            <BeatLoader color="#855aff" />
          </div>
        ) : (
          <div className="flex flex-col w-full mt-16 items-center">
            {type === "login" ? (
              <div
                className="px-6 py-3 w-full text-center cursor-pointer bg-black border-2 border-[#855aff] text-white text-lg font-semibold rounded-xl"
                onClick={() => navigate("/register")}
              >
                New User?
              </div>
            ) : (
              <div
                className="px-6 py-3 w-full text-center cursor-pointer bg-black border-2 border-[#855aff] text-white text-lg font-semibold rounded-xl"
                onClick={() => navigate("/login")}
              >
                Already have an account?
              </div>
            )}
            <button
              type="submit"
              className="px-6 py-4 w-full bg-[#855aff] text-white text-lg font-semibold rounded-xl mt-4"
            >
              {type === "login"
                ? "Login Now"
                : type === "register" || type === "otp"
                ? "Register Now"
                : "Reset Password"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Form;
