"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"


export default function AdminLogin(){

  const router = useRouter()

  const [password,setPassword] = useState("")


  function login(){

    if(password === "kangdarpet2026"){

      localStorage.setItem(
        "admin",
        "ok"
      )

      router.push("/admin")

    }else{

      alert("密码错误")

    }

  }


  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100">


      <div className="bg-white p-8 rounded-xl shadow-md w-[360px]">


        <h1 className="text-2xl font-bold text-center mb-6">

          KANGDARPET后台登录

        </h1>



        <input

          type="password"

          placeholder="输入管理员密码"

          value={password}

          onChange={(e)=>setPassword(e.target.value)}

          className="border p-3 w-full rounded mb-4"

        />



        <button

          onClick={login}

          className="bg-black text-white w-full p-3 rounded"

        >

          登录

        </button>


      </div>


    </div>

  )

}
