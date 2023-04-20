import React from 'react'
import TypingText from './TypingText';
import styled from 'styled-components';

const Badge = styled.div` 
  width: 40px;
  height: 40px;
  border-radius: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 0 0 auto;
  color: white;
  font-size: 12px;
`

type MessageProps = {
  message: string;
  role: string;
  userName: string;
};

const Message = ({ message, role = 'user', userName }: MessageProps) => {
  return (
    <div className={`flex whitespace-pre-line p-6 ${role == 'user' ? 'bg-slate-100' : 'bg-gray-200'}`}>
      <Badge className={`mr-4 ${role == 'user' ? 'bg-cyan-800' : 'bg-rose-800'}`}>{role == 'user' ? userName?.slice(0, 2) : 'GPT'}</Badge>
      <div>{role == 'user' ? message : <TypingText text={message} typingSpeed={5} />}</div>
    </div>
  )
}

export default Message