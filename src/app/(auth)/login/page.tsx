"use client";
import { useAuthStore } from "@/store/Auth";
import { error } from "console";
import React from "react";

function LoginPage() {
    const {login} = useAuthStore();
    const [isLoading, setIsLoading] = React.useState(false);
    const [Error, setError] = React.useState("");

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get("email");
        const password = formData.get("password");

        if(!email || !password){
            setError(()=> "please fill out all the fields");
            return;
        }
        setIsLoading(true);
        setError("");
        const response = await login(email.toString(), password.toString());
        if (response.error) {
            setError(()=> response.error!.message);
        }
        setIsLoading(false);

    }
  return <div>Login</div>;
}
export default LoginPage;
