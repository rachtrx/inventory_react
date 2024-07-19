import {
    Flex,
    Menu,
    useColorModeValue,
  } from '@chakra-ui/react';
import NavButton from "./buttons/NavButton";
import { MdDashboard, MdHistory, MdWork, MdPeople, MdLogout } from 'react-icons/md'; // react-icons
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

const Nav = () => {
  const navigate = useNavigate();
  const linkHoverColor = useColorModeValue('gray.800', 'white');
  const { logout } = useAuth() 

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
        <NavButton next={() => navigate('/users')} icon={<MdPeople />} label="Users" />
      </Menu>

      <Menu>
        <NavButton next={logout} icon={<MdLogout />} label="Logout" />
      </Menu>
    </Flex>
  );
};

export default Nav;