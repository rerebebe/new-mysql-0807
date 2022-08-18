import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert } from "react-bootstrap";
import Axios from "axios";
import Modal2 from "../ToDoList/Modal2";
import { API_HOST } from "../constants";
import { LoginContext } from "../Context/LoginContext";

const Register = () => {
  const [usernameReg, setUsernameReg] = useState("");
  const [passwordReg, setPasswordReg] = useState("");
  // const usernameRef = useRef();
  // const passwordRef = useRef();
  // const confirmpasswordRef = useRef();
  const [confirmpasswordReg, setConfirmpasswordReg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { loginState, setLoginState } = useContext(LoginContext);

  const register = async (e) => {
    e.preventDefault();
    if (passwordReg !== confirmpasswordReg) {
      return setError("Passwords do not match");
    }
    const response = await Axios.post(`${API_HOST}/register`, {
      username: usernameReg,
      password: passwordReg,
    });
    try {
      console.log(response);
      setIsOpen(true);
    } catch (error) {
      console.log(error);
      alert("wrong!!!");
    }
  };

  // const register = async (e) => {
  //   e.preventDefault();
  //   if (passwordRef.current.value !== confirmpasswordRef.current.value) {
  //     return setError("Passwords do not match");
  //   }
  //   try {
  //     setError("");
  //     setLoading(true);
  //     const user = await createUserWithEmailAndPassword(
  //       auth,
  //       emailRef.current.value,
  //       passwordRef.current.value
  //     );
  //     console.log(user);
  //     navigate("/");
  //   } catch (error) {
  //     console.log(error.message);
  //   }
  //   setLoading(false);
  // };

  // const logout = async (e) => {
  //   await signOut(auth);
  // };

  return (
    <div className="loginSignUpTab">
      <div className="loginTab">
        <h1 className="Title">Sign Up</h1>

        {error && <Alert className="AlertMessage">{error}</Alert>}
        <form>
          <label htmlFor="username">User Name:</label>
          <input
            className="loginTabInput"
            onChange={(e) => {
              setUsernameReg(e.target.value);
            }}
            type="text"
            name="username"
            required
          ></input>
          <label htmlFor="password">Password:</label>
          <input
            className="loginTabInput"
            onChange={(e) => {
              setPasswordReg(e.target.value);
            }}
            type="password"
            name="password"
            required
          ></input>
          <label htmlFor="confirmpassword">Confirm Password:</label>
          <input
            className="loginTabInput"
            onChange={(e) => {
              setConfirmpasswordReg(e.target.value);
            }}
            type="password"
            name="confirmpassword"
            required
          ></input>
          <button
            onClick={register}
            disabled={usernameReg && passwordReg !== null ? false : true}
            className="loginTabButton"
          >
            Sign Up
          </button>
          <Link to="/">
            <div>
              <u>Already have an account?</u>
            </div>
          </Link>
        </form>
      </div>
      <Modal2 isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
};

export default Register;
