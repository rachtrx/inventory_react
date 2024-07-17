import {
    Flex,
    Menu,
    useColorModeValue,
  } from '@chakra-ui/react';
import NavButton from "./buttons/NavButton";
import IconNav from '../pages/components/icons/IconNav';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

function Nav() {

  let navigate = useNavigate();
  const { logout } = useAuth()

  const linkHoverColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  
  return (
      <Flex as="nav" className="user-nav" align="center" justify="space-between" wrap="wrap" padding="1.5rem" bg={useColorModeValue('gray.50', 'gray.900')} color={linkHoverColor}>
      <Menu>
        <NavButton next={() => navigate("/dashboard")} icon={<IconNav name="icon-laptop"/>} label="Home" />
      </Menu>

      <Menu>
        <NavButton next={() => navigate("/history")} icon={<IconNav name="icon-laptop"/>} label="History" />
      </Menu>

      <Menu>
        <NavButton next={() => navigate("/assets")} icon={<IconNav name="icon-laptop"/>} label="Assets" />
      </Menu>

      <Menu>
        <NavButton next={() => navigate("/users")} icon={<IconNav name="icon-user"/>} label="Users" />
      </Menu>

      <Menu>
        <NavButton next={logout} icon={<IconNav name="icon-cog"/>} label="Logout" />
      </Menu>
    </Flex>
  )
}

export default Nav;