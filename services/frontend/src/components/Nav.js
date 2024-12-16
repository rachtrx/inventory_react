import {
    Flex,
    Menu
  } from '@chakra-ui/react';
import NavButton from "./buttons/NavButton";
import { MdDashboard, MdHistory, MdWork, MdPeople, MdAccountCircle, MdUsb, MdEvent } from 'react-icons/md'; // react-icons
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { useCallback } from 'react';
import authService from '../services/AuthService';
import { useUI } from '../context/UIProvider';
import { useTheme } from "next-themes";

const Nav = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const linkHoverColor = theme === "dark" ? "gray.800" : "white";
  const {handleDevError} = useUI();

  return (
    <Flex
      as="nav"
      className="user-nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      padding="1.5rem"
      bg={theme === "dark" ? "gray.900" : "gray.50"}
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
        <NavButton next={handleDevError} icon={<MdEvent />} label="Reservations" />
      </Menu>

      <Menu>
        <NavButton next={() => navigate('/profile')} icon={<MdAccountCircle />} label="Profile" />
      </Menu>

    </Flex>
  );
};

export default Nav;