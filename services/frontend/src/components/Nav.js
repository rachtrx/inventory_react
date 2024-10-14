import {
    Flex,
    Menu,
    useColorModeValue,
  } from '@chakra-ui/react';
import NavButton from "./buttons/NavButton";
import { MdDashboard, MdHistory, MdWork, MdPeople, MdAccountCircle, MdUsb } from 'react-icons/md'; // react-icons
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { useCallback } from 'react';
import authService from '../services/AuthService';

const Nav = () => {
  const navigate = useNavigate();
  const linkHoverColor = useColorModeValue('gray.800', 'white');

  return (
    <Flex
      as="nav"
      className="user-nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      padding="1.5rem"
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={linkHoverColor}
    >
      <Menu>
        <NavButton next={() => navigate('/dashboard')} icon={<MdDashboard />} label="Home" />
      </Menu>

      <Menu>
        <NavButton next={() => navigate('/history')} icon={<MdHistory />} label="History" />
      </Menu>

      <Menu>
        <NavButton next={() => navigate('/assets')} icon={<MdWork />} label="Assets" />
      </Menu>
      
      <Menu>
        <NavButton next={() => navigate('/accessories')} icon={<MdUsb />} label="Accessories" />
      </Menu>

      <Menu>
        <NavButton next={() => navigate('/users')} icon={<MdPeople />} label="Users" />
      </Menu>

      <Menu>
        <NavButton next={() => navigate('/profile')} icon={<MdAccountCircle />} label="Profile" />
      </Menu>

    </Flex>
  );
};

export default Nav;