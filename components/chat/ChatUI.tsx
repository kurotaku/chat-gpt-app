import { useEffect, useState, useRef, ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import Message from './Message';
import { Btn } from '../button/Button';
import { TextArea } from '../form/Input';
import Roading from '../form/Roading';

function autosize(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 4 + 'px';
}

interface ChatUIProps {
  currentUser: any;
}

const ChatUI: React.FC<ChatUIProps> = ({ currentUser }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      handleSubmit(onSubmit)();
    }
  };

  const onSubmit = async (data) => {
    try{
      setLoading(true);

      const text: String = message;

      setMessage('');
      
      if (textAreaRef.current) {
        textAreaRef.current.style.height = 'initial';
      }
      
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "user", content: text }
      ])
      const response = await axios.post('/api/chatgpt', { messages: [...messages, { role: "user", content: text }] });

      setMessages((prevMessages) => [
        ...prevMessages,
        response.data
      ]);

      const chatData = {
        user: currentUser,
        name: text.slice( 0, 20 ),
      };
      await axios.get('/api/users/current-user');
      await axios.post("/api/chats", chatData), {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      };
      
      setLoading(false);
      reset();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      {messages.length == 0 && <h1 className="text-center font-medium">{currentUser.name}さん。ChatGPTに質問してください</h1>}
      <div className="mb-6">
        {messages.map((message, index) => (
          <Message key={index} message={message.content} role={message.role} />
        ))}
      </div>
      
      {isLoading && <Roading />}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex items-start px-8"
      >
        <TextArea
          {...register('message')}
          ref={textAreaRef}
          rows={1}
          placeholder="質問を入力してください"
          className="!max-w-full border-gray-200 focus:outline-none focus:border-cyan-600 mr-2"
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
            autosize(e.target)
            setMessage(e.target.value)
          }}
          onKeyDown={handleKeyDown}
          value={message}
          disabled={isLoading}
        />
        <Btn
          type="submit"
          className="!max-w-fit bg-cyan-900 text-white disabled:bg-gray-300"
          disabled={isLoading || message.length == 0}
        >
          {isLoading ? '回答待ち' : '送信'}
        </Btn>
      </form>
    </div>
  );
};

export default ChatUI;
