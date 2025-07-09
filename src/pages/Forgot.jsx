import React from "react";
import Form from "../components/Form";

const Forgot = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="md:w-[470px] shadow-2xl rounded-3xl border border-gray-300 p-4 bg-black">
        <h1 className="text-4xl font-bold text-start mt-4 text-white uppercase ml-3">
          Forgot Password
        </h1>
        <Form type={"forgot"} />
      </div>
    </div>
  );
};

export default Forgot;
