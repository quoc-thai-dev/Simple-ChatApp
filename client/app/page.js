"use client"
import { useEffect, useState, useRef } from "react"
import { Chat, Inputs, SignUp } from "@/components"
import { io } from "socket.io-client"

const socket = io("http://localhost:3001")
export default function Home() {
  const [input, setInput] = useState("")
  const user = useRef(null)
  const [chat, setChat] = useState([])
  const [typing, setTyping] = useState([])
  useEffect(() => {
    socket.on("recieve_message", (msg) => {
      setChat((prev) => [...prev, msg])
    })
    socket.on("new_user", (newUser) => {
      if (!user.current) return
      console.log(chat)
      setChat((prev) => [
        ...prev,
        { content: `${newUser} joined`, type: "server" },
      ])
    })
    socket.on("user_typing", (data) => {
      if (!user.current) return
      setTyping((prev) => {
        if (typing.includes(data.user) && data.typing === true) return prev
        if (data.typing === false) {
          return prev.filter((u) => u !== data.user)
        } else {
          return [...prev, data.user]
        }
      })
    })
    return () => {
      socket.off("recieve_message")
      socket.off("new_user")
      socket.off("user_typing")
    }
  }, [])
  return (
    <main className="h-screen max-h-screen max-w-screen mx-auto md:container md:p-20 md:pt-4">
      {user.current ? (
        <>
          <Chat user={user.current} chat={chat} typing={typing} />
          <Inputs setChat={setChat} user={user.current} socket={socket} />
        </>
      ) : (
        <SignUp user={user} socket={socket} input={input} setInput={setInput} />
      )}
    </main>
  )
}
