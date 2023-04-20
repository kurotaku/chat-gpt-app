import { useEffect, useState, useRef, ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { useSession } from "next-auth/react"
import axios from 'axios';
import Message from '../components/chat/Message';
import { Btn } from '../components/button/Button';
import { TextArea } from '../components/form/Input';
import Roading from '../components/form/Roading';
import fetchCurrentUser from '../utils/fetchCurrentUser';

function autosize(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 4 + 'px';
}

interface ChatUIProps {
  currentUser: any;
  chatId: number;
  onChatUpdated: () => void;
}

const ChatUI: React.FC<ChatUIProps> = ({ currentUser, chatId, onChatUpdated }) => {
  const { data: session } = useSession()
  const [user, setUser] = useState(currentUser);
  const [currentChatId, setCurrentChatId] = useState(chatId);
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

  useEffect(() => {
    const getUser = async () => {
      const fetchedUser = await fetchCurrentUser(session);
      setUser(fetchedUser);
    };
    user || getUser();

    const fetchMessages = async () => {
      const response = await axios.get(`/api/messages/${chatId}`);
      const newArray = response.data.map(data => {
        return {
          role: data.role,
          content: data.content,
          userName: data.user.name,
          createdAt: data.createdAt
        };
      });
      setMessages(newArray);
    }
    if (chatId) fetchMessages();
  }, [session]);

  const onSubmit = async (data) => {
    try{
      setLoading(true);

      const inputText: string = message;

      setMessage('');
      
      if (textAreaRef.current) {
        textAreaRef.current.style.height = 'initial';
      }
      
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "user", content: inputText }
      ])
      const responce = await axios.post('/api/chatgpt', { messages: [...messages, { role: "user", content: inputText }] }, { withCredentials: true });
      
      setMessages((prevMessages) => [
        ...prevMessages,
        responce.data
      ]);

      // 保険としてchatId入れてる
      let newChatId: number = chatId;

      // 新規Chatの際の処理
      if(messages.length == 0){
        const chatData = {
          name: inputText.slice( 0, 100 ),
        };
        const createChat = await axios.post('/api/chats', 
                                  chatData,
                                  {withCredentials: true}
                                );
        newChatId = createChat.data.id;
        setCurrentChatId(newChatId);
      }

      setCurrentChatId(newChatId);
      console.log('newChatId', newChatId);

      await axios.post(`/api/messages/${currentChatId || newChatId}`, {role: "user", content: inputText}, { withCredentials: true });
      await axios.post(`/api/messages/${currentChatId || newChatId}`, {...responce.data}, { withCredentials: true });

      onChatUpdated();
      
      setLoading(false);
      reset();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      {messages.length == 0 && <h1 className="text-center font-medium">{user?.name}さん。ChatGPTに質問してください</h1>}
      <div className="mb-6">
        {messages.map((message, index) => (
          <Message key={index} message={message.content} role={message.role} userName={message.userName || user.name} saved={!!message.createdAt}/>
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
