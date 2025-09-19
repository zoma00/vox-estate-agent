import React, {useState, useRef} from 'react'

export default function Chat(){
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const audioRef = useRef(null)

  async function send(){
    if(!input) return
    const userMsg = {role:'user', text: input}
    setMessages(m=>[...m,userMsg])

    try{
      // Send to chat backend using the correct endpoint and payload expected by FastAPI
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          text: input,
          generate_audio: true,
          open_urls: false,
          language: 'en'
        })
      })

      if(!res.ok){
        const errText = await res.text().catch(()=>res.statusText)
        throw new Error(`Chat API error: ${res.status} ${errText}`)
      }

      const j = await res.json()
      const botText = j?.text || 'No reply'
      const botMsg = {role:'bot', text: botText}
      setMessages(m=>[...m, botMsg])

      // Backend returns { audio_url: '/static/audio/...' } when generate_audio=true
      if(j?.audio_url){
        let audioUrl = j.audio_url
        // The backend serves /static directly. When accessing the dev site from another device
        // (mobile) we must point the audio URL to the backend host reachable from the mobile.
        if(audioUrl.startsWith('/')){
          const pageHost = window.location.hostname || '127.0.0.1'
          const backendHost = pageHost === 'localhost' ? '127.0.0.1' : pageHost
          const backendPort = '8000'
          audioUrl = `${window.location.protocol}//${backendHost}:${backendPort}${audioUrl}`
        }
        if(audioRef.current){
          audioRef.current.src = audioUrl
          audioRef.current.play().catch(()=>{})
        }
      }

    }catch(err){
      setMessages(m=>[...m,{role:'system', text: 'Error: '+String(err)}])
    } finally{
      setInput('')
    }
  }

  return (
    <div>
      <div className="card">
        <h2>Chat (mobile)</h2>
        <div style={{minHeight:120, maxHeight:300, overflow:'auto'}}>
          {messages.map((m,i)=> (
            <div key={i} style={{marginBottom:8}}>
              <strong>{m.role}</strong>: <span>{m.text}</span>
            </div>
          ))}
        </div>

        <div className="chat-input" style={{marginTop:8}}>
          <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Say something..." />
          <button className="btn" onClick={send}>Send</button>
        </div>
      </div>
      <audio ref={audioRef} hidden />
    </div>
  )
}
