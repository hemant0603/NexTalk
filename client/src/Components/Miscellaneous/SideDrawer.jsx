import { Box, Button, Text } from '@chakra-ui/react';
import { Menu, MenuButton, MenuDivider, MenuItem, MenuList } from "@chakra-ui/menu";
import { Avatar } from "@chakra-ui/avatar";
import { useDisclosure } from "@chakra-ui/hooks";
import { Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, } from "@chakra-ui/modal";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/toast";
import { Input } from "@chakra-ui/input";
import { Spinner } from "@chakra-ui/spinner";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Tooltip } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { ChatState } from "../../Context/ChatProvider";
import React from 'react'
import UserListItem from '../userAvatar/UserListItem';
import ChatLoading from '../ChatLoading';
import ProfileModel from './ProfileModel';
import { getSender } from '../../config/ChatLogics';

const SideDrawer = () => {

    const [search, setSearch] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);


  
  const { setSelectedChat, user , chats,setChats,notification,setNotification } = ChatState();
  const toast = useToast();
  const { isOpen,onOpen,onClose } = useDisclosure();
  const navigate = useNavigate();

const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`http://localhost:8080/api/user?search=${search}`, config);
        console.log(data);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
        console.log(error)
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };


  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
    window.location.reload();
   }

  const accessChat = async (userId) => {
   

    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`http://localhost:8080/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };
  
  
  return (
    <div>
      <Box
        display = "flex" 
        justifyContent= "space-between"
        align="center"
        bg="#CEE6F2"
        w="100%"
        p="5px 10px"
        
        borderWidth="5px"
        
      >
          <Tooltip
              label = 'Seach Users to Chat'
              hasArrow
              placement='bottom-end'
          >
              <Button variant='solid' onClick={onOpen} bg=" #6FC7E1" color="white" >
                  <i className="fa-solid fa-magnifying-glass"></i>
                  <Text display={{base : "none", md: "flex"}}  px= "4" > Search User</Text>
              </Button>
        </Tooltip>
         <Text fontSize="2xl" fontFamily="Work sans">
          NexTalk
        </Text>
        
          <div>
          <Menu>
            <MenuButton p={1}>
              
              <BellIcon fontSize="2xl" m={1} />
            </MenuButton>
            <MenuList pl={2}>
              {!notification.length && "No new Messages"}
              {notification.map((notif) => (
                <MenuItem key={notif._id} onClick={() => {
                  setSelectedChat(notif.chat);
                  setNotification(notification.filter((n) => n !== notif));

                }}
                >
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${getSender(user,notif.chat.users)}`}
                </MenuItem>
              ))}
           </MenuList>
              
          </Menu>
          <Menu>
            <MenuButton as={Button} bg=" #6FC7E1" rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList>
              
                <ProfileModel user = {user}>
                  <MenuItem>My Profile</MenuItem>
                </ProfileModel>
               
                <MenuDivider/>
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
        
      </Box>
       <Drawer placement='left'  onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent  bg=" #144058" color="white">
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export default SideDrawer
