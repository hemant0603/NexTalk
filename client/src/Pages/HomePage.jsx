import React, { useEffect } from 'react';
import { Box, Container, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react";
import Login from '../Components/Authentication/Login';
import Signup from '../Components/Authentication/Signup';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        
        if (!userInfo) {
            navigate("/");
        }
    }, [navigate]);

    return (
        <Container maxW="xl" centerContent>
            <Box
                d="flex"
                justify="center"
                p={3}
                bg="radial-gradient(circle farthest-corner at 92.3% 71.5%, rgba(83,138,214,1) 0%, rgba(134,231,214,1) 90%)"
                w="100%"
                m="40px 0 15px 0"
                borderRadius="lg"
                borderWidth="1px"
            >
                <Text fontSize="4xl" align="center">
                    NexTalk
                </Text>
            </Box>
            <Box bg="white" w="100%" p={4} borderRadius="lg" borderWidth="0px" backgroundImage="radial-gradient(circle farthest-corner at 92.3% 71.5%, rgba(83,138,214,1) 0%, rgba(134,231,214,1) 90%)" > 
                <Tabs isFitted variant='soft-rounded' colorScheme='green'>
                    <TabList mb="1em">
                        <Tab border="none">Login</Tab>
                        <Tab  border="none">Sign Up</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <Login />
                        </TabPanel>
                        <TabPanel>
                            <Signup />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>
        </Container>
    );
};

export default HomePage;
