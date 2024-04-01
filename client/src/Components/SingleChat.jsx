import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { ChatState } from '../Context/ChatProvider'
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { getSender, getSenderFull } from '../config/ChatLogics';
import ProfileModel from './Miscellaneous/ProfileModel';
import UpdateGroupChatModel from './Miscellaneous/UpdateGroupChatModel';
import animationData from "../Animination/typing.json";


import './styles.css';
import ScrollableChat from './ScrollableChat';
import io from "socket.io-client";
import Lottie from "react-lottie";
const ENDPOINT = "http://localhost:8080";
var socket, selectedChatCompare;



const SingleChat = ({ fetchAgain, setFetchAgain }) => {
     
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [istyping, setIsTyping] = useState(false);

    


    const toast = useToast();
    
      const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
    
    
    const { user, selectedChat, setSelectedChat,notification,setNotification } = ChatState();
    
    const fetchMessages = async () => {
        if (!selectedChat) return;

        try {
            const config = {
                headers: {
                    
                    Authorization: `Bearer ${user.token}`,
                },
                   
            };
            
            setLoading(true);

            const { data } = await axios.get(`http://localhost:8080/api/message/${selectedChat._id}`,
                config
            );
            
            setMessages(data);
            setLoading(false);
            socket.emit("join chat", selectedChat._id);

        } catch (error) {
            toast({
                    
                title: "Error Occured!",
                description: "Failed to Load Messages",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
        
            });
        }
    };

  


    const sendMessage = async (event) => {
        if (event.key === "Enter" && newMessage) {
            socket.emit("stop typing", selectedChat._id);

            try {
                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                   
                };
                setNewMessage("");
                
                const { data } = await axios.post("http://localhost:8080/api/message", {
                    content: newMessage,
                    chatId: selectedChat._id,
                },
                    config
                );

                socket.emit('new message', data);

                
                setMessages([...messages, data]);


            } catch (error) {
             
                toast({
                    
                    title: "Error Occured!",
                    description: "Failed to Send Message",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
        
                });
            }
        }
    };

  
useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));
      socket.on("typing", () => setIsTyping(true));
      socket.on("stop typing", () => setIsTyping(false));

    }, []);

    useEffect(() => {
        fetchMessages();
        selectedChatCompare = selectedChat;

    }, [selectedChat]);

    

    useEffect(() => {
        socket.on("message recieved", (newMessageRecieved) => {
            if (!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id) {
                setNotification([newMessageRecieved, ...notification]);
                setFetchAgain(!fetchAgain);

            } else {
                setMessages([...messages, newMessageRecieved]);
            }
        });
    });


     const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };


    return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            align="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {messages &&
              (!selectedChat.isGroupChat ? (
                <>
                  {getSender(user, selectedChat.users)}
                  <ProfileModel
                    user={getSenderFull(user, selectedChat.users)}
                  />
                </>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModel
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              ))}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#144058"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl
              onKeyDown={sendMessage}
              id="first-name"
              isRequired
              mt={3}
            >
              {istyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
               
                    width={120}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )}
              <Input
                variant="filled"
                  bg="#CEE6F2"
                  color="white"
                placeholder="Enter a message.."
                value={newMessage}
                onChange={typingHandler}
              />
            </FormControl>
          </Box>
        </>
      ) : (
  
        <Box display="flex" align="center" justifyContent="center" h="100%">
          <Text fontSize="3xl" pb={3} >
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};
export default SingleChat
